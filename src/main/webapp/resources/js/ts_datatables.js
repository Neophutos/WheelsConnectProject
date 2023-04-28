/**
 * Name: ts_datatables.js
 *
 * Creator: Georg Sibinger (gsi)
 *
 * Date: 2020-06-23 ff.
 *
 * Description: Javascript file for generic datatables implementation.
 *
 * Copyright (c) 2020 The TechSpring GmbH. All rights reserved.
 *
 * $Author$
 * $Revision$
 * $Date$
 * $Id$
 */


/**
 * Important CSS classes and additional attributes for proper functionality:
 *
 * *** Table classes ***
 * tree-table: initialize table as a tree table
 * hidden: hides jsf table until it is fully initialized as a datatables instance
 *
 * *** Additional table attributes ***
 * a:datatable-custom-options: provide custom options for the table
 * a:show-refresh-button: adds a button to redraw the table
 *
 * *** Additional properties for custom options ***
 * callbackAddFunction: parameter to add the "add"-button to the instance and call the referred callback function
 * callbackPageChangeFunction: callback for page change event
 * callbackDrawFunction: callback for draw event
 * callbackInitFunction: callback for init event
 * checkPageOnInit: check if visible page is less or even max pages on init
 *
 * *** Column header classes ***
 * hidden-id: reference for filtering user's own data
 * none: dataTables internal class for permanently storing a column as a child row
 * never: dataTables internal class for hiding a column entirely, also from colvis menu
 * colvis-inactive: prevent column from hiding by colvis menu -> button for column is still visible for colvis drag and drop
 * non-orderable: column will not have sort functionality
 * non-filterable: column will not have column filters
 * details-column: dedicated column for responsive row toggling
 * hierarchy-data-parent-id: only relevant for tree-table -> column to hold attributes necessary for creating tree structure
 * hierarchy-level: only relevant for tree-table -> column to hold attributes necessary for filtering by level
 * breadcrumbs: only relevant for tree-table -> column to hold path of ancestors
 * number-column: column values will be ordered as numbers, not strings, text alignment will be shifted right
 * numeric-sort: column values will be ordered as numbers, not strings, but no change in text alignment
 * processed-html-filter-column: columns with this class will override datatables internal function to strip html from cells for filtering
 *
 * *** Column footer classes ***
 * select-filter: filter element will use a multi select menu instead of an input field
 * select-filter-html-escape: variant of select filter element that works with multiple <span>, <br>, or similar Tags within a cell
 * select-filter-icon: multi select filter for icons
 * select-filter-boolean-checkbox: single select menu for boolean values
 * comma-separated: use this in combination with the select-filter-html-class, if a comma should also count as a delimiter
 *
 * *** Column attribute (via a:attribute-name) ***
 * a:child-class: css class(es) will be copied to child li element (special class hidden-child hides details for this column)
 *
 * *** Additional attributes for tree table handling, to be placed inside each cell of the "parent-id" column ***
 * a:f-id: id of the entity
 * a:parent-id: id of the parent entity
 * a:hierarchy-level: entity's level in the hierarchy
 */

/**
 * *********************************************************************************************************************
 * Loading additional javascript files.
 */
loadDataTablesConstants();
loadDataTablesButtons();
loadDataTablesFilters();
loadDataTablesTreeTables();
loadDataTablesAdditionalPlugins();

/**
 * *********************************************************************************************************************
 * Class definition of generic datatable component
 */
