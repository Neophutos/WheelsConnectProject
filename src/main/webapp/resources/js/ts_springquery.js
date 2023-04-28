/**
 * Name: ts_springquery.js
 *
 * Creator: Tim Freund (tfr)
 *
 * Date: 2022-09-20 ff.
 *
 * Description: Javascript ts_springquery.js implementation.
 *
 * Copyright (c) 2022 The TechSpring GmbH. All rights reserved.
 *
 */

(function () {
    if (!window.springResultTableController) window.springResultTableController = function ($) {

        const SpringResultTableController = {}

        SpringResultTableController.init = function () {

        }

        SpringResultTableController.selectAllCheckboxes = function () {
            let checkboxes = $(".query-selector-checkbox");
            checkboxes.prop("checked", true);
        };

        SpringResultTableController.deselectAllCheckboxes = function () {
            let checkboxes = $(".query-selector-checkbox");
            checkboxes.prop("checked", false);
        };

        SpringResultTableController.globalSearch = function () {
            console.log("KEYUP");
            let searchValue = $("#global_filter").val().toLowerCase();
            let table = "table";
            $(".main-content").find(table).each(function () {
                $(this).find("tr").filter(function () {
                    return !$(this).find("th").hasClass("sorting") && !$(this).hasClass("filters");
                }).each(function () {
                    let match = false;
                    $(this).find("td").each(function () {
                        if ($(this).text().toLowerCase().indexOf(searchValue) != -1) {
                            match = true;
                            return false;
                        }
                    });
                        if (!match) {
                            $(this).hide();
                        } else {
                            $(this).show();
                        }
                    });
                });

            }


            SpringResultTableController.excelExport = function () {

                let table = $().DataTable();

                table.button('2-1').trigger();

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

            SpringResultTableController.initCategorySelectorTable = function (settings) {
                let tableElement = $('.all-categories-table');
                if (tableElement.attr("table-initialized") == null) {
                    let table = tableElement.DataTable();
                    tableElement.attr("table-initialized", "true");

                    table.on('select', function (e, dt, type, indexes) {
                        let td = table[type](indexes).nodes().to$();
                        if (!td.hasClass("actions")) {
                            $('.all-categories-table').find(".category-selected").removeClass("category-selected");
                            let categoryId = td.attr("category-id");
                            $(".all-queries-table").DataTable().columns(3).search("(" + categoryId + ")").draw();
                            td.addClass('category-selected');
                        }
                    });
                }
            };

            SpringResultTableController.initQuerySelectorTable = function (settings) {
                let tableElement = $(".all-queries-table");
                if (tableElement.attr("table-initialized") == null) {
                    tableElement.attr("table-initialized", "true");
                    tableElement.DataTable().columns(3).search("(_)").draw();
                }
            };

            return SpringResultTableController;
        }(jQuery);
        springResultTableController.init();
    }
)
    ();