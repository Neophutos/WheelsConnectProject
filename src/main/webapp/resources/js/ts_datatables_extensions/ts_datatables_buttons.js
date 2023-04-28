(function () {
    if (!window.dataTablesButtons) window.dataTablesButtons = function($) {
        const DataTablesButtons = {};

        /**
         * Function to generate and define buttons for this DataTables instance.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @param customButtons JS-object { key: value, ...  } containing additional buttons.
         * @param customOptions JS-object { key: value, ...  } containing additional options.
         * @param isTreeTable flag to determine if the current table instance is initialized as a tree table.
         * @param USER_ID ID of currently logged in user.
         * @param hasColumnFilters flag to determine if the current table instance contains column filters.
         * @param hasSearchField flag to determine if the current table instance contains a search field.
         * @param hasAddFunction flag to determine if the current table instance contains functions to add rows.
         * @param hasColvis flag to determine if the current table instance uses the column visibility menu.
         * @param visibleRowParentIds array of ids for visible parent rows.
         * @param colvisHiddenIndexes array of indexes for columns hidden by the datatables colvis api.
         * @param displayLevel function to display rows of a certain hierarchy level on a tree table instance.
         * @param toggleFilterRow function to toggle visibility of column filters.
         * @param clearColumnFilters function to clear all column filters.
         * @param toggleSearchField function to toggle visibility of search input field.
         * @returns {*[]} array of button definitions.
         */
        DataTablesButtons.generateButtons = function(table, $tableElement, customButtons, customOptions, isTreeTable, USER_ID,
                                                     hasColumnFilters, hasSearchField, hasAddFunction, hasColvis, visibleRowParentIds, colvisHiddenIndexes,
                                                     displayLevel, toggleFilterRow, clearColumnFilters, toggleSearchField) {
            // let t1 = performance.now();
            let buttonsArray = [];

            if (_hasRefreshBtn($tableElement)) {
                buttonsArray.push({
                    text: '<i class="material-icons tiny ts-ref-button-refresh">autorenew</i>',
                    attr: {[dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.refresh.value")},
                    className: dataTablesConstants.REFRESH_TABLE_BTN_CLASS,
                    action: function (e, dt, node, config) {
                        // let t1 = performance.now();
                        if (dt != null && typeof(window.tsRefreshData) === 'function') {
                            let tableId = dt.nodes().to$().attr("id");
                            tsRefreshData({
                                tableId: tableId
                            });
                        }
                        // let t2 = performance.now();
                        // console.log("perf refresh table:              " + (t2 - t1) + "ms");
                    }
                });
            }

            if (customButtons) {
                for (let key in customButtons) {
                    if (customButtons.hasOwnProperty(key)) {

                        // JSON-named properties - we GET the values
                        let buttonId = null;
                        let iconName = null;
                        let iconClass = null;
                        let styleClass = null;
                        let tooltip = null;
                        let functionName = null;
                        let disabled = false;

                        let properties = customButtons[key];
                        for (let propertyKey in properties) {
                            if (properties.hasOwnProperty(propertyKey)) {
                                let value = properties[propertyKey];
                                if (typeof value === "string") {
                                    if (propertyKey === "buttonId") {
                                        buttonId = value;
                                    } else if (propertyKey === "styleClass") {
                                        styleClass = value;
                                    } else if (propertyKey === "iconName") {
                                        iconName = value;
                                    } else if (propertyKey === "iconClass") {
                                        iconClass = value;
                                    } else if (propertyKey === "tooltip") {
                                        tooltip = value;
                                    } else if (propertyKey === "disabled") {
                                        if (value === 'true') {
                                            disabled = 'disabled';
                                        }
                                    }
                                } else if (typeof value === "function") {
                                    functionName = propertyKey;
                                }
                            }
                        }

                        buttonsArray.push({
                            text: (iconName != null && iconName.length) > 0 ? '<i class="material-icons tiny'.concat((iconClass != null && iconClass.length) ? ' '.concat(iconClass) : '').concat('">').concat(iconName).concat('</i>') : '',
                            attr: ((buttonId != null && buttonId.length > 0) && (tooltip != null && tooltip.length > 0)) ? {
                                [dataTablesConstants.ATTR_ID]: buttonId,
                                [dataTablesConstants.ATTR_DISABLED]: disabled,
                                [dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg(tooltip)
                            } : ((buttonId != null && buttonId.length > 0) ? {
                                [dataTablesConstants.ATTR_DISABLED]: disabled,
                                [dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg(tooltip)
                            } : ((tooltip != null && tooltip.length > 0) ? {
                                [dataTablesConstants.ATTR_DISABLED]: disabled,
                                [dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg(tooltip)
                            } : {})),
                            className: ((styleClass != null && styleClass.length) ? styleClass : '').concat(disabled ? ' disabled' : ''),
                            action: function (e, dt, node, config) {
                                properties[functionName]();
                            }
                        });
                    }
                }
            }

            if (_hasDataFilterTripleSwitch($tableElement)) {
                buttonsArray.push({
                    text: '<i class="material-icons tiny">find_in_page</i>',
                    className: dataTablesConstants.TRIPLE_TOGGLE_HIDDEN_ID_TRIGGER_BTN_CLASS + ' hidden',
                    action: function (e, dt, node, config) {
                        _toggleIdFilter(table, $tableElement, USER_ID);
                    }
                });
            }

            if (isTreeTable && (!customOptions || !customOptions.hideTreeButtons)) {
                buttonsArray.push({
                    extend: 'collection',
                    className: dataTablesConstants.TREE_TABLE_LEVELS_BTN_CLASS + ' hidden',
                    text: '<i class="material-icons tiny">subdirectory_arrow_right</i>',
                    attr: {[dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg("de.techspring.common.datatables.custom.buttons.treetable.level.value")},
                    buttons: [
                        {
                            text: '<i class="material-icons tiny left">looks_one</i>' + tsMsg("de.techspring.common.datatables.custom.buttons.treetable.level.first.value"),
                            className: 'data-table-menu-btn active',
                            attr: {[dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg("de.techspring.common.datatables.custom.buttons.treetable.level.first.title")},
                            action: function (e, dt, node, config) {
                                displayLevel(0, visibleRowParentIds);
                            }
                        }, {
                            text: '<i class="material-icons tiny left">looks_two</i>' + tsMsg("de.techspring.common.datatables.custom.buttons.treetable.level.second.value"),
                            className: 'data-table-menu-btn active',
                            attr: {[dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg("de.techspring.common.datatables.custom.buttons.treetable.level.second.title")},
                            action: function (e, dt, node, config) {
                                displayLevel(1, visibleRowParentIds);
                            }
                        }, {
                            text: '<i class="material-icons tiny left">looks_3</i>' + tsMsg("de.techspring.common.datatables.custom.buttons.treetable.level.third.value"),
                            className: 'data-table-menu-btn active',
                            attr: {[dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg("de.techspring.common.datatables.custom.buttons.treetable.level.third.title")},
                            action: function (e, dt, node, config) {
                                displayLevel(2, visibleRowParentIds);
                            }
                        }
                    ]
                });
            }

            if (hasColumnFilters) {
                buttonsArray.push({
                    text: '<i class="material-icons tiny">filter_list</i>',
                    attr: {[dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.colfilters.value")},
                    className: dataTablesConstants.COLUMN_FILTERS_TOGGLER_CLASS + ' active',
                    action: function (e, dt, node, config) {
                        toggleFilterRow(node);
                    }
                });

                $tableElement.children("tfoot").on("click.erasefilter", function(event) {
                    let width = 18;
                    let height = 16;
                    try {
                        if ($(this).hasClass("erase-all-visible")) {
                            let diffX = this.offsetWidth - event.originalEvent.offsetX - 6;
                            let diffY = this.offsetHeight - event.originalEvent.offsetY - 25;
                            if (diffX >= 0 && diffX <= width && diffY >= 0 && diffY <= height) {
                                const table = materializetool.tables[$tableElement.attr('datatable-selector')].table;
                                clearColumnFilters(table);
                                event.stopPropagation();
                                return false;
                            }
                        }
                    } catch(e) {
                        console.error("error processing erase filter event: " + e.message);
                    }
                });
            }

            if (hasSearchField) {
                buttonsArray.push({
                    text: '<i class="material-icons tiny">find_in_page</i>',
                    attr: {[dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.searchfield.value")},
                    className: dataTablesConstants.DT_SEARCH_FIELD_TOGGLER_CLASS + ' active',
                    action: function (e, dt, node, config) {
                        toggleSearchField(node);
                    }
                });
            }

            if (hasColvis) {
                if (_isEmpty($tableElement)) {
                    buttonsArray.push({
                        text: '<i class="material-icons tiny">view_week</i>',
                        attr: {[dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.colvis.value")},
                        className: 'disabled'
                    });
                } else {
                    buttonsArray.push({
                        extend: 'colvis',
                        columns: ':not(.never):not(.control)',
                        text: '<i class="material-icons tiny">view_week</i>',
                        attr: {[dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.colvis.value")},
                        columnText: function (dt, idx, title) {
                            _prepapreCustomizeColvisButtons(dt, idx, colvisHiddenIndexes);
                            return title;
                        }
                    });
                }

            }

            if (hasAddFunction) {
                buttonsArray.push({
                    className: 'add-button',
                    text: '<i class="material-icons tiny ts-ref-button-add">add</i>',
                    attr: {[dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP]: tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.add.value")},
                    action: function (e, dt, node, config) {
                        customOptions.callbackAddFunction();
                    }
                });
            }
            // let t2 = performance.now();
            // console.log("perf onLoad generateButtons:              " + (t2 - t1) + "ms");
            return buttonsArray;
        }
        /**
         * Function to add clear button (x) to search and filter input fields.
         * @param $tableElement jQuery object of table DOM element.
         */
        DataTablesButtons.addClearSearchAndFilterButtons = function($tableElement) {
            // find input wrapper elements
            const $searchWrapper = $tableElement.closest('form').find(dataTablesConstants.DT_SEARCH_FIELD_SELECTOR);
            const $filterWrappers = $tableElement.find('.column-filter-input');

            // add button on matching input wrappers
            addClearInputButton($searchWrapper);
            $filterWrappers.each(function (idx) {
                addClearInputButton($(this));
            });

            // inner function to process button adding and removal
            function addClearInputButton($inputFieldWrapper) {
                const clearInputBtn = '<i class="clear-input-btn material-icons tiny">clear</i>';
                const $thisClearInputBtn = $inputFieldWrapper.find('.clear-input-btn');
                const $inputField = $inputFieldWrapper.find('input');
                if ($inputField.val() !== "") {
                    if ($thisClearInputBtn.length <= 0) {
                        $inputFieldWrapper.append(clearInputBtn);
                    }
                } else {
                    if ($thisClearInputBtn) {
                        $thisClearInputBtn.remove();
                    }
                }
            }
        }

        /**
         * Function to turn colvis menu into a sortable list, using jQuery-UI, and connecting these sortable items with
         * DataTables API events for reordering columns.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @param colvisHiddenIndexes array of indexes for columns hidden by the datatables colvis api.
         */
        DataTablesButtons.initColumnSortByColvisButtons = function(table, $tableElement, colvisHiddenIndexes) {
            if (table.button(dataTablesConstants.DT_COLVIS_BUTTONS_SELECTOR).length > 0) {

                // Wrap colvis buttons in <ul/> and <li/> elements
                const $colvisButtonCollectionContainer = $(table.button(dataTablesConstants.DT_COLVIS_BUTTONS_SELECTOR).node()).parent();
                $colvisButtonCollectionContainer.find('button:not(.' + dataTablesConstants.COLVIS_RESPONSIVE_SUB_COLUMN_BTN_CLASS + ')').wrap('<li class="col-visible"/>');
                $colvisButtonCollectionContainer.find('button.' + dataTablesConstants.COLVIS_RESPONSIVE_SUB_COLUMN_BTN_CLASS).wrap('<li class="col-invisible"/>');
                $colvisButtonCollectionContainer.find('li.col-visible').wrapAll('<ul class="sortable-visible"></ul>');
                $colvisButtonCollectionContainer.find('li.col-invisible').wrapAll('<ul class="sortable-invisible"></ul>');

                initSortables($tableElement, $colvisButtonCollectionContainer, table);

                // Click event for colvis button
                if(!window.colvisDndSet) {
                    $('body').on('click', '.buttons-colvis', function () {
                        const $dtWrapper = $(this).closest('.dataTables_wrapper');
                        const $tableElement = $dtWrapper.find('table.dataTable');
                        const table = materializetool.tables[$tableElement.attr('datatable-selector')].table;
                        const $colvisButtonCollectionContainer = $(table.button(dataTablesConstants.DT_COLVIS_BUTTONS_SELECTOR).node()).parent();
                        initSortables($tableElement, $colvisButtonCollectionContainer, table);
                    });
                    window.colvisDndSet = true;
                }

                function initSortables($tableElement, $colvisButtonCollectionContainer, table) {
                    // adding a style class to right-align colvis button collection
                    $colvisButtonCollectionContainer
                        .closest('.dt-button-collection')
                        .removeClass('colvis-button-collection')
                        .addClass('colvis-button-collection');

                    const $sortableVisible = $tableElement.closest(dataTablesConstants.DT_WRAPPER_SELECTOR).find('.sortable-visible');
                    const $sortableInvisible = $tableElement.closest(dataTablesConstants.DT_WRAPPER_SELECTOR).find('.sortable-invisible');

                    // Initialize sortable colvis buttons for visible columns
                    if(!$sortableVisible.attr('colvis-dnd-set')) {
                        $sortableVisible.sortable({
                            cancel: '',
                            axis: 'y',
                            helper: 'clone',
                            delay: 150,
                            start: _logPrevIndex,
                            stop: function (event, ui) {
                                const $that = $(this);
                                _reorderColumnsVisible($that, event, ui, table, $tableElement, colvisHiddenIndexes);
                            }
                        });
                        $sortableVisible.disableSelection();
                        $sortableVisible.attr('colvis-dnd-set', 'true');
                    }

                    // Initialize sortable colvis buttons for details columns
                    if(!$sortableInvisible.attr('colvis-dnd-set')) {
                        $sortableInvisible.sortable({
                            cancel: '',
                            axis: 'y',
                            helper: 'clone',
                            delay: 150,
                            start: _logPrevIndex,
                            stop: function (event, ui) {
                                const $that = $(this);
                                _reorderColumnsInvisible($that, event, ui, table, $tableElement, colvisHiddenIndexes);
                            }
                        });
                        $sortableInvisible.disableSelection();
                        $sortableInvisible.attr('colvis-dnd-set', 'true');
                    }
                }
            }
        }

        /**
         * Function to add a custom class to "none"-class columns in colvis-menu.
         * This needs to be called in DataTables' initComplete-hook.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @param colvisHiddenIndexes array of indexes for columns hidden by the datatables colvis api.
         */
        DataTablesButtons.customizeColvisButtons = function(table, $tableElement, colvisHiddenIndexes) {
            let colvisButtons = table.buttons(dataTablesConstants.DT_COLVIS_BUTTONS_SELECTOR).nodes();
            if (colvisButtons) {
                $(colvisButtons).removeClass('tooltipped');
                $(colvisButtons).removeClass(dataTablesConstants.COLVIS_RESPONSIVE_SUB_COLUMN_BTN_CLASS);
                $(colvisButtons).removeClass(dataTablesConstants.COLVIS_SET_COLUMN_FILTER_BTN_CLASS);
            }
            colvisHiddenIndexes.forEach(idx => {
                if (colvisButtons[idx]) {
                    colvisButtons[idx].classList.add(dataTablesConstants.COLVIS_RESPONSIVE_SUB_COLUMN_BTN_CLASS);
                }
            });
            for (let i = 0; i < colvisButtons.length; i++) {
                if (table.column(i).header().classList.contains(dataTablesConstants.INACTIVE_COLVIS_COLUMN_CLASS)) {
                    $(colvisButtons[i]).attr('disabled', 'true');
                }
            }
            _setFilteredStyle(table, $tableElement);
        }

        /**
         * Function to add button for toggling detail columns of all rows.
         * @param table instance of datatables api.
         */
        DataTablesButtons.createToggleAllDetailsButton = function (table) {
            const $controlField = $(table.column('.control').header());
            const ttOpen = tsMsg('de.techspring.common.datatables.custom.buttons.tooltips.all.details.show.value');
            let $btn = $('<span class="default-button all-details-btn tooltipped"></span>')
                .attr(dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP, ttOpen)
                .appendTo($controlField.empty());

            $btn.on('click', function (event) {
                const currentlyVisibleRows = table.rows({page: 'current', filter: 'applied'}).nodes();
                event.stopPropagation();

                if (!$btn.hasClass('close')) {
                    $(currentlyVisibleRows.filter(function (val, idx) {
                        return !$(val).hasClass('parent');
                    })).find('td.control > .tooltipped').click();
                } else {
                    $(currentlyVisibleRows.filter(function (val, idx) {
                        return $(val).hasClass('parent');
                    })).find('td.control > .tooltipped').click();
                }
            });

            _createControlBtnListener($btn);
        }

        /**
         * Function to determine current style of the all details toggle button.
         * @param $tableElement jQuery object of table DOM element.
         * @param table instance of datatables api.
         */
        DataTablesButtons.checkAllDetailsButtonStatus = function($tableElement, table) {
            const $allDetailsButton = $tableElement.find('.all-details-btn');
            _checkAllDetailsButton($allDetailsButton, table);
        }

        /**
         * Function to initialize functions for triple switch button to change between all data, own data and single data.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @param hideLevelsOneAndTwo Function to hide hierarchy levels 1 and 2.
         * @param showLevelsOneAndTwo Function to show hierarchy levels 1 and 2.
         * @param resetDataTablesPageSize Function to reset datatables page size.
         * @param setDataTablesToSingleData Function to set datatables instance to always only show a single row per page.
         */
        DataTablesButtons.initTripleSwitch = function(table, $tableElement, hideLevelsOneAndTwo, showLevelsOneAndTwo, resetDataTablesPageSize, setDataTablesToSingleData) {
            if (_hasDataFilterTripleSwitch($tableElement)) {
                _styleToggleIdFilterButton(table, $tableElement);
                _initDataFilterToggleEvent(hideLevelsOneAndTwo, showLevelsOneAndTwo, resetDataTablesPageSize, setDataTablesToSingleData);
            }
        }

        return DataTablesButtons;

        // *************************************************************************************************************
        // private functions

        /**
         * Function to check if the current table instance contains a table refresh button.
         * @param $tableElement jQuery object of table DOM element.
         * @returns {boolean}
         * @private
         */
        function _hasRefreshBtn($tableElement) {
            let hasRefreshButton;
            if ($tableElement.attr("show-refresh-button")) {
                hasRefreshButton = true;
            }
            return hasRefreshButton;
        }

        /**
         * Function to check if the current form contains a triple switch button for toggling displaying of data by user id.
         * @param $tableElement jQuery object of table DOM element.
         * @returns {boolean}
         * @private
         */
        function _hasDataFilterTripleSwitch($tableElement) {
            return $tableElement.closest('form').find('.' + dataTablesConstants.TRIPLE_TOGGLE_BTN_GROUP_CLASS).length > 0;
        }

        /**
         * Function to check if the current table instance is empty.
         * @param $tableElement jQuery object of table DOM element.
         * @returns {boolean}
         * @private
         */
        function _isEmpty($tableElement) {
            return $tableElement.hasClass("datatable-empty");
        }

        /**
         * Function to trigger filtering on hidden ID row, for only displaying current user's own data.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @param USER_ID ID of currently logged in user.
         * @private
         */
        function _toggleIdFilter(table, $tableElement, USER_ID) {
            const hiddenIdColumn = table.column(dataTablesConstants.ASSIGNED_USER_LOGIN_COL_SELECTOR);
            if (hiddenIdColumn.search() === "") {
                hiddenIdColumn.search('^' + USER_ID + '$', true, false).draw();
            } else {
                hiddenIdColumn.search("").draw();
            }
            _styleToggleIdFilterButton(table, $tableElement);
        }

        /**
         * Function to add visual feedback for the ID filter toggle buttons.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @private
         */
        function _styleToggleIdFilterButton(table, $tableElement) {
            const hiddenIdColumn = table.column(dataTablesConstants.ASSIGNED_USER_LOGIN_COL_SELECTOR);
            let $toggleButton = $tableElement.closest(dataTablesConstants.DT_WRAPPER_SELECTOR).find('.' + dataTablesConstants.TRIPLE_TOGGLE_HIDDEN_ID_TRIGGER_BTN_CLASS);
            if (hiddenIdColumn.search() === "") {
                $toggleButton.removeClass('active');
            } else {
                $toggleButton.addClass('active');
            }

            // TODO GSI 2020-06-17: this is only temporary! Should be set from preferences, once implemented:
            if ($('.' + dataTablesConstants.TRIPLE_TOGGLE_BTN_GROUP_CLASS).find('.btn.active').length <= 0) {
                if (hiddenIdColumn.search() === "") {
                    $('.all-data').addClass('active');
                } else {
                    $('.own-data').addClass('active');
                }
            }
        }

        /**
         * Function to handle triple switch button for different table view modes ('all data', 'my data', 'single data').
         * @param hideLevelsOneAndTwo Function to hide hierarchy levels 1 and 2.
         * @param showLevelsOneAndTwo Function to show hierarchy levels 1 and 2.
         * @param resetDataTablesPageSize Function to reset datatables page size.
         * @param setDataTablesToSingleData Function to set datatables instance to always only show a single row per page.
         * @private
         */
        function _initDataFilterToggleEvent(hideLevelsOneAndTwo, showLevelsOneAndTwo, resetDataTablesPageSize, setDataTablesToSingleData) {
            $('body').on('click', '.' + dataTablesConstants.TRIPLE_TOGGLE_BTN_GROUP_CLASS + ' .btn', function (event) {
                const ownDataClassName = "own-data";
                const allDataClassName = "all-data";
                const singleDataClassName = "single-data";

                $('.' + dataTablesConstants.TRIPLE_TOGGLE_BTN_GROUP_CLASS + ' .btn').removeClass('active');
                $(this).addClass('active');
                const classList = this.classList;
                if (classList.contains(ownDataClassName)) {
                    $('.' + dataTablesConstants.TRIPLE_TOGGLE_HIDDEN_ID_TRIGGER_BTN_CLASS + ':not(.active)').click();
                    hideLevelsOneAndTwo();
                    resetDataTablesPageSize();
                } else if (classList.contains(allDataClassName)) {
                    $('.' + dataTablesConstants.TRIPLE_TOGGLE_HIDDEN_ID_TRIGGER_BTN_CLASS + '.active').click();
                    showLevelsOneAndTwo();
                    resetDataTablesPageSize();
                } else {
                    $('.' + dataTablesConstants.TRIPLE_TOGGLE_HIDDEN_ID_TRIGGER_BTN_CLASS + '.active').click();
                    hideLevelsOneAndTwo();
                    setDataTablesToSingleData();
                }
            })
        }

        /**
         * Function to store indexes of "none"-class columns in responsive design for later handling the matching colvis-buttons.
         * This needs to be called in DataTables' buttons initialization for the colvis button, in its property "columnText".
         * @param table instance of datatables api.
         * @param colIndex index of current column.
         * @param colvisHiddenIndexes array of indexes for columns hidden by the datatables colvis api.
         * @private
         */
        function _prepapreCustomizeColvisButtons(table, colIndex, colvisHiddenIndexes) {
            const header = table.column(colIndex).header();
            const classList = header.className;
            if (classList.includes('none') && !colvisHiddenIndexes.includes(colIndex)) {
                colvisHiddenIndexes.push(colIndex);
            } else if (!classList.includes('none') && colvisHiddenIndexes.includes(colIndex)) {
                colvisHiddenIndexes.splice(colvisHiddenIndexes.indexOf(colIndex), 1);
            }
        }

        /**
         * Function to add "filter" icon to colvis buttons.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @private
         */
        function _setFilteredStyle(table, $tableElement) {
            let fieldsWithValueCounter = 0;
            table.columns().every(function () {
                let thisColvisButton = table.buttons(dataTablesConstants.DT_COLVIS_BUTTONS_SELECTOR).nodes()[this.index()];
                if (thisColvisButton) {
                    $(thisColvisButton).find('i').remove();
                    if (this.search() !== '') {
                        thisColvisButton.classList.add(dataTablesConstants.COLVIS_SET_COLUMN_FILTER_BTN_CLASS);
                        _addFilteredIcon(thisColvisButton, table);
                        fieldsWithValueCounter++;
                    }
                }
            });

            if (fieldsWithValueCounter > 0) {
                setClearAllFiltersButtonVisible();
            } else {
                setClearAllFiltersButtonInvisible();
            }

            // inner function to set clear-col-filters-btn visible
            function setClearAllFiltersButtonVisible() {
                $tableElement.children("tfoot").addClass("erase-all-visible");
            }

            // inner function to set clear-col-filters-btn invisible
            function setClearAllFiltersButtonInvisible() {
                $tableElement.children("tfoot").removeClass("erase-all-visible");
            }
        }

        /**
         * Function to add interactive column filter icon to colvis buttons.
         * @param thisColvisButton javascript object of colvis button DOM element.
         * @param table instance of datatables api.
         * @private
         */
        function _addFilteredIcon(thisColvisButton, table) {
            let colvisFilteredIcon = document.createElement('i');
            colvisFilteredIcon.classList.add('material-icons');
            colvisFilteredIcon.classList.add('right');
            colvisFilteredIcon.classList.add('tooltipped');
            colvisFilteredIcon.innerHTML = 'filter_list';
            colvisFilteredIcon.setAttribute(dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP, tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.colvisfilter.value"));

            $(colvisFilteredIcon).on('click', function (event) {
                _callFilterDeleteModal(event, this, table);
            });
            thisColvisButton.appendChild(colvisFilteredIcon);
        }

        /**
         * Function to generate and display a modal dialog to confirm or cancel deleting of a column filter via colvis button.
         * @param event click event object.
         * @param that javascript object of calling element.
         * @param table instance of datatables api.
         * @private
         */
        function _callFilterDeleteModal(event, that, table) {
            event.stopPropagation();

            const colIndex = $(that).closest('li').index();
            const dtColumn = table.column(colIndex);
            const $colFilterField = $(dtColumn.footer());
            const colTitle = $(that).closest('button').find('span').text();
            let filterText;

            if ($colFilterField.hasClass(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)) {
                const iconText = $colFilterField.find('select').val();
                filterText = '<i class="material-icons" style="top: 1vh; position: relative;">' + iconText + '</i>';
            } else if ($colFilterField.hasClass(dataTablesConstants.SELECT_FILTER_CLASS) && !dtColumn.visible()) {
                filterText = $colFilterField.find('select').val();
            } else {
                filterText = $colFilterField.find('input').val();
            }

            const dialogTitle = tsMsg("de.techspring.common.datatables.custom.modal.filter.delete.title");
            const dialogText = tsMsg("de.techspring.common.datatables.custom.modal.filter.delete.value", filterText, colTitle);
            const $dialog = $('<div id="dialog-confirm" title="' + dialogTitle + '"><p>' + dialogText + '</p></div>');

            $dialog.dialog({
                resizable: false,
                draggable: false,
                height: "auto",
                width: 400,
                classes: {
                    'ui-dialog': 'modal',
                    'ui-dialog-content': 'ui-dialog-custom-content',
                    'ui-dialog-buttonpane': 'modal-footer',
                    'ui-dialog-titlebar': 'ui-dialog-custom-titlebar',
                    'ui-dialog-titlebar-close': 'ui-dialog-custom-titlebar-close'
                },
                modal: true,
                open: function () {
                    let $overlay = $('.ui-widget-overlay');
                    $('.ui-dialog-custom-titlebar-close').html('<i class="material-icons">close</i>');

                    $overlay.addClass('custom-overlay');
                    $('body').on('click', '.custom-overlay, .ui-dialog.modal.ui-widget.ui-widget-content.ui-front.ui-dialog-buttons', function (event) {
                        event.stopPropagation();
                    });
                    $('.dt-button-background').hide();
                },
                close: function () {
                    $('.dt-button-background').show();
                },
                buttons: [
                    {
                        text: tsMsg('de.techspring.dialog.button.delete.value'),
                        click: function () {
                            if ($colFilterField.find('select').length > 0) {
                                const $selectMenu = $colFilterField.find('select');
                                $selectMenu.val('');
                                if (!$colFilterField.hasClass(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)) {
                                    $selectMenu.trigger('change');
                                    if (dtColumn.visible()) {
                                        $selectMenu.removeAttr("ts-initialized");
                                        materializetool.initSelectElement($selectMenu);
                                        tsDataTableHandler.createPlaceHolderForFilter(table, dtColumn);
                                    }
                                } else {
                                    $colFilterField
                                        .find('.checkbox-icon')
                                        .text('');
                                }
                            } else {
                                $colFilterField.find('input').val('');
                            }
                            table.column(colIndex).search('').draw(false);
                            $(this).dialog("close");
                        },
                        'class': 'btn'
                    }, {
                        text: tsMsg('de.techspring.dialog.button.cancel.value'),
                        click: function () {
                            $(this).dialog("close");
                        },
                        'class': 'btn white black-text'
                    }
                ]
            });
        }

        /**
         * Function used in colvis drag and drop to create a temporary attribute on the element with the old index.
         * @param event start event of jQuery UI sortable.
         * @param ui jQuery UI sortable container element.
         * @private
         */
        function _logPrevIndex(event, ui) {
            $(this).attr('data-previndex', ui.item.index());
        }

        /**
         * Function used in colvis drag and drop to get the new and old index and then remove the temporary attribute.
         * @param event stop event of jQuery UI sortable.
         * @param ui jQuery UI sortable container element.
         * @param $that jQuery UI sortable element.
         * @returns {{oldIndex: (*|null|jQuery|undefined), title: *, newIndex: *}}
         * @private
         */
        function _getPrevAndNewIndex(event, ui, $that) {
            const newIndex = ui.item.index();
            const oldIndex = parseInt($that.attr('data-previndex'), 10);
            const title = ui.item.text();
            const element = {title: title, oldIndex: oldIndex, newIndex: newIndex};
            $(this).removeAttr('data-previndex');
            return element;
        }

        /**
         * Function to prepare reordering regular columns by reordering colvis buttons.
         * @param $thisSortable jQuery UI sortable element.
         * @param event stop event of jQuery UI sortable.
         * @param ui jQuery UI sortable container element.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @param colvisHiddenIndexes array of indexes for columns hidden by the datatables colvis api.
         * @private
         */
        function _reorderColumnsVisible($thisSortable, event, ui, table, $tableElement, colvisHiddenIndexes) {
            let columnOrder = table.colReorder.order();
            const element = _getPrevAndNewIndex(event, ui, $thisSortable);
            _processReorderColumns($thisSortable, element, columnOrder, 0, table, $tableElement, colvisHiddenIndexes);
        }

        /**
         * Function to prepare reordering responsive sub-columns by reordering colvis buttons.
         * @param $thisSortable jQuery UI sortable element.
         * @param event stop event of jQuery UI sortable.
         * @param ui jQuery UI sortable container element.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @param colvisHiddenIndexes array of indexes for columns hidden by the datatables colvis api.
         * @private
         */
        function _reorderColumnsInvisible($thisSortable, event, ui, table, $tableElement, colvisHiddenIndexes) {
            const indexBase = table.columns(':not(.none):not(.never):not(.control)')[0].length;
            let columnOrder = table.colReorder.order();
            const element = _getPrevAndNewIndex(event, ui, $thisSortable);
            _processReorderColumns($thisSortable, element, columnOrder, indexBase, table, $tableElement, colvisHiddenIndexes);
        }

        /**
         * Function calling datatables column reorder function and cancelling jquery-ui sortable. Cancel is necessary, as datatables will update colvis list.
         * @param $thisSortable jQuery-UI sortable instance.
         * @param element moved <li> element.
         * @param columnOrder current column order.
         * @param indexBase starting index of <li> element group (there may be several groups sharing the same array indexing).
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @param colvisHiddenIndexes array of indexes for columns hidden by the datatables colvis api.
         * @private
         */
        function _processReorderColumns($thisSortable, element, columnOrder, indexBase, table, $tableElement, colvisHiddenIndexes) {
            if (element.oldIndex !== element.newIndex) {
                columnOrder = arrayChangePosition(columnOrder, indexBase + element.oldIndex, indexBase + element.newIndex);
                table.colReorder.order(columnOrder, true);
                $thisSortable.sortable("cancel");
                dataTablesButtons.customizeColvisButtons(table, $tableElement, colvisHiddenIndexes);
                dataTablesButtons.initColumnSortByColvisButtons(table, $tableElement, colvisHiddenIndexes);
                _reorderChildRows(table);
            }
        }

        /**
         * Function to visually reorder "responsive rows" when reordering columns via colvis buttons.
         * @param table instance of datatables api.
         * @private
         */
        function _reorderChildRows(table) {
            table.rows('tr.parent').draw(false);
        }

        /**
         * Function to handle the active state of the control button (details button).
         * @param obj DOM element
         * @private
         */
        function _toggleActiveControlButton(obj) {
            let $element = $(obj);

            if ($element.length) {
                if ($element.hasClass("active")) {
                    $element.removeClass("active")
                    $element.attr("data-tooltip", tsMsg('de.techspring.common.datatables.custom.buttons.tooltips.details.show.value'));
                } else {
                    $element.addClass("active")
                    $element.attr("data-tooltip", tsMsg('de.techspring.common.datatables.custom.buttons.tooltips.details.hide.value'));
                }
            } else {
                console.warn("Passed object can't be cast to jQuery object.", obj);
            }
        }

        /**
         * Function to create an event listener for clicks of the control element (details button) of a row.
         * @param $btn jQuery object of row details button DOM element.
         * @private
         */
        function _createControlBtnListener($btn) {
            $('body').on('click', 'td.control', function (event) {
                _toggleActiveControlButton(event.target);
                const $tableElement = $btn.closest('table');
                const table = materializetool.tables[$tableElement.attr('datatable-selector')].table;
                _checkAllDetailsButton($btn, table);
            });
        }

        /**
         *
         * @param $allDetailsButton jQuery object of all details button DOM element.
         * @param table instance of datatables api.
         * @private
         */
        function _checkAllDetailsButton($allDetailsButton, table) {
            const ttOpen = tsMsg('de.techspring.common.datatables.custom.buttons.tooltips.all.details.show.value');
            const ttClose = tsMsg('de.techspring.common.datatables.custom.buttons.tooltips.all.details.hide.value');
            const currentlyVisibleRows = table.rows({page: 'current', filter: 'applied'}).nodes();
            if ($(currentlyVisibleRows.filter(function (val, idx) {
                return !$(val).hasClass('parent');
            })).length <= 0) {
                $allDetailsButton.attr(dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP, ttClose);
                $allDetailsButton.removeClass('close').addClass('close');
            } else {
                $allDetailsButton.attr(dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP, ttOpen);
                $allDetailsButton.removeClass('close');
            }
        }
    }(jQuery);
})();
