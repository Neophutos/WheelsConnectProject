/**
 * Name: ts_table_filters.js
 *
 * Creator: Tim Freund (tfr)
 *
 * Date: 2023-01-30 ff.
 *
 * Description: Javascript ts_table_filters.js implementation.
 *
 * Copyright (c) 2023 The TechSpring GmbH. All rights reserved.
 *
 */

(function () {
    if (!window.tablesFilter) window.tablesFilter = function ($) {
        const DIALOG_SELECTOR = "[id^='filter-options']";
        const FILTER_COLOR_1 = "filter-color-1";
        const FILTER_COLOR_2 = "filter-color-2";
        const FILTER_COLOR_3 = "filter-color-3";
        const FILTER_COLOR_4 = "filter-color-4";
        const FILTER_COLOR_5 = "filter-color-5";
        const FILTER_COLOR_6 = "filter-color-6";
        const FILTER_COLOR_7 = "filter-color-7";
        const FILTER_COLOR_8 = "filter-color-8";
        const FILTER_COLOR_9 = "filter-color-9";
        const FILTER_COLOR_10 = "filter-color-10";
        const FILTER_COLORS = [
            FILTER_COLOR_1,
            FILTER_COLOR_2,
            FILTER_COLOR_3,
            FILTER_COLOR_4,
            FILTER_COLOR_5,
            FILTER_COLOR_6,
            FILTER_COLOR_7,
            FILTER_COLOR_8,
            FILTER_COLOR_9,
            FILTER_COLOR_10,
        ];

        const TablesFilter = {
            queryOfDialog: null,
            FILTER_COLOR_SELECTED: "filter-color-selected",
            FILTER_COLOR_ALREADY_SELECTED: "filter-color-already-selected",
            refDialogQueryColumnName: null
        }

        TablesFilter.init = function () {
        }

        TablesFilter.initFilterAddDialog = function (id) {
            //setup dialog
            dialogtool.openModal(  'filter-options');
            let dialog = $(DIALOG_SELECTOR);
            dialog.attr("query_id", id);
            tablesFilter.queryOfDialog = resultTables.activeQueries[id.toString()];

            console.log("queryOfDialog");
            console.log(tablesFilter.queryOfDialog);

            //setup filter table
            let filterTable = dialog.find(".filter-table");

            let data = [];

            for (let column of this.queryOfDialog.columns) {
                let row = [];
                row.push(column.columnName || "");
                row.push(column.filterColor || "");
                row.push(column.filteringActive || "")
                row.push(column.referencedColumns || "");
                row.push(column.filter || "");
                data.push(row);
            }

            let tableInitialized = false;
            let table = filterTable.DataTable({
                        data: data,
                        columns: [
                            {title: 'Spalte'},
                            {
                                title: 'Farbe',
                                render: function (data, type, row, meta) {
                                    return "<div class='fixed-action-btn filter-color-button' filter-row='" + meta.row + "' style='position: sticky'>" +
                                        "<a class='btn-floating btn-medium black btn-action-big'" +
                                        " style='--colorPosition: 3;' " +
                                        ">" +
                                        "<i class='medium material-icons'>mode_edit</i>" +
                                        "</a>" +
                                        "<ul>" +
                                        "<li><a class='btn-floating btn-small filter-color " + FILTER_COLOR_1 +
                                        " color-btn-choose' filter-color='0' row='" + meta.row + "' " +
                                        "onclick='tablesFilter.colorButtonFunctions()'></a>" +
                                        "</li>" +
                                        "<li><a class='btn-floating btn-small filter-color " + FILTER_COLOR_2 +
                                        " color-btn-choose' filter-color='1' row='" + meta.row + "' " +
                                        "onclick='tablesFilter.colorButtonFunctions()'></a>" +
                                        "</li>" +
                                        "<li><a class='btn-floating btn-small filter-color " + FILTER_COLOR_3 +
                                        " color-btn-choose' filter-color='2' row='" + meta.row + "' " +
                                        "onclick='tablesFilter.colorButtonFunctions()'></a>" +
                                        "</li>" +
                                        "<li><a class='btn-floating btn-small filter-color " + FILTER_COLOR_4 +
                                        " color-btn-choose' filter-color='3' row='" + meta.row + "' " +
                                        "onclick='tablesFilter.colorButtonFunctions()'></a>" +
                                        "</li>" +
                                        "<li><a class='btn-floating btn-small filter-color " + FILTER_COLOR_5 +
                                        " color-btn-choose' filter-color='4' row='" + meta.row + "' " +
                                        "onclick='tablesFilter.colorButtonFunctions()'></a>" +
                                        "</li>" +
                                        "<li><a class='btn-floating btn-small filter-color " + FILTER_COLOR_6 +
                                        " color-btn-choose' filter-color='5' row='" + meta.row + "' " +
                                        "onclick='tablesFilter.colorButtonFunctions()'></a>" +
                                        "</li>" +
                                        "<li><a class='btn-floating btn-small filter-color " + FILTER_COLOR_7 +
                                        " color-btn-choose' filter-color='6' row='" + meta.row + "' " +
                                        "onclick='tablesFilter.colorButtonFunctions()'></a>" +
                                        "</li>" +
                                        "<li><a class='btn-floating btn-small filter-color " + FILTER_COLOR_8 +
                                        " color-btn-choose' filter-color='7' row='" + meta.row + "' " +
                                        "onclick='tablesFilter.colorButtonFunctions()'></a>" +
                                        "</li>" +
                                        "<li><a class='btn-floating btn-small filter-color " + FILTER_COLOR_9 +
                                        " color-btn-choose' filter-color='8' row='" + meta.row + "' " +
                                        "onclick='tablesFilter.colorButtonFunctions()'></a>" +
                                        "</li>" +
                                        "<li><a class='btn-floating btn-small filter-color " + FILTER_COLOR_10 +
                                        " color-btn-choose' filter-color='9' row='" + meta.row + "' " +
                                        "onclick='tablesFilter.colorButtonFunctions()'></a>" +
                                        "</li>" +
                                        "</ul>" +
                                        "</div>";
                                }
                            },
                            {
                                title: 'Filtern',
                                render: function (data, type, row, meta) {
                                    return "<input type='checkbox' row='" + meta.row + "' id='" + 'filterSwitch_' + meta.row + "' class='filter-checkbox-filterSwitch modal-checkbox'/>" +
                                        "<label for='" + 'filterSwitch_' + meta.row + "' class='modal-checkbox tooltipped' a:data-tooltip='Filtern an-/ausschalten' a:dataPosition='bottom'></label>";
                                }
                            },
                            {
                                title: 'Referenzspalten',
                                render: function (data, type, row, meta) {
                                    let btn = "<button class='btn' type='button' " +
                                        "onclick='" +
                                        "tablesFilter.updateRefColumns(); " +
                                        "refColumnCommand({" +
                                        "queryColumnName : \"" + row[0] + "\", " +
                                        "queryOfDialog : JSON.stringify(tablesFilter.queryOfDialog)})'> " +
                                        "<i class='small material-icons'>dehaze</i> " +
                                        "</button>";
                                    let input = "<input row='" + meta.row + "' class='referenceColumns-input' /> ";
                                    return input + btn;
                                }
                            },
                            {
                                title: 'Filter-Werte',
                                render: function (data, type, row, meta) {
                                    return "<input row='" + meta.row + "' class='filter-input-filter'/>";
                                }
                            }
                        ],
                        "paging": false,
                        "searching": false,
                        // "drawCallback": function (settings) {
                        //     console.log( 'Redraw occurred at: '+new Date().getTime() );
                        //     filterTable.find(".filter-input-color").on("blur", springDataTableController.colorInputChanged);
                        // },
                        "drawCallback": function (settings) {
                            console.log('Redraw occurred at: ' + new Date().getTime());
                            // filterTable.find(".filter-input-filter").on("blur", springDataTableController.filterinput);

                            if (!tableInitialized) {
                                let query = tablesFilter.queryOfDialog;
                                if (query != null) {

                                    //get selected cells and put into filter-dialog
                                    let queryId = tablesFilter.queryOfDialog.id;
                                    let queryOD = tablesFilter.queryOfDialog;
                                    let tableElementMain = $(".main-content-statement-tables.statement-table_" + queryId);
                                    let table = tableElementMain.DataTable();
                                    table.cells(".selected").every(function () {
                                        try {
                                            let cell = this;
                                            let cellValue = cell.data();
                                            let columnId = cell[0][0].column;
                                            let column = queryOD.columns[columnId];
                                            if (column.filter == null) {
                                                column.filter = [cellValue];
                                            } else {
                                                if (column.filter.indexOf(cellValue) < 0) {
                                                    column.filter.push(cellValue);
                                                }
                                            }
                                        } catch (e) {
                                            console.log("cannot initialize filter for selected cell ", e);
                                        }
                                    });

                                    dialog.find(".filter-input-filter").each(function (index, element) {
                                        let columnIndex = $(element).attr("row");
                                        let column = query.columns[columnIndex];
                                        if (column != null) {
                                            let filterValue = column.filter;
                                            if (filterValue != null) {
                                                filterValue = filterValue.join(",")
                                                $(element).val(filterValue);
                                            }
                                        }
                                    });

                                    dialog.find(".filter-checkbox-filterSwitch").each(function (index, element) {
                                        let columnIndex = $(element).attr("row");
                                        let column = query.columns[columnIndex];
                                        if (column != null) {
                                            let filterSwitch = column.filterSwitch;
                                            if (filterSwitch != null) {
                                                if (filterSwitch === true) {
                                                    $(element).attr("checked", "checked");
                                                }
                                            }
                                        }
                                    });

                                    dialog.find(".selected").each(function (index, element) {
                                        let columnIndex = $(element).attr("row");
                                        let column = query.columns[columnIndex];
                                    })

                                    dialog.find(".referenceElement").each(function (index, element) {
                                        let columnIndex = $(element).attr("row");
                                        let column = query.columns[columnIndex];
                                        if (column != null) {
                                            let referenceValue = column.referencedColumns;
                                            if (referenceValue != null) {
                                                referenceValue = referenceValue.join(",")
                                                $(element).val(referenceValue);
                                            }
                                        }
                                    });

                                    for (let column of query.columns) {
                                        if (column != null) {
                                            let filterInputElement = dialog.find("[row=" + column.id + "].filter-input-filter");
                                            if ($.isArray(column.filter) && column.filter.length > 0) {
                                                filterInputElement.val(column.filter.join(","));
                                            } else {
                                                filterInputElement.val("");
                                            }

                                            if (column.filterColor != null) {
                                                let filterColorAction = dialog.find("[filter-row=" + column.id + "].fixed-action-btn");
                                                let filterColorActionButton = filterColorAction.children("a.btn-floating");
                                                if (filterColorActionButton.length > 0) {
                                                    filterColorActionButton.get(0).style.setProperty("--colorIndex", column.filterColor)
                                                    filterColorActionButton
                                                        .removeClass("black")
                                                        .addClass("filter-color");
                                                    filterColorActionButton.attr("filter-color", column.filterColor);
                                                }

                                                dialog.find("[filter-color=" + column.filterColor + "].filter-color.color-btn-choose").addClass(tablesFilter.FILTER_COLOR_ALREADY_SELECTED);
                                                let colorButton = filterColorAction.find("[filter-color=" + column.filterColor + "].filter-color")
                                                colorButton.addClass(tablesFilter.FILTER_COLOR_SELECTED);
                                            }

                                            let referenceElement = dialog.find("[row=" + column.id + "].referenceColumns-input");
                                            if ($.isArray(column.referencedColumns) && column.referencedColumns.length > 0) {
                                                referenceElement.val(column.referencedColumns.join(","));
                                            } else {
                                                referenceElement.val("");
                                            }
                                        }
                                    }
                                }
                                dialog.find('.fixed-action-btn').floatingActionButton({
                                    direction: 'left',
                                    hoverEnabled: false
                                });
                                tableInitialized = true;
                            }
                        }
                    }
                )
            ;
        };


        TablesFilter.updateRefColumns = function () {
            let $dialog = $(DIALOG_SELECTOR);
            let query = tablesFilter.queryOfDialog;

            $dialog.find(".referenceColumns-input").each(function (index, element) {
                let columnIndex = $(element).attr("row");
                let column = query.columns[columnIndex];
                if (column != null) {
                    let referenceAsCSV = $(element).val();
                    let reference = null;
                    if (referenceAsCSV != null) {
                        reference = referenceAsCSV.split(",");
                    }
                    column.referencedColumns = reference;
                }
                if (column.referencedColumns == "") {
                    column.referencedColumns = null;
                }
            });
        }

        TablesFilter.updateRefColumnsByDialog = function (id) {
            let $dialog = $(DIALOG_SELECTOR);
            let query = resultTables.activeQueries[id.toString()];

            $dialog.find(".referenceColumns-input").each(function (index, element) {
                let columnIndex = $(element).attr("row");
                let column = query.columns[columnIndex];
                if (column != null) {
                    $(element).val(column.referencedColumns);
                }
                if (column.referencedColumns == "") {
                    column.referencedColumns = null;
                }
            });
        }

        TablesFilter.saveFilter = function () {
            console.log("saveFilter");
            let $dialog = $(DIALOG_SELECTOR);
            let query = this.queryOfDialog;

            if (query != null) {
                for (let column of query.columns) {
                    column.filterSwitch = null;
                    column.filter = null;
                    column.filterColor = null;
                    column.referencedColumns = null;
                }

                $dialog.find(".filter-checkbox-filterSwitch").each(function (index, element) {
                    let columnIndex = $(element).attr("row");
                    let column = query.columns[columnIndex];
                    if (column != null) {
                        let isChecked = $(element).is(':checked');
                        column.filterSwitch = isChecked;
                    } else {
                        console.log("filter-checkbox 4");
                    }
                });

                $dialog.find(".filter-input-filter").each(function (index, element) {
                    let columnIndex = $(element).attr("row");
                    let column = query.columns[columnIndex];
                    if (column != null) {
                        let filtersAsCSV = $(element).val();
                        let filters = null;
                        if (filtersAsCSV != null) {
                            filters = filtersAsCSV.split(",");
                        }
                        column.filter = filters;


                    }
                    if (column.filter == "") {
                        column.filter = null;
                    }
                });

                $dialog.find("." + tablesFilter.FILTER_COLOR_SELECTED).each(function (index, element) {
                    let columnIndex = $(element).attr("row");
                    let column = query.columns[columnIndex];
                    if (column != null) {
                        column.filterColor = $(element).attr("filter-color");
                    }
                });

                tablesFilter.updateRefColumns();

                // redraw query table
                for (let qId in resultTables.activeQueries) {
                    if (qId != null) {
                        let tableSelector = ".statement-table_" + qId;
                        let tableElement = $(tableSelector);
                        let table = tableElement.DataTable();
                        table.rows().invalidate().draw();
                    }
                }
            }

            executeFilterQueries({
                dialogQueryId: this.queryOfDialog.id,
                configuration: JSON.stringify(resultTables.activeQueries)
            });

            dialogtool.closeModal('filter-options');
        };

        TablesFilter.colorButtonFunctions = function () {
            console.log("colorButtonFunctions");
            let $dialog = $(DIALOG_SELECTOR);
            let query = this.queryOfDialog;

            let getColumnFromColorButton = function (colorButton, query) {
                let columnIndex = colorButton.attr("row");
                let column = query.columns[columnIndex];
                return column;
            };

            let replaceColor = function (colorButton, query) {
                // cleanup color buttons and repository columns
                let color = colorButton.attr("filter-color") * 1.0 + 1;
                let colorIndex = colorButton.attr("filter-color");
                // let actionButtonsBefore = $dialog.find("a.btn-action-big.btn-floating.filter-color[style~=--colorIndex:" + colorIndex +"]");
                let actionButtonsBefore = $dialog.find("a[filter-color=" + colorIndex + "].btn-action-big.btn-floating.filter-color");
                actionButtonsBefore.each(function (index, element) {
                    $(element)
                        .removeClass("filter-color")
                        .addClass("black");
                    $(element).attr("filter-color", null);
                })
                $dialog.find("." + tablesFilter.FILTER_COLOR_SELECTED + ".filter-color-" + color).each(function (index, element) {
                    $(element).removeClass(tablesFilter.FILTER_COLOR_SELECTED);
                });
                colorButton.addClass(tablesFilter.FILTER_COLOR_SELECTED);
                checkActionButtons();
            };

            let assignColor = function (colorButton, query) {
                colorButton.addClass(tablesFilter.FILTER_COLOR_SELECTED);
                let actionButtonBefore = colorButton.closest(".fixed-action-btn").children("a.btn-floating");
                let color = colorButton.attr("filter-color");
                $dialog.find("[filter-color=" + color + "]").addClass(tablesFilter.FILTER_COLOR_ALREADY_SELECTED);

                actionButtonBefore
                    .removeClass("filter-color")
                    .addClass("black");
                actionButtonBefore.attr("filter-color", null);
                checkActionButtons();
            };


            let checkActionButtons = function () {
                let colorButton = $(event.target);

                let allDeselectedColors = $dialog.find(".color-btn-choose:not(." + tablesFilter.FILTER_COLOR_SELECTED + ")");
                allDeselectedColors.each(function (index, element) {
                    let filterColor = $(element).attr("filter-color");
                    let actionButton = colorButton.closest(".fixed-action-btn").children("a.btn-floating");
                    actionButton
                        .removeClass("filter-color")
                        .addClass("black");
                    actionButton.attr("filter-color", null);
                });

                let allSelectedColors = $dialog.find("." + tablesFilter.FILTER_COLOR_SELECTED);
                let filterColorOfSelected = colorButton.attr("filter-color")
                allSelectedColors.each(function (index, element) {
                    let row = $(element).attr("row");
                    let filterColor = $(element).attr("filter-color");
                    if (filterColor === filterColorOfSelected) {
                        let actionButton = colorButton.closest(".fixed-action-btn").children("a.btn-floating");
                        actionButton.get(0).style.setProperty("--colorIndex", filterColor)
                        actionButton
                            .removeClass("black")
                            .addClass("filter-color");
                        actionButton.attr("filter-color", filterColor);
                    }
                });

            }


            if (query != null && event != null) {
                let colorButton = $(event.target);


                // let columnFilterColorBefore = colorButton.attr("filter-color") * 1.0 + 1;
                // let columnFilterColor = $dialog.find(".filter-color-" + columnFilterColorBefore);
                let columnOfSelected = colorButton.attr("row");
                let selectedInRow = $dialog.find("[row=" + columnOfSelected + "]." + tablesFilter.FILTER_COLOR_SELECTED);
                let colorOfSelectedBefore = selectedInRow.attr("filter-color") * 1.0 + 1;
                let columnFilterColor = $dialog.find(".filter-color-" + colorOfSelectedBefore);

                if (colorButton.hasClass(tablesFilter.FILTER_COLOR_ALREADY_SELECTED) && !colorButton.hasClass(tablesFilter.FILTER_COLOR_SELECTED)) {
                    if (selectedInRow.length > 0) {
                        selectedInRow.removeClass(tablesFilter.FILTER_COLOR_SELECTED);
                        if (columnFilterColor.hasClass(tablesFilter.FILTER_COLOR_ALREADY_SELECTED)) {
                            $dialog.find("." + tablesFilter.FILTER_COLOR_ALREADY_SELECTED + ".filter-color-" + colorOfSelectedBefore)
                                .removeClass(tablesFilter.FILTER_COLOR_ALREADY_SELECTED);
                        }
                    }

                    replaceColor(colorButton, query);

                } else if (!colorButton.hasClass(tablesFilter.FILTER_COLOR_SELECTED)) {
                    if (selectedInRow.length > 0) {
                        selectedInRow.removeClass(tablesFilter.FILTER_COLOR_SELECTED);
                        if (columnFilterColor.hasClass(tablesFilter.FILTER_COLOR_ALREADY_SELECTED)) {
                            $dialog.find("." + tablesFilter.FILTER_COLOR_ALREADY_SELECTED + ".filter-color-" + colorOfSelectedBefore)
                                .removeClass(tablesFilter.FILTER_COLOR_ALREADY_SELECTED);
                        }

                    }
                    assignColor(colorButton, query);

                } else if (colorButton.hasClass(tablesFilter.FILTER_COLOR_SELECTED)) {
                    colorButton.removeClass(tablesFilter.FILTER_COLOR_SELECTED);
                    let actionButtonBefore = colorButton.closest(".fixed-action-btn").children("a.btn-floating");
                    actionButtonBefore
                        .removeClass("filter-color")
                        .addClass("black");
                    actionButtonBefore.attr("filter-color", null);
                    let colorForRemove = colorButton.attr("filter-color") * 1.0 + 1;
                    let otherColorsForRemove = $dialog.find(".filter-color-" + colorForRemove);
                    otherColorsForRemove.removeClass(tablesFilter.FILTER_COLOR_ALREADY_SELECTED);
                    checkActionButtons();
                } else {
                    console.log("fail")
                }
            }
        };

        TablesFilter.refreshRefColumnsFromBackend = function (parsed) {
            let refColumnConfig = JSON.parse(parsed.refColumnData);
            let queryColumnName = parsed.queryColumnName;
            let data = refColumnConfig.data;

            resultTables.activeQueries[tablesFilter.queryOfDialog.id].columns
                .filter(column => {
                    return column.columnName === queryColumnName;
                })
                .forEach(column => {
                let newRefColumns = data.filter(d => {
                    return d.queryColumnName === column.columnName;
                });
                let refColumnsSyntax = [];
                newRefColumns.forEach(column => {
                    refColumnsSyntax.push(column.tableName + "." + column.columnName);
                })
                column.referencedColumns = refColumnsSyntax;
            });

            console.log("queryOfDialog");
            console.log(tablesFilter.queryOfDialog);
            tablesFilter.updateRefColumnsByDialog(tablesFilter.queryOfDialog.id);
            //$('.filter-table').DataTable().clear().destroy();
            //tablesFilter.initFilterAddDialog(tablesFilter.queryOfDialog.id);
        }

        TablesFilter.columnNameOfButtonRow = function (row) {
            let columnName = row[0].toString();

            return columnName;
        }

        return TablesFilter;
    }(jQuery);
    resultTables.init();
})();