class GenericDataTable {
    /**
     * Constructor for generic datatable component.
     * @param tableSelector CSS class selector of html table instance.
     * @param customOptions JS-object { key: value, ...  } containing additional options for initializing the DataTables instance.
     * @param customButtons JS-object { key: value, ...  } containing additional buttons for initializing the DataTables instance.
     */
    constructor(tableSelector, customOptions, customButtons) {

        this.tableSelector = tableSelector;
        this.$tableElement = $(this.tableSelector);
        this.customOptions = customOptions;
        this.customButtons = customButtons;
        this.rowInfoCache = dataTablesTreeTables.generateTreeTableCache(this.$tableElement);

        this.table = this.initTable(
            this.$tableElement,
            this.customOptions,
            this.customButtons,
            this.tableSelector
        );

        this.markDirty = function (dirty) {
            let button = this.table.buttons('.' + dataTablesConstants.REFRESH_TABLE_BTN_CLASS).nodes();
            if (dirty) {
                button.addClass(dataTablesConstants.TABLE_DIRTY_CLASS);
                button.attr("data-tooltip", tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.refresh.needed.value"));
            } else {
                button.removeClass(dataTablesConstants.TABLE_DIRTY_CLASS);
                button.attr("data-tooltip", tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.refresh.value"));
            }
        }

        this.isDirty = function () {
            return this.table.buttons('.' + dataTablesConstants.REFRESH_TABLE_BTN_CLASS).nodes().hasClass(dataTablesConstants.TABLE_DIRTY_CLASS);
        };

        if (customOptions != null && typeof (customOptions.checkPageOnInit) !== 'undefined' && customOptions.checkPageOnInit) {
            let pageInfo = this.table.page.info();
            if (pageInfo != null) {
                let visiblePage = pageInfo.start / pageInfo.length;
                if (visiblePage >= pageInfo.pages) {
                    this.table.page("last").draw("page");
                }
            }
        }
    }

    /**
     * Function to initialize a html table as an instance of DataTables.
     * @param $tableElement jQuery object of table DOM element.
     * @param customOptions JS-object { key: value, ...  } containing additional options for initializing the DataTables instance.
     * @param customButtons JS-object { key: value, ...  } containing additional buttons for initializing the DataTables instance.
     * @param tableSelector selector of the table element.
     * @returns DataTables instance.
     */
    initTable($tableElement, customOptions, customButtons, tableSelector) {
        // Set useInfoCache to false to disable tree table parent/child-association-cache.
        let useInfoCache = true;
        let internalRowInfoCache = dataTablesTreeTables.generateTreeTableCache($tableElement);
        let isTreeSearchProcessed = {isTreeSearchProcessed: false};
        let visibleRowParentIds = [0];
        let visibleRowParentIdsTemp = [0];
        let USER_ID;
        let table;
        let colvisHiddenIndexes = [];
        let stateSaveTimeout;
        let showColumnFilters = true;
        let showSearchField = true;

        const DEFAULT_OPTIONS = {
            language: dataTablesConstants.TABLE_CUSTOM_GERMAN,
            pagingType: "full_numbers",
            lengthMenu: [[1, 2, 5, 10, 25, 50, 100, -1], ['1', '2', '5', '10', '25', '50', '100', tsMsg('de.techspring.label.show.all.text')]],
            pageLength: 10,
            colReorder: _getColReorderSettings(),
            destroy: true,
            stateSave: true,
            stateDuration: -1,          // Uses sessionStorage (@see https://datatables.net/reference/option/stateDuration)
            stateSaveParams: function (settings, data) {
                // Don't store filters of never/none columns.
                const thisTable = this.api();
                thisTable.columns().eq(0).each(function (colIdx) {
                    let colSearch = data.columns[colIdx].search.search;
                    if (colSearch.length > 0) {
                        const currentColumn = thisTable.column(colIdx);
                        const hiddenColumn = $(currentColumn.header()).hasClass('never') || $(currentColumn.header()).hasClass('none');
                        if (hiddenColumn) {
                            data.columns[colIdx].search.search = '';
                        }
                    }
                });
                // Store visibleParentIds for tree structure.
                data.visibleRowParentIds = visibleRowParentIds;
                // Store visibility of search field.
                data.showSearchField = showSearchField;
                // Store visibility of column filters.
                data.showColumnFilters = showColumnFilters;
            },
            stateLoadParams: function (settings, data) {
                // Get visibleParentIds for tree structure.
                visibleRowParentIds = data.visibleRowParentIds ? data.visibleRowParentIds : [0];
                // Get visibility of search field.
                showSearchField = typeof data.showSearchField !== 'undefined' ? data.showSearchField : true;
                // Get visibility of column filters.
                showColumnFilters = typeof data.showColumnFilters !== 'undefined' ? data.showColumnFilters : true;
            },
            stateSaveCallback: function (settings, data) {
                // Write state to hidden input/PreferenceBean if available.
                if (customOptions && customOptions.tableStateActive) {
                    const $tableStateHiddenInput = $tableElement
                        .closest(dataTablesConstants.DT_WRAPPER_SELECTOR)
                        .prevAll('input[data-table-state-hidden-input]')
                        .first();

                    data.columnFilterState = generateColumnFilterState(table);

                    if ($tableStateHiddenInput.length > 0) {
                        // TODO GSI, FFR, MHY 22.02.2022 | Ueberpruefe, ob es ueberhaupt eine Aenderung an dem TableState gab
                        clearTimeout(stateSaveTimeout);
                        stateSaveTimeout = setTimeout(function () {
                            $tableStateHiddenInput.val(JSON.stringify(data)).change();
                        }, dataTablesConstants.STATE_WRITE_TIMEOUT);
                    } else if (customOptions == null || !customOptions.deactivateTableState) {
                        console.warn("Table state hidden input not found. Local storage will be used")
                        localStorage.setItem('DataTables_' + window.location.pathname, JSON.stringify(data));
                    }
                }
            },
            drawCallback: function (settings, data) {
                //console.debug("drawCallback", $tableElement);
            },
            stateLoadCallback: function (settings) {
                // Get PreferenceBean preferences from hidden input if available.
                const $tableStateHiddenInput = $tableElement
                    .prevAll('input[data-table-state-hidden-input]')
                    .first();

                let loadedInput;

                if ($tableStateHiddenInput.length > 0 && $tableStateHiddenInput.val().length > 0) {
                    loadedInput = JSON.parse($tableStateHiddenInput.val());
                } else {
                    if (customOptions != null && customOptions.deactivateTableState) {
                        loadedInput = "";
                    } else {
                        console.warn("Table state hidden input not found. Local storage will be used")
                        loadedInput = JSON.parse(localStorage.getItem('DataTables_' + window.location.pathname));
                    }
                }


                return loadedInput;
            },
            responsive: _getResponsiveSettings(),
            columnDefs: _getColumnDefs(),
            dom: _generateDomOptions(),
            buttons: dataTablesButtons.generateButtons(table, $tableElement, customButtons, customOptions, _isTreeTable(), USER_ID,
                _hasColumnFilters(), _hasSearchField(), _hasAddFunction(), _hasColvis(), visibleRowParentIds, colvisHiddenIndexes,
                dataTablesTreeTables.displayLevel, _toggleFilterRow, dataTablesFilters.clearColumnFilters, _toggleSearchField),

            initComplete: function () {
                table = this.api();

                _onInitComplete();
            }
        }

        /**
         * Set default button classes in datatables class definition.
         * @type {string}
         */
        $.fn.dataTable.Buttons.defaults.dom.button.className = 'btn-small tooltipped';

        /**
         * Add row().show() plugin to datatables class definition.
         * https://datatables.net/plug-ins/api/row().show()
         */
        $.fn.dataTable.Api.register('row().show()', function () {
            const page_info = this.table().page.info();
            const new_row_index = this.index();
            const row_position = this.table()
                .rows({search: 'applied'})[0]
                .indexOf(new_row_index);
            if ((row_position >= page_info.start && row_position < page_info.end) || row_position < 0) {
                return this;
            }
            const page_to_display = Math.floor(row_position / this.table().page.len());
            this.table().page(page_to_display);
            return this;
        });

        /**
         * Add sum() plugin to datatables class definition.
         * https://datatables.net/plug-ins/api/sum()
         */
        jQuery.fn.dataTable.Api.register('sum()', function () {
            return this.flatten().reduce(function (a, b) {
                if (typeof a === 'string') {
                    a = _getPureDecimalNumber(_removeHtmlTagsWithContent(a));
                }
                if (typeof b === 'string') {
                    b = _getPureDecimalNumber(_removeHtmlTagsWithContent(b));
                }
                return a + b;
            }, 0);
        });

        /**
         * Add custom sorting to datatables class definition.
         */
        _addCustomSorting();

        /**
         * Actual table initialization.
         */
        return $tableElement.DataTable(_generateTableOptions());

        /* *************************************************************************************************************
         * Enclosed init & helper functions
         */

        /**
         * Generates the filter values visible for the user.
         *
         * DataTables saves the applied search to the table state. If it is a regex search, he will save the regex
         * to the table state which later makes it harder to restore the filter conveniently.
         */
        function generateColumnFilterState(tableApi) {
            const columns = tableApi.columns();
            let columnFilterStateObjects = [];

            columns.every(function() {
                let stateObject = {
                    "val": ""
                };

                let $footer = $(this.footer());
                let $input = $footer.find("input");

                if ($input.length) {

                    if ($footer.hasClass(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)) {
                        let $checkboxIcon = $footer.find(".checkbox-icon");

                        stateObject.val = $checkboxIcon.length ? $checkboxIcon.text().trim() : ""
                    } else {
                        stateObject.val = $input.val().trim();
                    }
                }

                columnFilterStateObjects.push(stateObject);
            })

            return columnFilterStateObjects;
        }

        /**
         * Add additional styling information to given column cells
         *
         * @see _onInitComplete
         * @param tableApi Table api object
         * @private Call in _onInitComplete
         */
        function _addCellStyleInformation(tableApi) {
            const columns = tableApi.columns();

            columns.every(function(index){
                const $columnHeader = $(this.header());

                if ($columnHeader.hasClass("tag-column") && $columnHeader.is("[custom-options]")) {
                    let customOptions = JSON.parse($columnHeader.attr("custom-options"));
                    let nodes = this.nodes();

                    nodes.each(node => {
                        let $node = $(node);

                        if (customOptions.styleClass) {
                            $node.addClass(customOptions.styleClass);
                        }

                        if (customOptions.minWidth) {
                            $node.css("min-width", customOptions.minWidth);
                        }

                        if (customOptions.width) {
                            $node.css("width", customOptions.width);
                        }

                        if (customOptions.maxWidth) {
                            $node.css("max-width", customOptions.maxWidth);
                        }
                    })
                }
            })
        }

        /**
         * Function to add or overwrite default options with additional options.
         * @returns JS-object of options to initialize DataTables instance.
         * @private
         */
        function _generateTableOptions() {
            if (customOptions) {
                let initOptions = DEFAULT_OPTIONS;
                Object.keys(customOptions).forEach(function (key) {
                    initOptions[key] = customOptions[key];
                });
                return initOptions;
            } else {
                return DEFAULT_OPTIONS;
            }
        }

        /**
         * Function to generate DOM structure in datatables options.
         * @returns {string}
         * @private
         */
        function _generateDomOptions() {
            if (!_hasSearchField()) {
                if (!_hasButtons()) {
                    return dataTablesConstants.NO_SEARCHFIELD_AND_BUTTONS_DOM;
                } else {
                    return dataTablesConstants.NO_SEARCHFIELD_DOM;
                }
            } else if (!_hasButtons()) {
                return dataTablesConstants.NO_BUTTONS_DOM;
            } else {
                return dataTablesConstants.DEFAULT_DOM;
            }
        }

        /**
         * Function to trigger further functions immediately after DataTables instance has been initialized.
         * @private
         */
        function _onInitComplete() {
            if (!_hasInitAsSingle()) {
                _hideSearchFieldOnSmallPageSize();
            } else {
                _initAsSingle();
            }

            _initCustomEvents();

            if (_isTreeTable()) {
                dataTablesTreeTables.initTreeTables(table, $tableElement, visibleRowParentIds, useInfoCache, internalRowInfoCache);
            }

            if (_hasColvis()) {
                dataTablesButtons.customizeColvisButtons(table, $tableElement, colvisHiddenIndexes);
                dataTablesButtons.initColumnSortByColvisButtons(table, $tableElement, colvisHiddenIndexes);
            }

            // TODO Note GSI 2021-12-08: Triple Switch is currently only used is some demos. Could probably be removed.
            dataTablesButtons.initTripleSwitch(table, $tableElement, _hideLevelsOneAndTwo, _showLevelsOneAndTwo, _resetDataTablesPageSize, _setDataTablesToSingleData);

            if (typeof (inlineTagEdit) !== "undefined") {
                inlineTagEdit.initialize(table);
            }

            if (_hasColumnFilters()) {
                dataTablesFilters.initColumnFilters(table, customOptions);
            }

            dataTablesButtons.addClearSearchAndFilterButtons($tableElement);

            try {
                USER_ID = typeof (currentUserId) !== 'undefined' && currentUserId != null ? currentUserId : ""; // global variable set in default.xhtml
            } catch (e) {
                // console.log(e)
                USER_ID = "";
            }

            $tableElement.removeClass('hidden');

            dataTablesButtons.createToggleAllDetailsButton(table);
            _addTsRefToSearchField();
            _addDynamicTooltipToSearchField();
            _toggleSearchFieldAndColumnFilterVisibility();
            _activateTableState();

            _addCellStyleInformation(table);
        }

        /**
         * Function to activate the table state.
         * The stateSaveCallback should only be executed if the datatables is fully initialized. The attribute
         * ts-initialized is set to early for the use case.
         * @private
         */
        function _activateTableState() {
            if (customOptions == null) {
                customOptions = {};
            }
            customOptions.tableStateActive = true;
        }

        /**
         * Function to toggle visibility of column filters and global search field on initialization.
         * @private
         */
        function _toggleSearchFieldAndColumnFilterVisibility() {
            const $dtWrapper = $tableElement.closest(dataTablesConstants.DT_WRAPPER_SELECTOR);

            if ($dtWrapper.length) {
                if (!showSearchField) {
                    _toggleSearchField($dtWrapper.find('.' + dataTablesConstants.DT_SEARCH_FIELD_TOGGLER_CLASS))
                }

                if (!showColumnFilters) {
                    _toggleFilterRow($dtWrapper.find('.' + dataTablesConstants.COLUMN_FILTERS_TOGGLER_CLASS))
                }
            } else {
                console.error("Wrapper element does not exist")
            }
        }

        /**
         * Function to add a ts-ref attribute to the global search field.
         * @private
         */
        function _addTsRefToSearchField() {
            const $searchWrapper = $tableElement.closest('form').find(dataTablesConstants.DT_SEARCH_FIELD_SELECTOR);
            const tsRefText = tableSelector.substring(1).concat('-search-input-field');
            $searchWrapper.find('input').attr('ts-ref', tsRefText);
        }

        /**
         * Add dynamic tooltip to the global search field
         * @private
         */
        function _addDynamicTooltipToSearchField() {
            const $searchWrapper = $tableElement.closest('form').find(dataTablesConstants.DT_SEARCH_FIELD_SELECTOR);

            if ($searchWrapper.length) {
                let $inputField = $searchWrapper.find("input")
                $inputField.addClass(["tooltipped", "dynamic"]);
                $inputField.attr("data-position", "right");
            }
        }

        /**
         * Function to get default responsive settings for DataTables instance.
         * @returns JS-object containing responsive settings.
         * @private
         */
        function _getResponsiveSettings() {
            let responsiveSettings = dataTablesConstants.DEFAULT_RESPONSIVE_OPTIONS;
            if (_hasDetailsColumn()) {
                responsiveSettings['details'] = {
                    type: 'column',
                    target: dataTablesConstants.DETAILS_COL_DEFAULT_POSITION
                }
            } else {
                responsiveSettings['details'] = false;
            }
            return responsiveSettings;
        }

        /**
         * Function to get default column reorder settings for DataTables instance.
         * @returns JS-object or boolean containing column reorder settings.
         * @private
         */
        function _getColReorderSettings() {
            if (_hasDetailsColumn()) {
                return {fixedColumnsRight: 1};
            } else {
                return true;
            }
        }

        /**
         * Function to get definitions for special cases and additional settings for columns.
         * This is also where grouped sorting for a tree table is set.
         * @returns JS-object containing additional column settings.
         * @private
         */
        function _getColumnDefs() {
            let colDefsArray = [
                {targets: 'actions', responsivePriority: 2},
                {targets: dataTablesConstants.PROCESSED_HTML_FILTER_COLUMN, render: {
                    filter: function(data, type, row, meta) {
                         // remove all html tags for filtering and replace them with a delimiter
                        return data
                            .replace(dataTablesConstants.REGEX_MATCH_HTML_TAGS, '|');
                    }
                }},
                {targets: dataTablesConstants.NON_ORDERABLE, orderable: false},
                {targets: dataTablesConstants.NON_FILTERABLE, searchable: false},
                {targets: 'never', orderable: false},
                {targets: 'breadcrumbs', visible: false},
                {targets: 'colvis-deselected', visible: false}
            ];
            if (_hasDetailsColumn()) {
                colDefsArray.push({
                    targets: dataTablesConstants.DETAILS_COL_DEFAULT_POSITION,
                    className: 'control',
                    orderable: false,
                    responsivePriority: 1,
                    render: function (data, type, full, meta) {
                        return data
                            + '<span ' +
                            'class="tooltipped" ' +
                            'data-tooltip="' + tsMsg('de.techspring.common.datatables.custom.buttons.tooltips.details.show.value') + '" ' +
                            'style="z-index: 99; height: 100%; width: 100%; position: absolute; left: 0; top: 0;"/>';
                    }
                });
            }
            if (_isTreeTable()) {
                colDefsArray.push({
                    targets: '_all',
                    type: 'grouped',
                    render: {
                        sort: function (value, func, row, meta) {
                            return {value: _prepareUmlautsForSort(value), row: row, meta: meta};
                        },
                        filter: function (value, func, row, meta) {
                            return _removeHtmlTags(value);
                        }
                    }
                });
            } else {
                colDefsArray.push(
                    {
                        targets: '_all', render: {
                            sort: function (value, func, row, meta) {
                                return _prepareUmlautsForSort(value)
                            }
                        }
                    },
                    {targets: dataTablesConstants.NUMBER_COLUMN_CLASS, type: 'any-number'},
                    {targets: dataTablesConstants.NUMERIC_SORT_CLASS, type: 'any-number'}
                );
            }
            return colDefsArray;
        }

        /**
         * Function to check if current html table contains a footer element to place column filters inside.
         * @returns {boolean}
         * @private
         */
        function _hasColumnFilters() {
            return $tableElement.find('tfoot').length > 0;
        }

        /**
         * Function to check if current DataTables instance uses a search field.
         * @returns {boolean}
         * @private
         */
        function _hasSearchField() {
            return !(customOptions && customOptions.hideSearchField);
        }

        /**
         * Function to check if current DataTables instance uses buttons.
         * @returns {boolean}
         * @private
         */
        function _hasButtons() {
            return !(customOptions && customOptions.hideButtons);
        }

        /**
         * Function to check if current DataTables instance uses the column visibility toggle button.
         * INFO GSI 2020-07-09: at the moment this always returns true, as per design. Content of this method may change, though.
         * @returns {boolean}
         * @private
         */
        function _hasColvis() {
            return true;
        }

        /**
         * Function to check if there is a callback function aligned with this DataTables instance to create new rows of data.
         * @returns {boolean}
         * @private
         */
        function _hasAddFunction() {
            if (customOptions && customOptions.callbackAddFunction) {
                return typeof customOptions.callbackAddFunction === 'function';
            }
        }

        /**
         * Function to check if a table is initialized to always only show a single row.
         * @returns {boolean}
         * @private
         */
        function _hasInitAsSingle() {
            return customOptions && customOptions.initAsSingle;
        }

        /**
         * Function to check if html table structure contains a dedicated column for handling responsive details toggle.
         * @returns {boolean}
         * @private
         */
        function _hasDetailsColumn() {
            return $tableElement.find('.details-column').length > 0;
        }

        /**
         * Function to check if table will use a tree structure.
         * @returns {*|jQuery|boolean}
         * @private
         */
        function _isTreeTable() {
            return $tableElement.hasClass('tree-table');
        }

        /**
         * Function to add custom sorting.
         * @private
         */
        function _addCustomSorting() {
            jQuery.extend(jQuery.fn.dataTableExt.oSort, {
                'grouped-asc': function (a, b) {
                    return dataTablesTreeTables.recursiveTreeSortWrapper(a, b, true, useInfoCache, internalRowInfoCache, _anyNumberSort, _removeHtmlTags);
                },
                'grouped-desc': function (a, b) {
                    return dataTablesTreeTables.recursiveTreeSortWrapper(a, b, false, useInfoCache, internalRowInfoCache, _anyNumberSort, _removeHtmlTags);
                },
                'any-number-asc': function (a, b) {
                    return _anyNumberSort(a, b, Number.NEGATIVE_INFINITY);
                },
                'any-number-desc': function (a, b) {
                    return _anyNumberSort(a, b, Number.NEGATIVE_INFINITY) * -1;
                }
            });
        }

        /**
         * Function to sort any type of number.
         * @param a datatables comparable value api instance.
         * @param b datatables comparable value api instance.
         * @param high highest possible value.
         * @returns {number}
         * @private
         */
        function _anyNumberSort(a, b, high) {
            a = _prepareNumberForSort(a, high);
            b = _prepareNumberForSort(b, high);
            return ((a < b) ? -1 : ((a > b) ? 1 : 0));
        }

        /**
         * Function to initialize custom DataTables events.
         * @private
         */
        function _initCustomEvents() {
            /**
             * Event for page size change.
             */
            $tableElement.on('length.dt', function (e, settings, newPageSize) {
                _hideSearchFieldOnSmallPageSize();
            });

            /**
             * Event for additional initialization when opening detail columns.
             */
            $tableElement.find(' > tbody').on('click', 'td.control', function () {
                const tr = $(this).closest('tr');
                const row = table.row(tr);
                const open = row.child.isShown();

                if (open) {
                    materializetool.initOnLoadAndAjax();
                }
            });

            /**
             * Event for toggling details columns or other child rows.
             */
            table.on('responsive-display', function (e, datatable, rowNum, showHide, update) {
                if (showHide) {
                    const row = datatable.row(rowNum);
                    const $rowNode = $(row.node());
                    const $rowChild = $(row.child());

                    if ($rowNode.hasClass('odd') && row.child() && !$rowChild.hasClass('odd')) {
                        $rowChild.removeClass('even');
                        $rowChild.addClass('odd');
                    } else if ($rowNode.hasClass('even') && row.child() && !$rowChild.hasClass('even')) {
                        $rowChild.removeClass('odd');
                        $rowChild.addClass('even');
                    }

                    row.child().find("li[data-dtr-index]").each(function (index, liElement) {
                        let $liElement = $(liElement);
                        let columnIndex = $liElement.attr("data-dtr-index");
                        let $tdElement = $(row.cell(row.index(), columnIndex).node());
                        let childClass = $tdElement.attr("child-class");
                        if (childClass) {
                            $liElement.addClass(childClass);
                        }
                    });

                    $('.dtr-details').each(function (idx) {
                        const $that = $(this);
                        if ($that.find('li:not(.hidden-child)').length <= 0 && $that.find('.empty-details-info').length <= 0) {
                            $that.append('<i class="empty-details-info">' + tsMsg("de.techspring.common.datatables.custom.no.details.info.value") + '</i>');
                        }
                    });
                }
            });

            /**
             * Event for toggling visibility of a column in ColVis menu.
             */
            table.on('column-visibility', function (e, settings, colIdx, isVisible) {
                if (isVisible) {
                    const thisColumn = table.column(colIdx);
                    let $filterField = $(thisColumn.footer());
                    if ($filterField.hasClass(dataTablesConstants.SELECT_FILTER_CLASS)
                        || $filterField.hasClass(dataTablesConstants.SELECT_FILTER_HTML_ESCAPE_CLASS)
                        || $filterField.hasClass(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)
                        && $filterField.find('input').length <= 0) {
                        materializetool.initSelect();
                        $filterField.find('input').attr("placeholder", dataTablesConstants.FILTER_PLACEHOLDER);

                        if ($filterField.hasClass(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)) {
                            const $inputElement = $filterField.find('input.select-dropdown');
                            const searchValue = $inputElement.val();
                            $inputElement.val('');
                            if ($inputElement.closest('.select-wrapper').find('.checkbox-icon').length <= 0) {
                                $inputElement
                                    .closest('.select-wrapper')
                                    .append('<i class="material-icons checkbox-icon">' + searchValue + '</i>');
                            } else {
                                $inputElement
                                    .closest('.select-wrapper')
                                    .find('.checkbox-icon')
                                    .text(searchValue);
                            }
                        }
                    }
                    if ($filterField.hasClass(dataTablesConstants.SELECT_ICON_FILTER_CLASS)) {
                        dataTablesFilters.restoreSelectFilterIcon(table, thisColumn, thisColumn.search());
                    }
                }
                table.columns.adjust();

                materializetool.recognizeLastElementsInTable(table.nodes()[0]);
            });

            /**
             * Event for changing column order.
             */
            table.on('column-reorder', function (e, settings, details) {
                dataTablesButtons.customizeColvisButtons(table, $tableElement, colvisHiddenIndexes);
                dataTablesButtons.initColumnSortByColvisButtons(table, $tableElement, colvisHiddenIndexes);
                materializetool.recognizeLastElementsInTable(table.nodes()[0]);
            });

            /**
             * Event for any type of search. Event is also triggered by column filters.
             */
            table.on('search.dt', function (e, settings) {
                dataTablesButtons.customizeColvisButtons(table, $tableElement, colvisHiddenIndexes);
                dataTablesButtons.addClearSearchAndFilterButtons($tableElement);

                if (_isTreeTable()) {
                    dataTablesTreeTables.processTreeSearch(table, $tableElement, isTreeSearchProcessed, visibleRowParentIds, visibleRowParentIdsTemp);
                }
            });

            /**
             * Event for page change.
             */
            table.on('page.dt', function (e, settings) {
                // TODO GSI 2020-06-17: it should be better to get the connection status from a preference object instead of a css class
                if ($('.single-data.active').length > 0) {
                    _getInstancesOfDataTables().each(function () {
                        $(this).DataTable().page(table.page.info().page).draw(false);
                    });
                }

                let tableConfig = materializetool.tables[$(this).attr("datatable-selector")];
                if (tableConfig && tableConfig.customOptions && typeof (tableConfig.customOptions.callbackPageChangeFunction) === 'function') {
                    tableConfig.customOptions.callbackPageChangeFunction();
                }

                materializetool.recognizeLastElementsInTable(table.nodes()[0]);
                dataTablesButtons.checkAllDetailsButtonStatus($tableElement, table);
            });

            /**
             * Event after table has been drawn.
             */
            table.on('draw.dt', function (e, settings) {
                let tableConfig = materializetool.tables[$(this).attr("datatable-selector")];
                if (tableConfig && tableConfig.customOptions && typeof (tableConfig.customOptions.callbackDrawFunction) === 'function') {
                    tableConfig.customOptions.callbackDrawFunction();
                }

                if (typeof (inlineTagEdit) !== "undefined") {
                    inlineTagEdit.initializeOnOtherEvents(table);
                }

                dataTablesAdditionalPlugins.generateResultsRow($tableElement, table);
                materializetool.delayedUpdateResponsiveTables();
            });

            /**
             * Event after table has been initialized.
             */
            table.on('init.dt', function (e, settings) {
                if (customOptions && typeof (customOptions.callbackInitFunction) === 'function') {
                    customOptions.callbackInitFunction(table);
                }
                dataTablesAdditionalPlugins.generateResultsRow($tableElement, table);
            });

            /**
             * Delegated event for clearing (search and filter) input fields.
             */
            $tableElement.closest('form').on('click', '.clear-input-btn', function (event) {
                $(this).parent().find('input').val('').keyup();
            });
        }

        /**
         * Function to initialize a table to always only show a single row.
         * @private
         */
        function _initAsSingle() {
            _hideLevelsOneAndTwo();
            _setTableToSingleData($tableElement);
        }

        /**
         * Function to automatically hide the search field if the page size is below a threshold (here: below 2).
         * @private
         */
        function _hideSearchFieldOnSmallPageSize() {
            const pageSize = table.page.info().length;
            const $dtWrapper = $tableElement.closest(dataTablesConstants.DT_WRAPPER_SELECTOR);
            if (pageSize > -1 && pageSize < 2) {
                $dtWrapper.find(dataTablesConstants.DT_SEARCH_FIELD_SELECTOR).hide();
                $dtWrapper.find('.' + dataTablesConstants.DT_SEARCH_FIELD_TOGGLER_CLASS).hide();
                _clearSearch();
            } else {
                $dtWrapper.find(dataTablesConstants.DT_SEARCH_FIELD_SELECTOR).show();
                $dtWrapper.find('.' + dataTablesConstants.DT_SEARCH_FIELD_TOGGLER_CLASS).show();
            }
        }

        /**
         * Function to process column filter row visibility toggle button click.
         * @param btn hide/show column filters
         * @private
         */
        function _toggleFilterRow(btn) {
            const $btn = $(btn);

            if ($btn.hasClass("active")) {
                $tableElement.find('.' + dataTablesConstants.COLUMN_FILTER_GROUP_CLASS).hide();
                $(btn).removeClass('active');

                // INFO GSI 2020-07-07: callback function in reduce method populates and returns array of indexes for elements longer than 0
                const activeFilterColumnIndexes = table.columns(':not(.never)').search().toArray().reduce((returnArray, element, index) => ((element.length > 0) && returnArray.push(index), returnArray), []);

                if (activeFilterColumnIndexes.length > 0) {
                    let tooltipText = tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.colfilters.warning.substring.start");
                    let tooltipTextEnd = tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.colfilters.warning.substring.end");

                    for (let i = 0; i < activeFilterColumnIndexes.length; i++) {
                        if (i + 1 === activeFilterColumnIndexes.length && i > 0) {
                            tooltipText = tooltipText.concat(tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.colfilters.warning.substring.middlealt"));
                        } else if (i + 1 < activeFilterColumnIndexes.length && i > 0) {
                            tooltipText = tooltipText.concat(tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.colfilters.warning.substring.middle"));
                        }
                        const dtColumn = table.column(activeFilterColumnIndexes[i]);
                        const headerText = $(dtColumn.header()).text();
                        const $colFilterField = $(dtColumn.footer());
                        let filterText;
                        if ($colFilterField.hasClass(dataTablesConstants.SELECT_FILTER_CLASS) && !dtColumn.visible()) {
                            filterText = $colFilterField.find('select').val();
                        } else {
                            filterText = $colFilterField.find('input').val();
                        }
                        tooltipText = tooltipText.concat('"' + filterText + '"' + tsMsg("de.techspring.common.datatables.custom.buttons.tooltips.colfilters.warning.substring.column") + '"' + headerText + '"');
                    }
                    tooltipText = tooltipText.concat(tooltipTextEnd);

                    let $activeFilterInvisibleWarning = $('<i class="material-icons tooltipped active-filter-invisible-warning">warning</i>');
                    $(btn).prepend($activeFilterInvisibleWarning);
                    $activeFilterInvisibleWarning.attr(dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP, tooltipText);
                }
                showColumnFilters = false;
            } else {
                $('.active-filter-invisible-warning').remove();

                $(btn).addClass('active');
                $tableElement.find('.' + dataTablesConstants.COLUMN_FILTER_GROUP_CLASS).show();
                showColumnFilters = true;
            }

            table.state.save();
            materializetool.delayedUpdateResponsiveTables();
        }

        /**
         * Function to process search field visibility toggle button click.
         * @param btn hide/show search field button
         * @private
         */
        function _toggleSearchField(btn) {
            const $btn = $(btn);

            if ($btn.length) {
                const $dtWrapper = $tableElement.closest(dataTablesConstants.DT_WRAPPER_SELECTOR);
                const $dtGlobalSearchField = $dtWrapper.find(dataTablesConstants.DT_SEARCH_FIELD_SELECTOR);

                if ($btn.hasClass("active")) {
                    $dtGlobalSearchField.hide();
                    _clearSearch();
                    $btn.removeClass('active');
                    showSearchField = false;
                } else {
                    $dtGlobalSearchField.show();
                    $btn.addClass('active');
                    showSearchField = true;
                }

                table.state.save();
                materializetool.delayedUpdateResponsiveTables();
            } else {
                console.error("Button element does not exist", btn)
            }
        }

        /**
         * Function to clear out currently set table search (not column filters!)
         * @private
         */
        function _clearSearch() {
            table.search('').draw(false);
        }

        /**
         * Function for setting all current tables to "single data" mode.
         * @private
         */
        function _setDataTablesToSingleData() {
            _getInstancesOfDataTables().each(function () {
                _setTableToSingleData($(this));
            });
        }

        /**
         * Function for setting a table to "single data" mode.
         * @private
         */
        function _setTableToSingleData($thisTable) {
            $thisTable.DataTable().page.len(1).draw(false);
            $thisTable.closest(dataTablesConstants.DT_WRAPPER_SELECTOR).find(dataTablesConstants.DT_PAGE_LENGTH_MENU_SELECTOR).hide();
        }

        /**
         * *************************************************************************************************************
         * Helper functions
         */

        /**
         * Helper function for hiding hierarchy when setting a table to "single data" or "my data" mode.
         * @private
         */
        function _hideLevelsOneAndTwo() {
            table.column(dataTablesConstants.BREADCRUMBS_COL_SELECTOR).visible(true);
            table.column(dataTablesConstants.HIERARCHY_DATA_COL_SELECTOR).search("");
            table.column(dataTablesConstants.HIERARCHY_LEVEL_COL_SELECTOR).search('3').draw(false);
        }

        /**
         * Helper function for showing hierarchy when setting a table to "all data" mode.
         * @private
         */
        function _showLevelsOneAndTwo() {
            table.column(dataTablesConstants.BREADCRUMBS_COL_SELECTOR).visible(false);
            table.column(dataTablesConstants.HIERARCHY_LEVEL_COL_SELECTOR).search("");
            dataTablesTreeTables.filterForParentRowIds(visibleRowParentIds);
        }

        /**
         * Helper function to reset a dataTable's page size after leaving "single data" mode.
         * @private
         */
        function _resetDataTablesPageSize() {
            _getInstancesOfDataTables().each(function () {
                const $dt = $(this);
                const formerPageSize = _getFormerPageSize($dt);
                $dt.DataTable().page.len(formerPageSize).draw(false);
                $dt.closest(dataTablesConstants.DT_WRAPPER_SELECTOR).find(dataTablesConstants.DT_PAGE_LENGTH_MENU_SELECTOR).show();
            })
        }

        /**
         * Helper function to get all instances of DataTables on current page.
         * @returns {*|jQuery.fn.init|jQuery|HTMLElement}
         * @private
         */
        function _getInstancesOfDataTables() {
            return $('.dataTable');
        }

        /**
         * Helper function to get former page size of a dataTable.
         * //TODO GSI 2020-06-17: This function should refer to a stored preference value instead of the currently shown select menu value
         * @param $dtInstance
         * @returns {number}
         * @private
         */
        function _getFormerPageSize($dtInstance) {
            const selectMenuValue = $dtInstance.closest(dataTablesConstants.DT_WRAPPER_SELECTOR).find(dataTablesConstants.DT_PAGE_LENGTH_MENU_SELECTOR).find('li.selected').text();
            const valueAsInteger = parseInt(selectMenuValue, 10);
            return isNaN(valueAsInteger) ? -1 : valueAsInteger;
        }

        /**
         * Helper function to prepare any number for sorting.
         * @param number numerical value.
         * @param high highest possible value.
         * @returns {number|*}
         * @private
         */
        function _prepareNumberForSort(number, high) {
            const reg = /[+-]?((\d+(\.\d*)?)|\.\d+)([eE][+-]?[0-9]+)?/;
            let preparedNumber = '' + number;
            preparedNumber = _removeHtmlTags(preparedNumber).toLowerCase();
            preparedNumber = preparedNumber.replace(/\./g, '');
            preparedNumber = preparedNumber.replace(',', '.').match(reg);
            preparedNumber = preparedNumber !== null ? parseFloat(preparedNumber[0]) : high;
            return preparedNumber;
        }

        /**
         * Helper function to exchange German special characters to standard characters for correct sorting.
         * @param value any String value.
         * @returns {string}
         * @private
         */
        function _prepareUmlautsForSort(value) {
            let preparedValue;
            if (value) {
                preparedValue = value
                    .toLowerCase()
                    .replace(/ä/g, "ae")
                    .replace(/ö/g, "oe")
                    .replace(/ü/g, "ue")
                    .replace(/ß/g, "sz");
            } else {
                preparedValue = value;
            }
            return preparedValue;
        }

        /**
         * Helper function to remove HTML-Tags from a string value.
         * @param value
         * @returns {*}
         * @private
         */
        function _removeHtmlTags(value) {
            if (value) {
                const regex = /<.+?>/g;
                return value.replace(regex, "");
            } else {
                return '';
            }
        }

        /**
         * Helper function to remove HTML-Tags from a string value, including their inner html content.
         * @param value
         * @returns {*}
         * @private
         */
        function _removeHtmlTagsWithContent(value) {
            if (value) {
                const regex = /<.+?>((?:.*?\r?\n?)*)<.+?>/g;
                return value.replace(regex, "");
            } else {
                return '';
            }
        }

        /**
         * Helper function to remove any non-numerical values from a String and return a number.
         * @param value
         * @returns {number}
         * @private
         */
        function _getPureDecimalNumber(value) {
            value = value
                .replace(/\./g, '')
                .replace(/€/g, '')
                .replace(/&nbsp/g, '')
                .replace(/,/g, '.');
            return value.replace(/[^\d.-]/g, '') * 1;
        }
    }

    /**
     * Function to switch between tree table and regular table view.
     */
    switchView() {
        const that = this;
        let listViewColumnOrder;
        let val = _switchDataTableTreeOrDefaultView();
        if (val === 1) {
            listViewColumnOrder = this.table.colReorder.order();
        }
        _switchColumnOrderNew(val);

        /**
         * Function to switch view in Datatable.
         * @returns number 1 = tree view or 0 = default view
         * @private
         */
        function _switchDataTableTreeOrDefaultView() {
            let searchInput = that.$tableElement.find(".view-prefilter").find("input");
            let iconBtn = $("#switchViewBtn").find("i");
            let val = searchInput.val();
            let newVal = 0;
            const $treeTableLevelsBtn = that.$tableElement.closest('.dataTables_wrapper').find('.tree-table-levels-btn');

            if (val === "0" || val === 0) {
                searchInput.val(1).trigger("change");
                iconBtn.text("low_priority")
                newVal = 1;
                that.$tableElement.removeClass('tree-inactive');
                $treeTableLevelsBtn.removeClass('hidden');
            } else {
                searchInput.val(0).trigger("change");
                iconBtn.text("wrap_text")
                if (!that.$tableElement.hasClass('tree-inactive')) {
                    that.$tableElement.addClass('tree-inactive');
                }
                if (!$treeTableLevelsBtn.hasClass('hidden')) {
                    $treeTableLevelsBtn.addClass('hidden');
                }
            }
            return newVal;
        }

        /**
         * Function to process of column order change.
         * @param val case 0: default view, case 1: tree view
         * @private
         */
        function _switchColumnOrderNew(val) {
            switch (val) {
                case 0:
                    that.table.colReorder.order(listViewColumnOrder, true);
                    break;
                case 1:
                    const treeOrderRef = "tree-order-ref";
                    const colsWithOrderRef = that.table.columns($('[' + treeOrderRef + ']'));

                    const processingOrder = colsWithOrderRef[0].sort(function (a, b) {
                        return $(that.table.column(a).header()).attr(treeOrderRef) - $(that.table.column(b).header()).attr(treeOrderRef);
                    });
                    colsWithOrderRef[0] = processingOrder;
                    const oldColOrder = [...listViewColumnOrder];
                    let newColOrder = [...listViewColumnOrder];
                    colsWithOrderRef.every(function () {
                        const value = oldColOrder[parseInt(this.index())];
                        const currentIndex = newColOrder.indexOf(value);
                        const newIndex = parseInt($(this.header()).attr(treeOrderRef));
                        newColOrder = arrayChangePosition(newColOrder, currentIndex, newIndex);
                    });
                    that.table.colReorder.order(newColOrder, true);
                    break;
            }
        }
    }
}

/**
 * Includes helper functions for working with DataTables. This structure is conform to JavaScript ES5, therefore can
 * be used in common projects.
 *
 * ++++++ IMPORTANT: +++++++
 * It is compulsory to have ts_materialize.js included in your project.
 */
(function () {
    if (!window.tsDataTableHandler) window.tsDataTableHandler = function ($) {
        if (typeof materializetool === "undefined") {
            console.error("It is compulsory to include ts_materialize.js to your project")
            return;
        }

        const TsDataTableHandler = {};

        /**
         * Returns the table of the passed body element. It it doesn't exist, undefined will be returned.
         *
         * @param $bodyElement Child of table's tbody element (jQuery object)
         */
        TsDataTableHandler.getTableByBodyElement = function ($bodyElement) {
            let table = undefined;

            if ($bodyElement instanceof jQuery) {
                let $tbody = $bodyElement.parents("tbody");

                if ($tbody.length) {
                    let datatableSelector = $tbody.attr("datatable-selector");

                    if (datatableSelector in materializetool.tables) {
                        table = materializetool.tables[datatableSelector].table;
                    }
                }
            } else {
                console.warn("Passed element isn't an instance of jQuery", $bodyElement);
            }

            return table;
        }

        /**
         * Returns the column of the passed footer element. If it is not found, undefined wil be returned.
         *
         * The jQuery '.is' function is used to determine equality.
         *
         * @param table Table element of the column, materializetool.tables[tableName].table
         * @param $footerElement jQuery object of the footer element. Usually fetched by $(column.footer()).
         *
         * @see https://datatables.net/reference/api/column()
         * @see https://api.jquery.com/is/
         */
        TsDataTableHandler.getColumnByFooter = function (table, $footerElement) {
            let column;

            if (table && $footerElement.length) {
                table.columns().every(function () {
                    let $footerField = $(this.footer())

                    if ($footerElement.is($footerField)) {
                        column = this;
                    }
                })
            } else {
                console.warn("Couldn't fetch column because the table table and $footerElement parameters are invalid",
                    table, $footerElement);
            }

            return column;
        }

        /**
         * Assigns the placeholder to the filter field of the passed column.
         *
         * @param table Table element of the column, materializetool.tables[tableName].table
         * @param column The column element of the table. Get the column element via DataTables Api functions
         * @param override Flag if an existing place holder should be overriding
         * @param placeHolder Value of the place holder. Default is used if not set
         */
        TsDataTableHandler.createPlaceHolderForFilter = function (table, column, override, placeHolder) {
            if (typeof placeHolder === "undefined") {
                placeHolder = dataTablesConstants.FILTER_PLACEHOLDER;
            }

            if (typeof override === "undefined") {
                override = true;
            }

            if (typeof table !== "undefined" && typeof column !== "undefined") {
                const $footer = $(column.footer());

                if ($footer.length) {
                    let $inputField;

                    if ($footer.hasClass(dataTablesConstants.SELECT_FILTER_CLASS)
                        || $footer.hasClass(dataTablesConstants.SELECT_ICON_FILTER_CLASS)
                        || $footer.hasClass(dataTablesConstants.SELECT_FILTER_HTML_ESCAPE_CLASS)) {
                        $inputField = $footer.find('input');
                    } else if ($footer.hasClass(dataTablesConstants.SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS)) {
                        const $inputElement = $footer.find('input.select-dropdown');
                        const $selectWrapper = $inputElement.closest('.select-wrapper');
                        const $checkboxIcon = $selectWrapper.find('.checkbox-icon');

                        if ($checkboxIcon.length <= 0) {
                            $inputField = $selectWrapper.find('input');
                        }

                        $inputElement.val('');
                    }

                    if ($inputField) {
                        if (override || !$inputField.attr("placeholder")) {
                            $inputField.attr("placeholder", placeHolder);
                        }
                    }
                } else {
                    console.warn("Couldn't find filter field.", column);
                }

            } else {
                console.warn("Table and column element should be non null")
            }
        }

        /**
         * Refreshes the select html escape filter.
         *
         * Re-Initialization of the passed column's filter. This function initializes the filter field, assigns the filter
         * values and adds the placeholder.
         *
         * The selectable values are fetched by dataTables's .data() method. It may be necessary to invalidate
         * the table element (reset the cache of the table).
         *
         * @param table Table element of the column, materializetool.tables[tableName].table
         * @param column The column element of the table. Get the column element via DataTables Api functions
         * @param invalidateTable Invalidates the table if set to true (optional parameter, default true)
         *
         * @see https://datatables.net/reference/api/rows().invalidate()
         * @see https://datatables.net/reference/api/column()
         */
        TsDataTableHandler.refreshSelectHtmlEscapeFilter = function (table, column, invalidateTable) {
            if (typeof invalidateTable === "undefined") {
                invalidateTable = true;
            }

            if (typeof table !== "undefined" && typeof column !== "undefined") {
                let $footer = $(column.footer());

                if ($footer.length) {
                    let $inputField = $footer.find(".select-wrapper > .select-dropdown.dropdown-trigger");

                    let lastValue = $inputField.val();
                    let lastValues = [];

                    if (lastValue) {
                        lastValue
                            .trim()
                            .replace(dataTablesConstants.FILTER_PLACEHOLDER, "")
                            .split(",")
                            .forEach(text => lastValues.push(text.trim()));
                    }

                    if (!$footer.hasClass(dataTablesConstants.NON_FILTERABLE)) {
                        if ($footer.hasClass(dataTablesConstants.SELECT_FILTER_HTML_ESCAPE_CLASS)) {
                            const emptyOptionText = tsMsg("de.techspring.common.datatables.custom.filters.select.empty.value");

                            if (invalidateTable) {
                                table.rows().invalidate();
                            }

                            $footer.empty()

                            let valArray = [];
                            let $select = $('<select multiple></select>');

                            const isOrthogonalData = column.nodes()[0].hasAttribute('data-search');

                            if (isOrthogonalData) {
                                dataTablesFilters.processOrthogonalData(column, valArray);
                            } else {
                                column.data().unique().sort().each(function (value, idx) {
                                    let splitVal = value
                                        .replace(dataTablesConstants.REGEX_MATCH_LINE_BREAKS, "") // remove line breaks
                                        .replace(dataTablesConstants.REGEX_MATCH_ICON_TAGS, '') // remove icons by their i tags
                                        .split(dataTablesConstants.REGEX_MATCH_HTML_TAGS);

                                    if ($footer.classList.contains(dataTablesConstants.SELECT_FILTER_COMMA_SEPARATED_HELPER_CLASS)) {
                                        let tempSplitVal = splitVal.join(', ');
                                        splitVal = tempSplitVal.split(', ');
                                    }

                                    dataTablesFilters.processFilterValuesArray(valArray, splitVal);
                                });
                            }
                            if ($footer.hasClass(dataTablesConstants.ADD_EMPTY)
                                && jQuery.inArray("", valArray) === -1) {

                                valArray.unshift("");
                            }

                            valArray.forEach(value => {
                                let $option;

                                if (value.length <= 0) {
                                    $option = $('<option value="^$"><i>' + emptyOptionText + '</i></option>'); // additional option for explicit empty string search
                                } else {
                                    $option = $('<option value="' + value + '">' + value + '</option>');
                                }

                                if (lastValues.includes(value) || (value === "" && lastValues.includes(tsDataTableHandler.decodeHtmlText(emptyOptionText)))) {
                                    $option.prop("selected", true);
                                }

                                $select.append($option);
                            });

                            $footer.append($select);

                            materializetool.initSelectElement($select);

                            tsDataTableHandler.createPlaceHolderForFilter(table, column, true);

                            $select.trigger("change", [table, false]);      // Triggers the search event
                        } else {
                            console.warn("The filter is only suitable for " +
                                dataTablesConstants.SELECT_ICON_FILTER_CLASS, $footer);
                        }
                    } else {
                        console.warn("The filter field is not filterable")
                    }
                } else {
                    console.warn("The passed column field does not exist");
                }
            } else {
                console.warn("Table and column element should be non null")
            }
        }

        /**
         * Refreshes the select icon filter.
         *
         * Re-Initialization of the passed column's filter. This function initializes the filter field, assigns the filter
         * values and adds the placeholder.
         *
         * The selectable values are fetched by dataTables's .data() method. It may be necessary to invalidate
         * the table element (reset the cache of the table).
         *
         * @param table Table element of the column, materializetool.tables[tableName].table
         * @param column The column element of the table. Get the column element via DataTables Api functions
         * @param invalidateTable Invalidates the table if set to true (optional parameter, default true)
         *
         * @see https://datatables.net/reference/api/rows().invalidate()
         * @see https://datatables.net/reference/api/column()
         */
        TsDataTableHandler.refreshSelectIconFilter = function (table, column, invalidateTable) {
            if (typeof invalidateTable === "undefined") {
                invalidateTable = true;
            }

            if (typeof table !== "undefined" && typeof column !== "undefined") {
                let $footer = $(column.footer());

                if ($footer.length) {
                    if (!$footer.hasClass(dataTablesConstants.NON_FILTERABLE)) {
                        if ($footer.hasClass(dataTablesConstants.SELECT_ICON_FILTER_CLASS)) {
                            let $inputField = $footer.find(".select-wrapper > .select-dropdown.dropdown-trigger");
                            let lastValues = $inputField.val().trim()
                            let splitLastValues = [];
                            let assignedIcons = [];

                            if (invalidateTable) {
                                table.rows().invalidate();
                            }

                            $footer.empty();

                            let $select = $('<select multiple class="select-dropdown-empty"></select>')
                                .appendTo($footer);

                            lastValues.trim().split(",").forEach(text => splitLastValues.push(text.trim())); // Splits and trims assigned filter values

                            if ($footer.hasClass(dataTablesConstants.ADD_EMPTY)) {
                                let emptyOptionIcon = "crop_free";
                                let emptyOptionMessage = tsMsg("de.techspring.common.datatables.custom.filters.select.empty.value");
                                let emptyOption = $("<option class='select-empty-option'><div class='icon-box-select'><i class='small material-icons'>" + emptyOptionIcon + "</i></div></option>");

                                emptyOption.val(JSON.stringify({
                                    searchValue: "^$",
                                    tooltip: emptyOptionMessage,
                                    displayText: "crop_free"
                                }));

                                if (jQuery.inArray(emptyOptionIcon, splitLastValues) >= 0) {
                                    emptyOption.prop("selected", true);
                                }

                                $select.append(emptyOption);

                                assignedIcons.push(emptyOptionIcon);
                            }

                            column.data().unique().sort().each(function (value, idx) {
                                let textValue = $(value).text().trim();
                                let toolTipValue = $(value).attr(dataTablesConstants.ATTR_MATERIALIZE_TOOLTIP);

                                if (textValue.length !== 0 && jQuery.inArray(textValue, assignedIcons) < 0) {
                                    let optionElement = $('<option ></option>')

                                    let searchItem = JSON.stringify({
                                        displayText: textValue,
                                        searchValue: ("^\\s*" + textValue + "\\s*$"),
                                        tooltip: toolTipValue
                                    });

                                    assignedIcons.push(textValue);
                                    optionElement.val(searchItem);

                                    let te = $("<div class='icon-box-select'><i class='small material-icons'>" + textValue + "</i><span class='icon-box-select-text'> "
                                        + (typeof toolTipValue !== "undefined" ? toolTipValue : '') + "</span></div>");

                                    optionElement.append(te);

                                    if (jQuery.inArray(textValue, splitLastValues) >= 0) {
                                        optionElement.prop("selected", true);
                                    }

                                    $select.append(optionElement);
                                }
                            });

                            materializetool.initSelectElement($select);

                            tsDataTableHandler.createPlaceHolderForFilter(table, column, true);

                            $select.trigger("change", [table, false]);      // Triggers the search event
                        } else {
                            console.warn("The filter is only suitable for " +
                                dataTablesConstants.SELECT_ICON_FILTER_CLASS, $footer);
                        }
                    } else {
                        console.warn("The filter field is not filterable")
                    }
                } else {
                    console.warn("The passed column field does not exist");
                }
            } else {
                console.warn("Table and column element should be non null")
            }
        }

        /**
         * Decodes given html text
         *
         * @param text encoded html text
         *
         * @return decoded html text
         */
        TsDataTableHandler.decodeHtmlText = function(text) {
            let decodedText = text;

            if (typeof text !== "undefined") {
                decodedText = $("<div/>").html(text).text();
            } else {
                console.warn("Passed text is undefined");
            }

            return decodedText;
        }

        return TsDataTableHandler;
    }(jQuery);
})();

/**
 * General helper function for changing an elements position inside an array.
 * @param arr
 * @param oldIndex
 * @param newIndex
 * @returns {*}
 */

function arrayChangePosition(arr, oldIndex, newIndex) {
    if (newIndex >= arr.length) {
        let k = newIndex - arr.length + 1;
        while (k--) {
            arr.push(undefined);
        }
    }
    arr.splice(newIndex, 0, arr.splice(oldIndex, 1)[0]);
    return arr;
}

/**
 * *********************************************************************************************************************
 * Functions for loading additional javascript files.
 */

function loadDataTablesConstants() {
    if (!window.dataTablesConstants) {
        let resources = [
            "resources/js/ts_datatables_extensions/ts_datatables_constants.js",
            //"webjars/common-web-overlay/1.0.0/resources/js/ts_datatables_extensions/ts_datatables_constants.js"
        ]

        loadFile(_addPrefix(resources[0]))
    }
}

function loadDataTablesButtons() {
    if (!window.dataTablesButtons) {
        let resources = [
            "resources/js/ts_datatables_extensions/ts_datatables_buttons.js",
            //"webjars/common-web-overlay/1.0.0/resources/js/ts_datatables_extensions/ts_datatables_buttons.js"
        ]

        loadFile(_addPrefix(resources[0]))
    }
}

function loadDataTablesFilters() {
    if (!window.dataTablesFilters) {
        let resources = [
            "resources/js/ts_datatables_extensions/ts_datatables_filters.js",
            //"webjars/common-web-overlay/1.0.0/resources/js/ts_datatables_extensions/ts_datatables_filters.js"
        ]

        loadFile(_addPrefix(resources[0]))
    }
}

function loadDataTablesTreeTables() {
    if (!window.dataTablesTreeTables) {
        let resources = [
            "resources/js/ts_datatables_extensions/ts_datatables_treetables.js",
            //"webjars/common-web-overlay/1.0.0/resources/js/ts_datatables_extensions/ts_datatables_treetables.js"
        ]

        loadFile(_addPrefix(resources[0]))
    }
}

function loadDataTablesAdditionalPlugins() {
    if (!window.dataTablesAdditionalPlugins) {
        let resources = [
            "resources/js/ts_datatables_extensions/ts_datatables_additional_plugins.js",
            //"webjars/common-web-overlay/1.0.0/resources/js/ts_datatables_extensions/ts_datatables_additional_plugins.js"
        ]

        loadFile(_addPrefix(resources[0]))
    }
}

/**
 * TODO TST, MHY, GSI, TFR This should be later replaced with loadJsFile
 *
 * Currently the promises need to long to fulfill.
 * @param fetchUrl
 */
function loadFile(fetchUrl) {
    $.ajax({
        url: fetchUrl,
        async: false,
        dataType: "script"
    })
}

/**
 * Checks if a static resource exists.
 *
 * @param fetchUrl Endpoint of resource
 * @returns {boolean}
 */
function resourceExists(fetchUrl) {
    let exists = false;

    $.get(fetchUrl)
        .done(function() {
            exists = true;
        })
        .fail(function() {
            exists = false;
        })

    return exists;
}

/**
 * Loads javascript file
 * @param fetchUrl Array of file paths or a single file path
 */
function loadJsFile(fetchUrl) {
    if (Array.isArray(fetchUrl)) {
        fetchUrl.forEach(u => {
            _callAjaxResourceLoad(u)
        })
    } else {
        _callAjaxResourceLoad(fetchUrl)
    }
}

/**
 * Adds the window prefix to the passed fetch urls if exists.
 *
 * @param fetchUrl Array of file paths or a single file path
 * @returns {string}
 * @private
 */
function _addPrefix(fetchUrl) {
    if (typeof window.pagePrefix !== "undefined") {
        if (Array.isArray(fetchUrl)) {
            for (let i = 0; i < fetchUrl.length; i++) {
                fetchUrl[i] = window.pagePrefix + fetchUrl[i]
            }
        } else {
            fetchUrl = window.pagePrefix.concat(fetchUrl);
        }
    }

    return fetchUrl;
}

/**
 * Calls ajax resource load for passed fetch url
 *
 * @param fetchUrl Single fetch url
 * @private
 */
function _callAjaxResourceLoad(fetchUrl) {
    if (resourceExists(fetchUrl)) {
        $.ajax({
            url: fetchUrl,
            async: false,
            dataType: "script"
        })
    }
}