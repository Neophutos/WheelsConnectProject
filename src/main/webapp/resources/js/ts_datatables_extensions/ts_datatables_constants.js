(function () {
    if (!window.dataTablesConstants) window.dataTablesConstants = function($) {
        return {
            TABLE_CUSTOM_GERMAN: {
                "sEmptyTable": tsMsg("de.techspring.common.datatables.defaults.semptytable.value"),
                "sInfo": tsMsg("de.techspring.common.datatables.defaults.sinfo.value"),
                "sInfoEmpty": tsMsg("de.techspring.common.datatables.defaults.sinfoempty.value"),
                "sInfoFiltered": tsMsg("de.techspring.common.datatables.defaults.sinfofiltered.value"),
                "sInfoPostFix": "",
                "sInfoThousands": ".",
                "sLengthMenu": tsMsg("de.techspring.common.datatables.defaults.slengthmenu.value"),
                "sLoadingRecords": tsMsg("de.techspring.common.datatables.defaults.sloadingrecords.value"),
                "sProcessing": tsMsg("de.techspring.common.datatables.defaults.sprocessing.value"),
                "sSearch": "",
                "sSearchPlaceholder": tsMsg("de.techspring.common.datatables.defaults.ssearch.value"),
                "sZeroRecords": tsMsg("de.techspring.common.datatables.defaults.szerorecords.value"),
                "oPaginate": {
                    "sFirst": "<i class='material-icons'>first_page</i>",
                    "sPrevious": "<i class='material-icons'>navigate_before</i>",
                    "sNext": "<i class='material-icons'>navigate_next</i>",
                    "sLast": "<i class='material-icons'>last_page</i>",
                    "info": tsMsg("de.techspring.common.datatables.defaults.sinfo.input.value")
                },
                "oAria": {
                    "sSortAscending": tsMsg("de.techspring.common.datatables.defaults.oaria.ssortascending.value"),
                    "sSortDescending": tsMsg("de.techspring.common.datatables.defaults.oaria.ssortdescending.value")
                },
                "select": {
                    "rows": {
                        "_": tsMsg("de.techspring.common.datatables.defaults.select.rows.underscore.value"),
                        "0": "",
                        "1": tsMsg("de.techspring.common.datatables.defaults.select.rows.one.value")
                    }
                },
                "buttons": {
                    "print": tsMsg("de.techspring.common.datatables.defaults.buttons.print.value"),
                    "colvis": tsMsg("de.techspring.common.datatables.defaults.buttons.colvis.value"),
                    "copy": tsMsg("de.techspring.common.datatables.defaults.buttons.copy.value"),
                    "copyTitle": tsMsg("de.techspring.common.datatables.defaults.buttons.copytitle.value"),
                    "copyKeys": tsMsg("de.techspring.common.datatables.defaults.buttons.copykeys.value"),
                    "copySuccess": {
                        "_": tsMsg("de.techspring.common.datatables.defaults.buttons.copysuccess.underscore.value"),
                        "1": tsMsg("de.techspring.common.datatables.defaults.buttons.copysuccess.one.value")
                    },
                    "pageLength": {
                        "-1": tsMsg("de.techspring.common.datatables.defaults.buttons.pagelength.minusone.value"),
                        "_": tsMsg("de.techspring.common.datatables.defaults.buttons.pagelength.underscore.value")
                    }
                }
            },
            // CSS class or id selector constants
            HIERARCHY_DATA_COL_SELECTOR: '.hierarchy-data-parent-id',
            HIERARCHY_LEVEL_COL_SELECTOR: '.hierarchy-level',
            BREADCRUMBS_COL_SELECTOR: '.breadcrumbs',
            DT_WRAPPER_SELECTOR: '.dataTables_wrapper',
            DT_PAGE_LENGTH_MENU_SELECTOR: '.dataTables_length',
            DT_COLVIS_BUTTONS_SELECTOR: '.buttons-columnVisibility',
            DT_SEARCH_FIELD_SELECTOR: '.dataTables_filter',
            ASSIGNED_USER_LOGIN_COL_SELECTOR: '.hidden-id',

            // CSS class constants
            NON_FILTERABLE: "non-filterable",
            NON_ORDERABLE: "non-orderable",
            PROCESSED_HTML_FILTER_COLUMN: "processed-html-filter-column",
            DT_SEARCH_FIELD_TOGGLER_CLASS: 'search-toggle',
            COLUMN_FILTERS_TOGGLER_CLASS: 'filter-row-toggle',
            TREE_TABLE_LEVELS_BTN_CLASS: 'tree-table-levels-btn',
            TRIPLE_TOGGLE_BTN_GROUP_CLASS: 'data-filter-toggle',
            TRIPLE_TOGGLE_HIDDEN_ID_TRIGGER_BTN_CLASS: 'hidden-id-filter-toggle',
            SELECT_FILTER_CLASS: 'select-filter',
            SELECT_FILTER_HTML_ESCAPE_CLASS: 'select-filter-html-escape',
            SELECT_ICON_FILTER_CLASS: 'select-filter-icon',
            SELECT_BOOLEAN_CHECKBOX_FILTER_CLASS: 'select-filter-boolean-checkbox',
            SELECT_FILTER_COMMA_SEPARATED_HELPER_CLASS: 'comma-separated',
            COLVIS_RESPONSIVE_SUB_COLUMN_BTN_CLASS: 'colvis-sub-column',
            COLVIS_SET_COLUMN_FILTER_BTN_CLASS: 'colvis-filtered',
            HOVERING_BEFORE_ELEMENT_CLASS: 'hovering-before',
            ROW_HAS_CHILDREN_CLASS: 'has-children',
            ROW_CHILDREN_VISIBLE_CLASS: 'visible-children',
            COLUMN_FILTER_GROUP_CLASS: 'column-filter-group',
            NUMBER_COLUMN_CLASS: 'number-column',
            NUMERIC_SORT_CLASS: 'numeric-sort',
            ADD_EMPTY: 'add-empty-filter-value',
            INACTIVE_COLVIS_COLUMN_CLASS: 'colvis-inactive',

            // HTML attribute constants
            ATTR_ID: 'id',
            ATTR_PARENT_ID: 'parent-id',
            ATTR_F_ID: 'f-id',
            ATTR_HIERARCHY_LEVEL: 'hierarchy-level',
            ATTR_MATERIALIZE_TOOLTIP: 'data-tooltip',
            ATTR_DISABLED: 'disabled',
            ATTR_PAGE_RESET: 'page-reset',

            // Regex constants
            REGEX_MATCH_ICON_TAGS: /<i [^>]+>(.*?)<\/i>/g,
            REGEX_MATCH_HTML_TAGS: /<(?:(?=!--)!--[\s\S]*--|(?:(?=\?)\?[\s\S]*\?|(?:(?=\/)\/[^.-\d][^\/\]'"[!#$%&()*+,;<=>?@^`{|}~ ]*|[^.-\d][^\/\]'"[!#$%&()*+,;<=>?@^`{|}~ ]*(?:\s[^.-\d][^\/\]'"[!#$%&()*+,;<=>?@^`{|}~ ]*(?:=(?:"[^"]*"|'[^']*'|[^'"<\s]*))?)*)\s?\/?))>/g,
            REGEX_MATCH_LINE_BREAKS: /(\r\n|\n|\r)/gm,

            // other constants
            DETAILS_COL_DEFAULT_POSITION: -1,
            // TODO GSI 2020-07-27: DOM dokumentieren mit link auf DT-Seite
            DEFAULT_DOM: "<'row dt-searchfield-and-buttons'<'col s12 m6'f><'col s12 m6 dt-buttons-panel'B>>" +
                "<'row'tr>" +
                "<'row' pli>",
            NO_BUTTONS_DOM: "<'row dt-searchfield-and-buttons'<'col s12 m6'f><'col s12 m6'>>" +
                "<'row'tr>" +
                "<'row' pli>",
            NO_SEARCHFIELD_DOM: "<'row dt-searchfield-and-buttons'<'dt-buttons-panel'B>>" +
                "<'row'tr>" +
                "<'row' pli>",
            NO_SEARCHFIELD_AND_BUTTONS_DOM: "<'row dt-searchfield-and-buttons'>" +
                "<'row'tr>" +
                "<'row' pli>",
            DEFAULT_RESPONSIVE_OPTIONS: {
                // breakpoints: [
                //     {name: 'desktop', width: Infinity},
                //     {name: 'tablet', width: 1400},
                //     {name: 'fablet', width: 1100},
                //     {name: 'phone', width: 700}
                // ]
            },
            STATE_WRITE_TIMEOUT: 300,
            REFRESH_TABLE_BTN_CLASS: 'table-refresh-btn',
            TABLE_DIRTY_CLASS: 'table-dirty',
            FILTER_PLACEHOLDER: tsMsg("de.techspring.common.datatables.custom.column.filter.select.value"),
        };
    }(jQuery);
})();
