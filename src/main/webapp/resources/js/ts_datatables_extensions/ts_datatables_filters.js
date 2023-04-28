(function () {
    if (!window.dataTablesFilters) window.dataTablesFilters = function ($) {
        const DataTablesFilters = {};

        /**
         * Function to initialize column filters for a datatables instance.
         * @param table instance of datatables api.
         * @param customOptions any custom options passed to this datatables instance.
         */
        DataTablesFilters.initColumnFilters = function(table, customOptions) {
            // let t1 = performance.now();
            _createColumnFilters(table);

            // IMPORTANT! GSI 2020-07-06:
            // Materialize's select menu initialization NEEDS to be called before event handlers are created.
            // Otherwise, the method to restore filters, called within _createColumnFilterEventHandlers, will produce wrong results!
            _initMaterializeSelectMenus(table);

            _createSelectFilterPlaceholders(table);
            _createColumnFilterEventHandlers(table);

            if (_hasPresetFilters(customOptions)) {
                _setPreFilters(table);
            }

            _appendDynamicTooltips(table);
        }

        /**
         * Function to clear all column filters -> clears datatables API and html input fields.
         * @param table instance of datatables api.
         */
        DataTablesFilters.clearColumnFilters = function(table) {
            // let t1 = performance.now();
            table
                .columns(':not(.none):not(.never)')
                .every(function () {
                    this.search('');

                    let $footer = $(this.footer());

                    if ($footer.hasClass(dataTablesConstants.SELECT_ICON_FILTER_CLASS)) {       // Icon select filters can have an empty string as a filter value.
                        _setColumnFilterValueToInputFields(table, this, this.footer(), 'ts-reset');
                    } else {
                        _setColumnFilterValueToInputFields(table, this, this.footer(), '');
                    }
                });
            table.draw(false);
            // let t2 = performance.now();
            // console.log("perf click.erasefilter:              " + (t2 - t1) + "ms");
        }

        /**
         * Function to restore select filter. Called from _restoreColumnFilters(), but can be accessed from outside.
         * @param table instance of datatables api.
         * @param currentColumn instance of datatables column api.
         * @param storedValue search value stored in datatables state.
         */
        DataTablesFilters.restoreSelectFilter = function(table, currentColumn, storedValue) {
            let $selectFilter = $(currentColumn.footer()).find('select');

            $selectFilter.val(prepareSelectFilterValues(storedValue));

            if (currentColumn.visible()) {
                $selectFilter.removeAttr("ts-initialized");
                materializetool.initSelectElement($selectFilter);
                tsDataTableHandler.createPlaceHolderForFilter(table, currentColumn);
            }

            $selectFilter.trigger('change', [table, false]);
        }

        /**
         * Function to restore html escaped select filter. Called from _restoreColumnFilters(), but can be accessed from outside.
         * @param table instance of datatables api.
         * @param currentColumn instance of datatables column api.
         * @param storedValue search value stored in datatables state.
         */
        DataTablesFilters.restoreSelectFilterHtmlEscape = function(table, currentColumn, storedValue) {
            const $selectFilter = $(currentColumn.footer()).find('select');

            $selectFilter.val(prepareSelectFilterValues(storedValue));

            if (currentColumn.visible()) {
                $selectFilter.removeAttr("ts-initialized");
                materializetool.initSelectElement($selectFilter);
                tsDataTableHandler.createPlaceHolderForFilter(table, currentColumn);
            }

            $selectFilter.trigger('change', [table, false]);
        }

        /**
         * Prepares the passed values to be applied to the filter.
         *
         * @param filterValue String e.g. "a, b, c"
         * @returns {*}
         */
        function prepareSelectFilterValues(filterValue) {
            let filterValues = filterValue.split(",");

            filterValues.forEach((element, index) => {
                filterValues[index] = element.trim();
            })

            return filterValues;
        }

        /**
         * Function to restore boolean checkbox select filter. Called from _restoreColumnFilters(), but can be accessed from outside.
         * @param currentColumn instance of datatables column api.
         * @param storedValue search value stored in datatables state.
         */
        DataTablesFilters.restoreSelectFilterBooleanCheckbox = function(currentColumn, storedValue) {
            const $inputElement = $(currentColumn.footer()).find('input.select-dropdown');
            let $selectFilter = $(currentColumn.footer()).find('select');
            let searchValue = prepareSelectFilterValues(storedValue);

            $selectFilter.val(searchValue);
            _updateSelectFilterBooleanCheckboxInputFields($inputElement, searchValue);
        }

        /**
         * Restores the icon select filter of the passed column and triggers the search event.
         * @param table instance of datatables api.
         * @param currentColumn instance of datatables column api.
         * @param storedValue search value stored in datatables state.
         */
        DataTablesFilters.restoreSelectFilterIcon = function(table, currentColumn, storedValue) {
            const $colFooter = $(currentColumn.footer());
            const $selectFilter = $colFooter.find('select');            // Don't use selector with select-wrapper, because it doesn't exist if the field isn't initialized

            if ($selectFilter.length) {
                $selectFilter.removeAttr("ts-initialized");

                let $options = $selectFilter.find("option");
                let clearFilter = storedValue === "ts-reset"    // The stored value is set to "ts-reset" if the user clicked eraseAll

                if (clearFilter) {
                    $options.prop("selected", false);
                } else {
                    $options.toArray().forEach(option => {
                        let $option = $(option);

                        if ($option.hasClass("select-empty-option") && storedValue.includes("")) {
                            $option.prop("selected", true);
                        } else {
                            let trimmedText = $option.find(".icon-box-select > i").text().trim();       // Select just the icon texts. Make the selector more secure with adding a style class to the icon (filter-icon)

                            if (storedValue.includes(trimmedText)) {
                                $option.prop("selected", true);
                            }
                        }
                    })
                }

                if (currentColumn.visible()) {
                    materializetool.initSelectElement($selectFilter)
                    tsDataTableHandler.createPlaceHolderForFilter(table, currentColumn);
                } else {
                    $colFooter.prop("display-text", presetValues.join(", "));
                }

                $selectFilter.trigger("change", [currentColumn.table()]);
            }
        }

        /**
         * Function to handle orthogonal data in select filter.
         * @param column instance of datatables column api.
         * @param valArray array of search values for multi-search.
         */
        DataTablesFilters.processOrthogonalData = function(column, valArray) {
            column.nodes().each(function (node) {
                const attrVal = node.getAttribute('data-search');
                if (attrVal.indexOf('|') > 0) {
                    attrVal.split('|').forEach(function (elem) {
                        if (valArray.indexOf(elem) < 0) {
                            valArray.push(elem);
                        }
                    });
                } else if (valArray.indexOf(attrVal) < 0) {
                    valArray.push(attrVal);
                }
                valArray.sort();
            });
        }

        /**
         * Function to handle orthogonal sorting of cell data in select filter.
         * @param column instance of datatables column api.
         * @param valArray array of search values for multi-search.
         */
        DataTablesFilters.processOrthogonallySortedData = function(column, valArray) {
            let objArray = [];
            column.nodes().each(function (node) {
                const attrVal = node.innerText;
                const attrSortVal = node.getAttribute('data-sort');
                if (attrVal.indexOf('|') > 0) {
                    attrVal.split('|').forEach(function (elem) {
                        if (objArray.indexOf(elem) < 0) {
                            objArray.push(elem);
                        }
                    });
                } else if (valArray.indexOf(attrVal) < 0) {
                    valArray.push(attrVal);
                    objArray.push({attrVal: attrVal, attrSortVal: attrSortVal});
                }
                objArray.sort(function compareFn(firstEl, secondEl) { return firstEl.attrSortVal - secondEl.attrSortVal });
            });
            return objArray.map(a => a.attrVal);
        }

        /**
         * Function to process values array to create options in select filters.
         * @param valArray array of possible search values of each cell in a column.
         * @param splitVal array of clean values of a cell.
         */
        DataTablesFilters.processFilterValuesArray = function(valArray, splitVal) {
            if (splitVal && splitVal.length === 1 && splitVal[0].length <= 0) { // = td is empty
                const v = splitVal[0].trim();
                if (!valArray.includes(v)) {
                    valArray.push(v);
                }
            } else if (splitVal) {
                splitVal.forEach(v => {
                    if (!valArray.includes(v.trim()) && v.trim().length > 0) {
                        valArray.push(v.trim());
                    }
                });
            }
            valArray.sort();
        }

        return DataTablesFilters;

        // *************************************************************************************************************
        // private functions

        /**
         * Function to check if table options contain preset filters.
         * @param customOptions any custom options passed to this datatables instance.
         * @returns {*}
         * @private
         */
        function _hasPresetFilters(customOptions) {
            return customOptions && customOptions.presetFilters;
        }

        /**
         * Function to create DOM elements for column filters.
         * @param table instance of datatables api.
         * @private
         */
        function _createColumnFilters(table) {
            table.columns(':not(.' + dataTablesConstants.NON_FILTERABLE + ')').every(function (idx) {
                let column = this;
                if (column) {
                    let filterCell = column.footer();

                    if (filterCell.classList.contains(dataTablesConstants.SELECT_FILTER_CLASS)) {
                        _createSelectFilter(filterCell, column);
                    } else if (filterCell.classList.contains(dataTablesConstants.SELECT_FILTER_HTML_ESCAPE_CLASS)) {
                        _createSelectFilterHtmlEscape(filterCell, column);
                    } else if (filterCell.classList.contains(dataTablesConstants.SELECT_ICON_FILTER_CLASS)) {
                        _createSelectFilterIcon(filterCell, column);
                    } else if (filterCell.classList.contains(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)) {
                        _createSelectFilterBooleanCheckbox(filterCell);
                    } else {
                        _createInputFilter(filterCell);
                    }
                    const $tfoot = $(filterCell).closest('tfoot');
                    if (!$tfoot.hasClass(dataTablesConstants.COLUMN_FILTER_GROUP_CLASS)) {
                        $tfoot.addClass(dataTablesConstants.COLUMN_FILTER_GROUP_CLASS);
                    }
                }
            });
            table.columns('.' + dataTablesConstants.NON_FILTERABLE).every(function (idx) {
                // clearing the column filter th for non-filterable columns
                $(this.footer()).html('');
            });
        }

        /**
         * Function to create placeholders in filter input fields.
         * @param table instance of datatables api.
         * @private
         */
        function _createSelectFilterPlaceholders(table) {
            table.columns(':not(.' + dataTablesConstants.NON_FILTERABLE + ')').every(function (idx) {
                const column = this;
                const filterCell = column.footer();
                if (filterCell.classList.contains(dataTablesConstants.SELECT_FILTER_CLASS)
                    || filterCell.classList.contains(dataTablesConstants.SELECT_ICON_FILTER_CLASS)
                    || filterCell.classList.contains(dataTablesConstants.SELECT_FILTER_HTML_ESCAPE_CLASS)) {
                    $(filterCell).find('input').attr('placeholder', dataTablesConstants.FILTER_PLACEHOLDER);
                } else if (filterCell.classList.contains(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)) {
                    const $inputElement =  $(filterCell).find('input.select-dropdown');
                    const $selectWrapper = $inputElement.closest('.select-wrapper');
                    const $checkboxIcon = $selectWrapper.find('.checkbox-icon');
                    if ($checkboxIcon.length <= 0) {
                        $selectWrapper.find('input').attr('placeholder', dataTablesConstants.FILTER_PLACEHOLDER);
                    }
                    $inputElement.val('');
                }
            });
        }

        /**
         * Appends dynamic tooltip to given select filters.
         *
         * @param table Current table
         * @private
         */
        function _appendDynamicTooltips(table) {
            table.columns(':not(.' + dataTablesConstants.NON_FILTERABLE + ')').every(function (idx) {
                const column = this;
                const $filterCell = $(column.footer());

                if ($filterCell.hasClass(dataTablesConstants.SELECT_FILTER_CLASS)
                    || $filterCell.hasClass(dataTablesConstants.SELECT_FILTER_HTML_ESCAPE_CLASS)) {
                    let $input = $filterCell.find("input");

                    $input.addClass(["tooltipped", "dynamic"]);
                    $input.attr("data-position", "bottom");
                }
            });
        }

        /**
         * Function to initialize select menus in filter fields.
         * @param table instance of datatables api.
         * @private
         */
        function _initMaterializeSelectMenus(table) {
            let wrapperId = materializetool.escapejsfid(table.containers().to$().attr("id"));
            $('#' + wrapperId + ' select:not(:data(uiSelectmenu),.no-materialize)').each(function(index, selectElement) {
                materializetool.initSelectElement(selectElement);
            });
        }

        /**
         * Event function for the default select filters (select-filter and select-filter-html-escape).
         * @param column instance of datatables column api.
         * @param $selectField jQuery object of the select menu DOM element.
         * @param resetPage parameter to determine, how the table is drawn after filter change. Can be true, false, or 'page', as per https://datatables.net/reference/api/draw().
         * @private
         */
        function _executeDefaultSelectFilterChangeEvent(column, $selectField, resetPage) {

            if (column && $selectField instanceof jQuery) {
                let $footerField = $selectField.parents("td");

                // get the value of the select menu
                let data = $selectField.val();

                // if no data selected use ""
                if (data.length === 0) {
                    data = [""];
                }

                let val;
                // escape all potential regex values and add regex for exact matches
                for (let i = 0; i < data.length; i++) {
                    if (data[i] !== '' && data[i] !== '^$') { // no escape for explicit empty string search
                        data[i] = _escapeRegExp(data[i]);
                        // concat regex to find exact matches in SELECT_FILTER_HTML_ESCAPE
                        if ($footerField.hasClass(dataTablesConstants.SELECT_FILTER_HTML_ESCAPE_CLASS)) {
                            //data[i] = '(?<!<\\/?[^>]*|&[^;]*)(\\b'
                            //    .concat(data[i])
                            //    .concat('\\b)');

                            data[i] = '(?<!<\\/?[^>]*|&[^;]*)('
                                .concat(data[i])
                                .concat(')');
                        }
                    }
                }
                val = data.join('|');
                if ($footerField.hasClass(dataTablesConstants.SELECT_FILTER_CLASS)) {
                    // join array into string with regex or (|) and regex for exact match (^$)
                    val = data.join('$|^');
                    if (val.length > 0) {
                        val = '^'.concat(val).concat('$');
                    }
                }

                // apply search
                column
                    .search(val ? val : '', true, false)
                    .draw(resetPage);

            } else {
                console.error("The parameters are invalid", column, $selectField);
            }
        }

        /**
         * Event function for the icon select filters (select-filter-icon).
         * @param column instance of datatables column api.
         * @param $selectField jQuery object of the select menu DOM element.
         * @param resetPage parameter to determine, how the table is drawn after filter change. Can be true, false, or 'page', as per https://datatables.net/reference/api/draw().
         * @private
         */
        function _executeIconSelectFilterChangeEvent(column, $selectField, resetPage) {
            if (column && $selectField instanceof jQuery) {
                const $footer = $selectField.parents("td");
                const $inputElement = $selectField.parent().find('input.select-dropdown');
                const emptyCellRegex = "^$"

                let val = '';               // Concatenated search string
                let displayText = '';       // Text displayed in the input field
                let data = $selectField.val();

                let obj = {searchValues: [], displayTexts: []};

                for (let i = 0; i < data.length; i++) {
                    let searchValue;

                    try {
                        let passedObject = JSON.parse(data[i]);
                        searchValue = passedObject.searchValue ? passedObject.searchValue : "";

                        if (searchValue.length || passedObject === emptyCellRegex) {
                            obj.searchValues.push(searchValue);

                            displayText = passedObject.displayText ? passedObject.displayText : searchValue;

                            obj.displayTexts.push(displayText.trim());
                        } else {
                            console.error("Search value is empty. Data at " + i, data[i]);
                        }
                    } catch (e) {
                        console.error("Couldn't parse the data to JSON, " + e);
                    }
                }

                if (obj.searchValues.length) {
                    val += obj.searchValues.join('|');
                    displayText = obj.displayTexts.join(", ");

                    _changeLayoutSelectIconFilterEmpty($footer, false);

                    $inputElement.val(displayText);
                } else {
                    _changeLayoutSelectIconFilterEmpty($footer, true);

                    $inputElement.val('');
                }

                // apply search
                column
                    .search(val ? val : '', true, false)
                    .draw(resetPage);

                //focus event is triggered after filter event, after that event you can set the value (icon) of the input field
                $inputElement
                    .off(".onFilterInput")
                    .on({
                        'click.onFilterInput': function (event) {
                            let target = $(event.target);

                            if (target.length) {
                                let updatedText = displayText.length === 0 ? target.find("input").attr('placeholder') : displayText;
                                target.val(updatedText);
                                return false;
                            }

                        }
                    });
            } else {
                console.error("The parameters are invalid", column, $selectField);
            }
        }

        /**
         * Event function for the boolean checkbox select filters (select-filter-boolean-checkbox).
         * @param column instance of datatables column api.
         * @param $selectField jQuery object of the select menu DOM element.
         * @param resetPage parameter to determine, how the table is drawn after filter change. Can be true, false, or 'page', as per https://datatables.net/reference/api/draw().
         * @private
         */
        function _executeBooleanCheckBoxFilterChangeEvent(column, $selectField, resetPage) {
            if (column && $selectField instanceof jQuery) {
                const $inputElement = $selectField.parent().find('input.select-dropdown');
                const searchValue = $selectField.val();
                const val = (searchValue.length > 0) ? ('^' + searchValue + '$') : ('');

                _updateSelectFilterBooleanCheckboxInputFields($inputElement, searchValue);

                column
                    .search(val, true, false)
                    .draw(resetPage);
            } else {
                console.error("The parameters are invalid", column, $selectField);
            }
        }

        /**
         * Function to add event handlers for column filters.
         * @param table instance of datatables api.
         * @private
         */
        function _createColumnFilterEventHandlers(table) {
            if (!window.filterEventHandlersSet) {
                _initSelectChangeEventHandler();
                _setSelectMenuDisplayText();
                _initInputFieldChangeEventHandler();
                window.filterEventHandlersSet = true;
            }
            _restoreColumnFilters(table);
        }

        /**
         * Function to initialize delegated event listener for select menu changes.
         * @private
         */
        function _initSelectChangeEventHandler() {
            /**
             * Executes the associated filter functions
             * @param tableApi It is possible to pass the data table api element when the 'change' event is triggered.
             * If this value is not set, materializetool.tables[dataTablesSelector].table is used to select the table api.
             * @param resetPage parameter to determine, how the table is drawn after filter change. Can be true, false, or 'page', as per https://datatables.net/reference/api/draw().
             */
            $('body')
                .off(".dtFilterChange")
                .on("change.dtFilterChange", "tfoot .select-wrapper > select", function(event, tableApi, resetPage) {
                    // let t1 = performance.now();
                    const $selectElement = $(event.target);

                    if (!$selectElement.hasClass("block-events")) {
                        const $footerField = $selectElement.closest('td');
                        const $tableElement = $footerField.closest('table');
                        const dataTablesSelector = $tableElement.attr("datatable-selector");
                        const table = _determineTableApi(tableApi, dataTablesSelector);

                        resetPage = _checkAndSetResetPageDefault(resetPage, $selectElement);

                        const column = tsDataTableHandler.getColumnByFooter(table, $footerField);

                        if (column) {
                            if ($footerField.hasClass(dataTablesConstants.SELECT_FILTER_CLASS) ||
                                $footerField.hasClass(dataTablesConstants.SELECT_FILTER_HTML_ESCAPE_CLASS)) {
                                _executeDefaultSelectFilterChangeEvent(column, $selectElement, resetPage);
                            } else if ($footerField.hasClass(dataTablesConstants.SELECT_ICON_FILTER_CLASS)) {
                                _executeIconSelectFilterChangeEvent(column, $selectElement, resetPage);
                            } else if ($footerField.hasClass(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)) {
                                _executeBooleanCheckBoxFilterChangeEvent(column, $selectElement, resetPage);
                            }

                            _selectLastPageOfTableIfCurrentPageUnavailable(table);
                        } else {
                            console.warn("Couldn't find matching column for footer", $footerField);
                        }
                    }
                })
        }

        /**
         * Create event handler to set the display text in select filters.
         * @private
         */
        function _setSelectMenuDisplayText() {
            $('body')
                .off(".dtClickSelectDropdown")
                .on("click.dtClickSelectDropdown", "tfoot .select-wrapper > input.select-dropdown", function(event) {
                    const $inputField = $(event.target);
                    const $footer = $inputField.parents("td");

                    if ($footer.hasClass(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)) {
                        $inputField.val('');
                    }
                });
        }

        /**
         * Create event handler for the default filter field. This is a simple input field.
         * @private
         */
        function _initInputFieldChangeEventHandler() {
            $('body')
                .off(".dtKeyUpChange")
                .on("keyup.dtKeyUpChange change.dtKeyUpChange", "tfoot .column-filter-input", function(event, tableApi, resetPage) {
                    // let t1 = performance.now();
                    const $inputField = $(event.target);
                    const $footerField = $inputField.closest('td');
                    const $tableElement = $footerField.closest('table');
                    const table = _determineTableApi(tableApi, $tableElement.attr("datatable-selector"));
                    const column = tsDataTableHandler.getColumnByFooter(table, $footerField);
                    resetPage = _checkAndSetResetPageDefault(resetPage, $inputField);

                    if (column) {
                        column
                            .search($inputField.val())
                            .draw(resetPage);
                    }
                    _selectLastPageOfTableIfCurrentPageUnavailable(table);
                })
        }

        /**
         * Function to select the last page of the table, if the user filtered for a value which was deleted on change
         * event. It makes sure that the user isn't on a page which isn't accessible after the deletion.
         * @param table instance of datatables api.
         * @private
         */
        function _selectLastPageOfTableIfCurrentPageUnavailable(table) {
            const tablePageInfo = table.page.info();
            if (tablePageInfo.page >= tablePageInfo.pages) {
                table.page(tablePageInfo.pages - 1).draw(false);
            }
        }

        /**
         * Function to determine whether a provided table api can be used. If not, a valid table api will be selected.
         * @param table instance of datatables api.
         * @param dataTablesSelector value of datatable-selector attribute of a table DOM element, used as key in materializetool.tables map.
         * @returns {null|*}
         * @private
         */
        function _determineTableApi(table, dataTablesSelector) {
            if (typeof table !== "undefined") {
                return table;
            } else if (dataTablesSelector in materializetool.tables) {
                return materializetool.tables[dataTablesSelector].table;
            } else {
                console.error("No table object found for select change event");
                return null;
            }
        }

        /**
         * Function to determine if the current page should be reset on datatable's draw event.
         * @param resetPage parameter to determine, how the table is drawn after filter change. Can be true, false, or 'page', as per https://datatables.net/reference/api/draw().
         * @param $element jQuery object of calling DOM element. Usually an input field or select menu.
         * ATTENTION: this attribute currently is NEVER SET in this implementation of datatables.
         * @returns {string|boolean|*} default value for reset is true
         * @private
         */
        function _checkAndSetResetPageDefault(resetPage, $element) {
            if (typeof resetPage === "undefined") {
                if (typeof $element.attr(dataTablesConstants.ATTR_PAGE_RESET)  !== "undefined") {
                    if ($element.attr(dataTablesConstants.ATTR_PAGE_RESET) === "page") {
                        return "page";
                    } else {
                        return $element.attr(dataTablesConstants.ATTR_PAGE_RESET);
                    }
                } else {
                    return true;
                }
            } else {
                return resetPage
            }
        }

        /**
         * Function to create a regular input column filter.
         * @param filterField footer cell that will contain the filter.
         * @private
         */
        function _createInputFilter(filterField) {
            $(filterField).html('<div class="input-field column-filter-input"><input class="tooltipped dynamic" type="text" placeholder="' + dataTablesConstants.FILTER_PLACEHOLDER + '"/></div>');
        }

        /**
         * Function to create a multi-select column filter.
         * @param filterField footer cell that will contain the filter.
         * @param column instance of datatables column api to be processed by this filter.
         * @private
         */
        function _createSelectFilter(filterField, column) {
            const $select = $('<select multiple></select>')
                .appendTo($(filterField).empty());

            column.data().unique().sort().each(function (value, idx) {
                $select.append('<option value="' + value + '">' + value + '</option>');
            });
        }

        /**
         * Function to create a boolean select column filter.
         * @param filterField footer cell that will contain the filter.
         * @private
         */
        function _createSelectFilterBooleanCheckbox(filterField) {
            const $select = $('<select></select>')
                .appendTo($(filterField).empty());
            const searchItemZero = '';
            const searchItemOne = 'check_box_outline_blank';
            const searchItemTwo = 'check';
            $select.append('<option value=' + searchItemZero + '><i>' + tsMsg("de.techspring.common.datatables.custom.filters.select.no.selection.value") + '</i></option>');
            $select.append('<option value=' + searchItemOne + '><i class="material-icons">check_box_outline_blank</i></option>');
            $select.append('<option value=' + searchItemTwo + '><i class="material-icons">check</i></option>');
        }

        /**
         * Function to create a multi-select column filter that escapes HTML when creating select options.
         * @param filterField footer cell that will contain the filter.
         * @param column instance of datatables column api to be processed by this filter.
         * @private
         */
        function _createSelectFilterHtmlEscape(filterField, column) {
            let $select = $('<select multiple></select>')
                .appendTo($(filterField).empty());
            let valArray = [];

            const isOrthogonalData = column.nodes()[0].hasAttribute('data-search');

            if (isOrthogonalData) {
                dataTablesFilters.processOrthogonalData(column, valArray);
            } else {
                const isOrthogonalSort = column.nodes()[0].hasAttribute('data-sort');
                if (isOrthogonalSort) {
                    valArray = dataTablesFilters.processOrthogonallySortedData(column, valArray);
                } else {
                    column.data().unique().sort().each(function (value, idx) {
                        let splitVal = value
                            .replace(dataTablesConstants.REGEX_MATCH_LINE_BREAKS, "") // remove line breaks
                            .replace(dataTablesConstants.REGEX_MATCH_ICON_TAGS, '') // remove icons by their i tags
                            .split(dataTablesConstants.REGEX_MATCH_HTML_TAGS); // split at each remaining html tag

                        if(filterField.classList.contains(dataTablesConstants.SELECT_FILTER_COMMA_SEPARATED_HELPER_CLASS)) {
                            let tempSplitVal = splitVal.join(', ');
                            splitVal = tempSplitVal.split(', ');
                        }

                        dataTablesFilters.processFilterValuesArray(valArray, splitVal);
                    });
                }
            }
            if (filterField.classList.contains(dataTablesConstants.ADD_EMPTY) && jQuery.inArray("", valArray) === -1) {
                valArray.unshift("");
            }

            valArray.forEach(value => {
                if (value.length <= 0) {
                    $select.append('<option value="^$"><i>' + tsMsg("de.techspring.common.datatables.custom.filters.select.empty.value") + '</i></option>'); // additional option for explicit empty string search
                } else {
                    $select.append('<option value="' + value + '">' + value + '</option>');
                }
            });
        }

        /**
         * Function to create a multi-select column filter with icons.
         * @param filterField footer cell that will contain the filter.
         * @param column instance of datatables column api to be processed by this filter.
         * @private
         */
        function _createSelectFilterIcon(filterField, column) {
            const assignedIcons = [];
            const $filterField = $(filterField);
            const $select = $('<select multiple class="select-dropdown-empty"></select>')
                .appendTo($(filterField).empty());

            if ($filterField.hasClass(dataTablesConstants.ADD_EMPTY)) {
                const emptyOptionMessage = tsMsg("de.techspring.common.datatables.custom.filters.select.empty.value");
                const emptyOption = $("<option class='select-empty-option'><div class='icon-box-select'><i class='small material-icons'>crop_free</i></div></option>");

                emptyOption.val(JSON.stringify({searchValue: "^$", tooltip: emptyOptionMessage, displayText: "crop_free"}));

                $select.append(emptyOption);
            }

            column.data().unique().sort().each(function (value, idx) {
                const textValue = $(value).text().trim();
                const toolTipValue = $(value).attr(dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP);

                if (textValue.length !== 0 && jQuery.inArray(textValue, assignedIcons) < 0) {
                    const optionElement = $('<option ></option>')
                    const searchItem = JSON.stringify({
                        displayText: textValue,
                        searchValue: ("^\\s*" + textValue + "\\s*$"),
                        tooltip: toolTipValue
                    });

                    assignedIcons.push(textValue);
                    optionElement.val(searchItem);

                    const te = $("<div class='icon-box-select'><i class='small material-icons'>" + textValue + "</i><span class='icon-box-select-text'> "
                        + (typeof toolTipValue !== "undefined" ? toolTipValue : '') + "</span></div> ");

                    optionElement.append(te);

                    $select.append(optionElement);
                }
            });
        }

        /**
         * Function to set preset filters.
         * Usage: Add the attribute 'presetfilter-value' into the filter field DOM. The value of the attribute should be separated by whitespace.
         * @param table instance of datatables api.
         * @private
         */
        function _setPreFilters(table) {
            const taggedColumnsApi = table.columns('[presetfilter-value]');

            taggedColumnsApi.every(function (idx) {
                const column = this;
                const preFilterValue = column.header().getAttribute('presetfilter-value');
                if (preFilterValue.length > 0) {
                    _setPreFilterToApi(column, preFilterValue);
                    _setColumnFilterValueToInputFields(table, column, column.footer(), preFilterValue);
                }
            });
        }

        /**
         * Function to process preset filters in datatables api.
         * @param column instance of datatables column api.
         * @param preFilterValue value of a preset filter.
         * @private
         */
        function _setPreFilterToApi(column, preFilterValue) {
            const currentFilterField = column.footer();
            if (currentFilterField
                && currentFilterField.classList.contains(dataTablesConstants.SELECT_FILTER_CLASS)
                || currentFilterField.classList.contains(dataTablesConstants.SELECT_FILTER_HTML_ESCAPE_CLASS)
                || currentFilterField.classList.contains(dataTablesConstants.SELECT_ICON_FILTER_CLASS)){
                // do nothing
            } else if (currentFilterField) {
                column.search(preFilterValue).draw(false);
            }
        }

        /**
         * Function to restore column filter values from stored status.
         * ++++++ IMPORTANT: +++++++
         * This is meant to restore those filter values for the input fields. Those values are processed inside the table API
         * regardless. Simply deactivating this function will only lead to the input fields being empty, even if a filter is
         * still active on its column.
         * This does not apply to select filters, which need to be fully restored in this function!
         * @param table instance of datatables api.
         * @private
         */
        function _restoreColumnFilters(table) {
            let state = table.state.loaded();

            if (state) {
                let columnFilterState = state.columnFilterState;

                table.columns().eq(0).each(function (colIdx) {
                    let colSearch = "";

                    if (columnFilterState && columnFilterState[colIdx]) {
                        colSearch = columnFilterState[colIdx].val;
                    } else {
                        console.warn("Column with index " + colIdx + " doesn't have a valid restore value. " +
                            "Table: ", table);
                    }

                    const currentIndex = _getCurrentColIndex(table, colIdx);
                    const currentColumn = table.column(currentIndex);
                    const currentFilterField = currentColumn.footer();

                    if (colSearch !== "") {
                        _setColumnFilterValueToInputFields(table, currentColumn, currentFilterField, colSearch);
                    } else {
                        if (currentFilterField
                            && currentFilterField.classList.contains(dataTablesConstants.SELECT_ICON_FILTER_CLASS)) {
                            _changeLayoutSelectIconFilterEmpty(currentFilterField, true);
                        }
                    }
                });
            }
        }

        /**
         * Function to get current index of a column when any type of reordering has occurred.
         * @param table instance of datatables api.
         * @param colIdx original column index.
         * @returns number of current column index.
         * @private
         */
        function _getCurrentColIndex(table, colIdx) {
            const colOrder = table.colReorder.order();
            return colOrder.indexOf(colIdx);
        }

        /**
         * Helper function to set values in filter input fields.
         * @param table instance of datatables api.
         * @param currentColumn instance of datatables column api.
         * @param currentFilterField javascript object of a filter field DOM element.
         * @param filterValue any search value.
         * @private
         */
        function _setColumnFilterValueToInputFields(table, currentColumn, currentFilterField, filterValue) {
            if (currentFilterField
                && currentFilterField.classList.contains(dataTablesConstants.SELECT_FILTER_CLASS)) {
                dataTablesFilters.restoreSelectFilter(table, currentColumn, filterValue);
            } else if (currentFilterField
                && currentFilterField.classList.contains(dataTablesConstants.SELECT_FILTER_HTML_ESCAPE_CLASS)) {
                dataTablesFilters.restoreSelectFilterHtmlEscape(table, currentColumn, filterValue);
            } else if (currentFilterField
                && currentFilterField.classList.contains(dataTablesConstants.SELECT_ICON_FILTER_CLASS)) {
                dataTablesFilters.restoreSelectFilterIcon(table, currentColumn, filterValue);
                _changeLayoutSelectIconFilterEmpty(currentFilterField, false);
            } else if (currentFilterField
                && currentFilterField.classList.contains(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)) {
                dataTablesFilters.restoreSelectFilterBooleanCheckbox(currentColumn, filterValue);
            } else if (currentFilterField) {
                $(currentFilterField).find('input').val(filterValue);
            }
        }

        /**
         * Helper function to change layout on empty icon select filter.
         * @param selectIconFilterField javascript object of an icon filter field DOM element.
         * @param emptySearch flag to determine if the search input had no value.
         * @private
         */
        function _changeLayoutSelectIconFilterEmpty(selectIconFilterField, emptySearch) {
            if (emptySearch) {
                $(selectIconFilterField).find('input.select-dropdown').addClass("select-dropdown-empty");
            } else {
                $(selectIconFilterField).find('input.select-dropdown').removeClass("select-dropdown-empty");
            }
        }

        /**
         * Function to set the correct styles and values to the filter's input field.
         * @param $inputElement jQuery object of the filter's input field DOM element.
         * @param searchValue a string value.
         * @private
         */
        function _updateSelectFilterBooleanCheckboxInputFields($inputElement, searchValue) {
            $inputElement.val('');

            const $selectWrapper = $inputElement.closest('.select-wrapper');
            const $checkboxIcon = $selectWrapper.find('.checkbox-icon');

            if ($checkboxIcon.length <= 0) {
                if (searchValue.length <= 0) {
                    $selectWrapper.find('input').attr('placeholder', dataTablesConstants.FILTER_PLACEHOLDER);
                } else {
                    $selectWrapper.find('input').removeAttr('placeholder');
                    $selectWrapper
                        .append('<i class="material-icons checkbox-icon">' + searchValue + '</i>');
                }
            } else {
                if (searchValue.length <= 0) {
                    $selectWrapper.find('input').attr('placeholder', dataTablesConstants.FILTER_PLACEHOLDER);
                    $checkboxIcon.remove();
                } else {
                    $selectWrapper.find('input').removeAttr('placeholder');
                    if (!$checkboxIcon.hasClass('material-icons')) {
                        $checkboxIcon.addClass('material-icons');
                    }
                    $checkboxIcon.text(searchValue);
                }
            }
        }

        /**
         * Helper function to regex escape a string for processing.
         * @param string any string.
         * @returns {*} escaped string.
         * @private
         */
        function _escapeRegExp(string) {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
        }

        /**
         * Function to create tooltips for a filter.
         * @param $element jquery object of DOM element.
         * @param tooltip tooltip to set.
         * @private
         */
        function _createTooltipForFilter($element, tooltip) {
            //$element.addClass("tooltipped").attr(dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP, tooltip);
        }

        /**
         * Remove tooltip class from the given element.
         * @param $element jquery object of DOM element.
         * @private
         */
        function _removeTooltipForFilter($element) {
            $element.removeClass("tooltipped");
            globalTooltipHandler.destroyTooltip();
        }
    }(jQuery);
})();