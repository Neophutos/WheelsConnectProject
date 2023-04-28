/**
 * Name: ts_result_tables.js
 *
 * Creator: Tim Freund (tfr)
 *
 * Date: 2023-01-30 ff.
 *
 * Description: Javascript ts_result_tables.js implementation.
 *
 * Copyright (c) 2023 The TechSpring GmbH. All rights reserved.
 *
 */

(function () {
    if (!window.resultTables) window.resultTables = function ($) {
        const NUM_SHADES = 4;
        const NUM_COLORS = 10;
        const SATURATION_RANGE = 0.11; //0.24;
        const BRIGHTNESS_RANGE = 0.40;

        const ResultTables = {
            activeQueries: {}
        }

        ResultTables.init = function () {
        }

        ResultTables.initResultTables = function (id, columns, table) {
            table.on('select.dt', function (e, dt, type, indexes) {
            });
            let query = resultTables.activeQueries[id];
            if (query == null) {
                let query = new ts_query.Query();
                query.id = id;
                query.columns = columns;

                resultTables.activeQueries[id] = query;
            } else {
                let oldColumnsByName = [];
                for (let column of query.columns) {
                    oldColumnsByName[column.columnName] = column;
                }
                query.columns = columns;
                for (let column of query.columns) {
                    let oldColumn = oldColumnsByName[column.columnName];

                    if (oldColumn != null) {
                        column.filter = oldColumn.filter;
                        column.filterSwitch = oldColumn.filterSwitch;
                        column.referencedColumns = oldColumn.referencedColumns;
                        column.filterColor = oldColumn.filterColor;
                    }
                }
            }
        }

        ResultTables.renderTablesFromJsonObject = function (dataTableConfig, parsed) {
            let columns = [];

            //creating columns for parsed result tables from backend
            for (let inColumn of parsed.jsColumns) {
                let column = new tsColumn.Column();

                column.id = inColumn.id;
                column.filter = null;
                column.filterSwitch = null;
                column.referencedColumns = null;
                column.filterColor = null;
                column.columnName = inColumn.name;
                columns.push(column);
            }

            springWebsocketHandler.activeTimers.splice(springWebsocketHandler.activeTimers.indexOf(parsed.query), 1);

            //creating elements for functions around the resultTable
            let table = $(parsed.tableSelector);
            let infoPanel = $(parsed.tableSelector).closest(".query-container").find(".info-panel");
            infoPanel.remove();
            let controlPanel = $(parsed.tableSelector).closest(".query-container").find(".control-panel");
            controlPanel.show();

            //removes result table if exists
            if ($.fn.dataTable.isDataTable(table)) {
                table.DataTable().clear();
                table.DataTable().destroy();
                table.empty();
            }

            dataTableConfig.initComplete = function () {
                // Setup - add a text input to each footer cell
                $(parsed.tableSelector + ' thead tr')
                    .clone(null)
                    .addClass('filters')
                    .appendTo(parsed.tableSelector + ' thead');

                let api = this.api();

                // For each column
                api
                    .columns()
                    .eq(0)
                    .each(function (colIdx) {
                        // Set the header cell to contain the input element
                        let cell = $('.filters th').eq(
                            $(api.column(colIdx).header()).index()
                        );
                        let title = $(cell).text();
                        $(cell).html('<input type="text" placeholder="' + title + '" />');

                        // On every keypress in this input
                        $(
                            'input',
                            $('.filters th').eq($(api.column(colIdx).header()).index())
                        )
                            .off('keyup change')
                            .on('change', function (e) {
                                // Get the search value
                                $(this).attr('title', $(this).val());
                                let regexr = '({search})'; //$(this).parents('th').find('select').val();

                                let cursorPosition = this.selectionStart;
                                // Search the column for that value
                                api
                                    .column(colIdx)
                                    .search(
                                        this.value != ''
                                            ? regexr.replace('{search}', '(((' + this.value + ')))')
                                            : '',
                                        this.value != '',
                                        this.value == ''
                                    )
                                    .draw();
                            })
                            .on('keyup', function (e) {
                                e.stopPropagation();

                                $(this).trigger('change');
                                $(this)
                                    .focus()[0]
                                    .setSelectionRange(cursorPosition, cursorPosition);
                            });
                    });
            };

            if (springWebsocketHandler.responsive) {
                dataTableConfig.responsive = {
                    details: false
                };
            }

            // add cell renderer for colorization/filtering
            for (let column of dataTableConfig.columns) {
                column.render = {
                    "display": function (data, type, row, meta) {
                        let cellContent = data;
                        let query = null;
                        try {
                            let $queryLi = $(meta.settings.nTable).closest("[query-id]");
                            let queryId = $queryLi.attr("query-id");
                            for (let e of Object.entries(resultTables.activeQueries)) {
                                let q = e[1];
                                if (q != null && q.id == queryId) {
                                    query = q;
                                    break;
                                }
                            }
                        } catch (e) {
                            console.warn("cannot get query id" + e.message, e);
                        }

                        if (query != null) {
                            // let queryNew = springDataTableController.addColorFilterToTable();
                            // let repositoryColumn = queryNew.columns[meta.col];
                            let repositoryColumn = query.columns[meta.col];
                            if (repositoryColumn != null
                                && data != null
                            ) {

                                let filter = repositoryColumn.filter;
                                let filterColor = repositoryColumn.filterColor;

                                if (!$.isArray(filter)
                                    || filterColor == null
                                ) {

                                    //look in own query if filter is in column, after this look for reference column and then look in other queries for filter
                                    let searchFilter = function (columnName, query, checkColumnByName) {
                                        let rc = null;
                                        if (checkColumnByName) {
                                            for (let column of query.columns) {
                                                if (column.columnName == columnName) {
                                                    if ($.isArray(column.filter)
                                                        && column.filterColor != null
                                                    ) {
                                                        rc = {
                                                            filter: column.filter,
                                                            filterColor: column.filterColor
                                                        }
                                                        break;
                                                    }
                                                }
                                            }
                                        }

                                        if (rc == null) {
                                            for (let column of query.columns) {
                                                if ($.isArray(column.referencedColumns)
                                                    && column.referencedColumns.indexOf(repositoryColumn.columnName) >= 0
                                                ) {
                                                    // if repositoryColumn is used as referenced column in column -> use column filter settings
                                                    rc = {
                                                        filter: column.filter,
                                                        filterColor: column.filterColor
                                                    }
                                                    break;
                                                }
                                            }
                                        }
                                        return rc;
                                    };

                                    let filters = searchFilter(repositoryColumn.columnName, query, false);
                                    if (filters != null) {
                                        filter = filters.filter;
                                        filterColor = filters.filterColor;
                                    } else {
                                        for (let e of Object.entries(resultTables.activeQueries)) {
                                            let q = e[1];
                                            if (q != null && q.id != query.id) {
                                                filters = searchFilter(repositoryColumn.columnName, q, true);
                                                if (filters != null) {
                                                    filter = filters.filter;
                                                    filterColor = filters.filterColor;
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }

                                if ($.isArray(filter)
                                    && filterColor != null
                                ) {
                                    let filterIndex = filter.indexOf(data.toString());
                                    if (filterIndex >= 0) {
                                        let htmlFilterColor = ResultTables.getHtmlColor(filterIndex, filterColor);
                                        let textColor = tinycolor.mostReadable(htmlFilterColor, ["#fff", "#000", "#888"]).toHexString();

                                        let position = filterIndex;
                                        if (position == -1) {
                                            position = NUM_SHADES;
                                        } else {
                                            position = position % NUM_SHADES + 1;
                                        }

                                        cellContent = "<div style='color:" + textColor + ";"
                                            + "--colorIndex: " + filterColor + ";"
                                            + "--colorPosition: " + position + ";"
                                            + "' class='filter-color'"
                                            + ">" + data + "</div>";
                                    }
                                }
                            }
                        }

                        return cellContent;
                    }
                };
            }

            resultTables.initResultTables(parsed.queryId, columns, table);
            table.DataTable(dataTableConfig);
        }

        ResultTables.toggleResponsive = function () {
            let responsiveInput = $(".setting-query-tables-responsives");
            springWebsocketHandler.responsive = responsiveInput.is(":checked");
        }

        ResultTables.getHtmlColor = function (position, colorIndex) {
            let rc = "inherit";
            if (colorIndex != null && colorIndex >= 0 && colorIndex < NUM_COLORS) {
                if (position == -1) {
                    position = NUM_SHADES;
                } else {
                    position = position % NUM_SHADES + 1;
                }
                let hue = (colorIndex * 360 / NUM_COLORS) % 360;
                let saturation = 0.15 + SATURATION_RANGE * position;
                let brightness = 0.899 + (position / NUM_SHADES - 1) * BRIGHTNESS_RANGE;
                rc = tinycolor({
                    h: hue,
                    s: saturation,
                    l: brightness
                }).toHexString();
            }
            return rc;
        }
        /*
        colorIndex 5
        position 0  orig #77b2b2 hsl(180, 28%, 58%) 0   js #7eb3b3 hsl(180, 26%, 60%)   css #7eb3b3 hsl(180, 26%, 60%)
        position 1  orig #95cccc hsl(180, 35%, 69%) 10  js #96cfcf hsl(180, 37%, 70%)   css #96cfcf hsl(180, 37%, 70%)
        position 2  orig #b5e5e5 hsl(180, 48%, 80%) 20  js #b3e4e4 hsl(180, 48%, 80%)   css #b3e4e4 hsl(180, 48%, 80%)
         */


        return ResultTables;
    }(jQuery);
    resultTables.init();
})
();