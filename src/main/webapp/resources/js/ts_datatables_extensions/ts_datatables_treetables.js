(function () {
    if (!window.dataTablesTreeTables) window.dataTablesTreeTables = function ($) {
        const DataTablesTreeTables = {};

        /**
         * Function to initialize a datatables instance as a tree table.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @param visibleRowParentIds array of ids for visible parent rows.
         * @param useInfoCache flag to determine if a cache for parent/child relations shall be used.
         * @param internalRowInfoCache cache for parent/child relations.
         */
        DataTablesTreeTables.initTreeTables = function(table, $tableElement, visibleRowParentIds, useInfoCache, internalRowInfoCache) {
            // let t1 = performance.now();
            dataTablesTreeTables.filterForParentRowIds(table, visibleRowParentIds);
            _initTreeTableRowStyles(table, useInfoCache, internalRowInfoCache);
            _initTreeTableBranchToggleClickEventHandlers($tableElement, visibleRowParentIds, useInfoCache, internalRowInfoCache);
            _setToggleArrowDirection(visibleRowParentIds);
            // let t2 = performance.now();
            // console.log("perf onLoad tree table:              " + (t2 - t1) + "ms");
        }

        /**
         * function to toggle visibility for an entire level of rows in a tree table.
         * @param table instance of datatables api.
         * @param hierarchyLevel array of numbers for hierarchy levels desired to display.
         * @param visibleRowParentIds array of ids for visible parent rows.
         */
        DataTablesTreeTables.displayLevel = function(hierarchyLevel, table, visibleRowParentIds) {
            let fIdsForToggle = [];
            for (let i = 0; i < hierarchyLevel; i++) {
                fIdsForToggle = fIdsForToggle.concat(_getFidsForHierarchyLevel(i + 1));
            }
            visibleRowParentIds = [0].concat(fIdsForToggle);
            dataTablesTreeTables.filterForParentRowIds(table, visibleRowParentIds);
            _setToggleArrowDirection();
            $(dataTablesConstants.DT_WRAPPER_SELECTOR).click();
        }

        /**
         * Function to process search on tree branches.
         * @param table instance of datatables api.
         * @param $tableElement jQuery object of table DOM element.
         * @param isTreeSearchProcessed flag to determine if a tree search has been processed. This prevents stack overflow.
         * @param visibleRowParentIds array of ids for visible parent rows.
         * @param visibleRowParentIdsTemp array of ids for temporarily visible parent rows.
         */
        DataTablesTreeTables.processTreeSearch = function(table, $tableElement, isTreeSearchProcessed, visibleRowParentIds, visibleRowParentIdsTemp) {
            if (!isTreeSearchProcessed.isTreeSearchProcessed) {
                if (_isSearchOtherThanParentIdOrLevelOrPreFilter(table)) {
                    let goodToGo = false;
                    const hierarchyColumn = table.column('.hierarchy-data-parent-id');
                    const hierarchyDataColumnIdx = hierarchyColumn.index();
                    if (hierarchyColumn.search() !== '') {
                        hierarchyColumn.search('');
                    } else {
                        goodToGo = true;
                    }

                    if (goodToGo) {
                        visibleRowParentIdsTemp = visibleRowParentIds.slice();
                        table.rows({search: 'applied'}).every(function (rowIdx) {
                            const fId = table.cell(rowIdx, hierarchyDataColumnIdx).node().getAttribute(dataTablesConstants.ATTR_F_ID);
                            const parentId = table.cell(rowIdx, hierarchyDataColumnIdx).node().getAttribute(dataTablesConstants.ATTR_PARENT_ID);

                            if (!visibleRowParentIdsTemp.includes(fId)) {
                                visibleRowParentIdsTemp.push(fId);
                                if (!visibleRowParentIdsTemp.includes(parentId)) {
                                    visibleRowParentIdsTemp.push(parentId);
                                }
                            }
                        });
                        isTreeSearchProcessed.isTreeSearchProcessed = true;
                        dataTablesTreeTables.filterForParentRowIds(table, visibleRowParentIdsTemp);
                        isTreeSearchProcessed.isTreeSearchProcessed = false;
                        if (!$tableElement.find('>tbody').hasClass('tree-filtered')) {
                            $tableElement.find('>tbody').addClass('tree-filtered');
                        }
                    }
                } else {
                    isTreeSearchProcessed.isTreeSearchProcessed = true;
                    dataTablesTreeTables.filterForParentRowIds(table, visibleRowParentIds);
                    isTreeSearchProcessed.isTreeSearchProcessed = false;
                    $tableElement.find('>tbody').removeClass('tree-filtered');
                }
            }
        }

        /**
         * Core function of the tree table. Enables tree structure by grouped sorting.
         * @param a datatables comparable value api instance.
         * @param b datatables comparable value api instance.
         * @param isAscending flag to determine if the results should be displayed in an ascending or descending order.
         * @param useInfoCache flag to determine if a cache for parent/child relations shall be used.
         * @param internalRowInfoCache cache for parent/child relations.
         * @param anyNumberSort function for sorting numbers.
         * @param removeHtmlTags function for removing html tags.
         * @returns {number|number|*|number}
         */
        DataTablesTreeTables.recursiveTreeSortWrapper = function(a, b, isAscending, useInfoCache, internalRowInfoCache, anyNumberSort, removeHtmlTags) {
            const thisGenericDataTable = materializetool.tables[$(a.meta.settings.nTable).attr("datatable-selector")];
            const table = a.meta.settings.oInstance.api();
            return recursiveTreeSort(a.meta.row, b.meta.row, a.meta.col, isAscending);

            /**
             * Function to order rows in branches, grouped by their parent rows.
             * @param aIdx index of first row to compare.
             * @param bIdx index of second row to compare.
             * @param colIdx index of current column.
             * @param isAscending flag to determine if the results should be displayed in an ascending or descending order.
             * @returns 0, 1 or -1
             */
            function recursiveTreeSort(aIdx, bIdx, colIdx, isAscending) {
                if (table) {
                    const modifier = isAscending ? 1 : -1;
                    const hierarchyDataColumnIdx = table.column(dataTablesConstants.HIERARCHY_DATA_COL_SELECTOR).index();
                    const hierarchyCellA = table.cell(aIdx, hierarchyDataColumnIdx).node();
                    const hierarchyCellB = table.cell(bIdx, hierarchyDataColumnIdx).node();

                    let valueA;
                    let valueB;

                    if (table.cell(aIdx, colIdx).node().hasAttribute('data-sort')) {
                        valueA = table.cell(aIdx, colIdx).node().getAttribute('data-sort');
                        valueB = table.cell(bIdx, colIdx).node().getAttribute('data-sort');
                    } else {
                        valueA = table.cell(aIdx, colIdx).data();
                        valueB = table.cell(bIdx, colIdx).data();
                    }

                    if (hierarchyCellA && hierarchyCellB) {
                        const aParentId = hierarchyCellA.getAttribute(dataTablesConstants.ATTR_PARENT_ID);
                        const bParentId = hierarchyCellB.getAttribute(dataTablesConstants.ATTR_PARENT_ID);
                        const aLevel = hierarchyCellA.getAttribute(dataTablesConstants.ATTR_HIERARCHY_LEVEL);
                        const bLevel = hierarchyCellB.getAttribute(dataTablesConstants.ATTR_HIERARCHY_LEVEL);

                        if (aParentId === bParentId) {
                            let result;

                            if (table.column(colIdx).header().classList.contains(dataTablesConstants.NUMBER_COLUMN_CLASS)) {
                                // special case: any number sort
                                result = modifier * anyNumberSort(valueA, valueB, Number.NEGATIVE_INFINITY);
                            } else {
                                // regular string sort
                                result = modifier * _compareCellValues(valueA, valueB, removeHtmlTags);
                            }

                            if (result === 0) {
                                // in case of equality, we compare the row data's ID, to achieve hierarchical sorting
                                result = modifier * _compareCellValues(hierarchyCellA.getAttribute(dataTablesConstants.ATTR_F_ID), hierarchyCellB.getAttribute(dataTablesConstants.ATTR_F_ID), removeHtmlTags);
                            }
                            return result;
                        } else if (aLevel < bLevel) {
                            const bParentIdx = getParentRowIdx(bParentId, useInfoCache, internalRowInfoCache);
                            return aIdx === bParentIdx ? -1 : recursiveTreeSort(aIdx, bParentIdx, colIdx, isAscending);
                        } else if (bLevel < aLevel) {
                            const aParentIdx = getParentRowIdx(aParentId, useInfoCache, internalRowInfoCache);
                            return bIdx === aParentIdx ? 1 : recursiveTreeSort(aParentIdx, bIdx, colIdx, isAscending);
                        } else {
                            return recursiveTreeSort(getParentRowIdx(aParentId, useInfoCache, internalRowInfoCache), getParentRowIdx(bParentId, useInfoCache, internalRowInfoCache), colIdx, isAscending);
                        }
                    } else {
                        return 0;
                    }
                } else {
                    return 0;
                }
            }

            /**
             * Function to get the row index of the parent row for a row in a tree table.
             * @param parentId id of the current row's parent row.
             * @param useInfoCache flag to determine if a cache for parent/child relations shall be used.
             * @param internalRowInfoCache cache for parent/child relations.
             * @returns index of parent row
             */
            function getParentRowIdx(parentId, useInfoCache, internalRowInfoCache) {
                let rowIdx = null;
                if (useInfoCache) {
                    let rowInfo = thisGenericDataTable ? thisGenericDataTable.rowInfoCache[parentId] : internalRowInfoCache[parentId];
                    if (rowInfo != null) {
                        rowIdx = rowInfo.rowIndex;
                    } else {
                        // console.log("no row info found in cache for parentId " + parentId);
                    }
                } else {
                    const hierarchyDataColumnIdx = table.column(dataTablesConstants.HIERARCHY_DATA_COL_SELECTOR).index();
                    const indexes = table.rows().eq(0).filter(function (rowIdx) {
                        const fId = table.cell(rowIdx, hierarchyDataColumnIdx).node().getAttribute(dataTablesConstants.ATTR_F_ID);
                        return fId === parentId;
                    });
                    rowIdx = indexes[0];
                }
                return rowIdx;
            }
        }

        /**
         * Function to generate a cache for parent/child relations of datatable rows.
         * @param $tableElement jQuery object of table DOM element.
         * @returns {*[]} cache of parent/child relations.
         */
        DataTablesTreeTables.generateTreeTableCache = function($tableElement) {
            let internalRowInfoCache = [];
            $tableElement.find(">tbody >tr >td[f-id]").each(function (index, tdElement) {
                let $td = $(tdElement);
                let fId = $td.attr('f-id');
                let hierarchyLevel = $td.attr('hierarchy-level');
                let parentId = $td.attr('parent-id');
                internalRowInfoCache[fId] = {
                    rowIndex: index,
                    fId: fId,
                    hierarchyLevel: hierarchyLevel,
                    parentId: parentId,
                    childRowIdx: []
                };
            });
            for (let ric in internalRowInfoCache) {
                if (internalRowInfoCache.hasOwnProperty(ric)) {
                    let info = internalRowInfoCache[ric];
                    let parentInfo = internalRowInfoCache[info.parentId];
                    if (parentInfo != null) {
                        parentInfo.childRowIdx.push(info.rowIndex);
                    }
                }
            }
            return internalRowInfoCache;
        }

        /**
         * Function to hide rows on a tree table, when their parent branch is closed.
         * @param table instance of datatables api.
         * @param visibleRowParentIdsArray any array of ids for visible parent rows.
         */
        DataTablesTreeTables.filterForParentRowIds = function(table, visibleRowParentIdsArray) {
            let filterValue = visibleRowParentIdsArray.join('$|^');
            if (filterValue.length > 0) {
                filterValue = '^'.concat(filterValue).concat('$');
            }
            table.column(dataTablesConstants.HIERARCHY_DATA_COL_SELECTOR).search(filterValue, true, false).draw(false);
        }

        return DataTablesTreeTables;

        // *************************************************************************************************************
        // private functions

        /**
         * Function to get the ID (not the index!) of a row's data.
         * @param table instance of datatables api.
         * @param rowIdx index number of a row.
         * @returns number ID of a row.
         * @private
         */
        function _getRowId(table, rowIdx) {
            const hierarchyColIdx = table.column(dataTablesConstants.HIERARCHY_DATA_COL_SELECTOR).index();
            return parseInt($(table.cell(rowIdx, hierarchyColIdx).node()).attr('f-id'), 10);
        }

        /**
         * Function to iterate all rows in a tree table and determine if they contain child branches.
         * @param table instance of datatables api.
         * @param useInfoCache flag to determine if a cache for parent/child relations shall be used.
         * @param internalRowInfoCache cache for parent/child relations.
         * @private
         */
        function _initTreeTableRowStyles(table, useInfoCache, internalRowInfoCache) {
            table.rows().every(function (idx) {
                const dtRow = this;
                const fId = _getRowId(table, idx);
                _setRowHasChildrenStyle(dtRow, fId, useInfoCache, internalRowInfoCache);
            })
        }

        /**
         * Function to mark a tree table row as a parent row containing child branches.
         * @param dtRow instance of datatables row api.
         * @param fId ID of a row.
         * @param useInfoCache flag to determine if a cache for parent/child relations shall be used.
         * @param internalRowInfoCache cache for parent/child relations.
         * @private
         */
        function _setRowHasChildrenStyle(dtRow, fId, useInfoCache, internalRowInfoCache) {
            const childRowIndexes = _getChildRowIdxs(fId, useInfoCache, internalRowInfoCache);
            if (childRowIndexes.length > 0) {
                if (!dtRow.node().classList.contains(dataTablesConstants.ROW_HAS_CHILDREN_CLASS)) {
                    dtRow.node().classList.add(dataTablesConstants.ROW_HAS_CHILDREN_CLASS);
                }
            }
        }

        /**
         * Function to initialize all event handlers and additional elements to process handling of tree table branch toggling.
         * @param $tableElement jQuery object of table DOM element.
         * @param visibleRowParentIds array of ids for visible parent rows.
         * @param useInfoCache flag to determine if a cache for parent/child relations shall be used.
         * @param internalRowInfoCache cache for parent/child relations.
         * @private
         */
        function _initTreeTableBranchToggleClickEventHandlers($tableElement, visibleRowParentIds, useInfoCache, internalRowInfoCache) {
            const elementSelector = 'tbody:not(.tree-filtered) tr td:first-child:not([style*="display:none"])';
            const isBeforeElement = function (event, $element) {

                const indent = ($element.css("--level") * 15) + 10;

                const offsetLeft = $element.offset().left;
                const offsetTop = $element.offset().top;

                const myOffsetX = event.clientX - offsetLeft;
                const myOffsetY = event.pageY - offsetTop;

                const yMatch = myOffsetY > 11 && myOffsetY <= 40;
                const xMatch = myOffsetX < indent - 2 && myOffsetX > indent - 24;

                return (xMatch && yMatch);
            }

            $tableElement.on('mousemove', elementSelector, function (event) {
                const $element = $(this);
                const condition = isBeforeElement(event, $element);
                if (condition && !$element.hasClass(dataTablesConstants.HOVERING_BEFORE_ELEMENT_CLASS)) {
                    $element.addClass(dataTablesConstants.HOVERING_BEFORE_ELEMENT_CLASS);
                } else if (!condition && $element.hasClass(dataTablesConstants.HOVERING_BEFORE_ELEMENT_CLASS)) {
                    $element.removeClass(dataTablesConstants.HOVERING_BEFORE_ELEMENT_CLASS);
                }
            });

            $tableElement.on('mouseleave', elementSelector, function (event) {
                const $element = $(this);
                if ($element.hasClass(dataTablesConstants.HOVERING_BEFORE_ELEMENT_CLASS)) {
                    $element.removeClass(dataTablesConstants.HOVERING_BEFORE_ELEMENT_CLASS);
                }
            });

            $tableElement.on('click', elementSelector, function (event) {
                const $element = $(this);
                const condition = isBeforeElement(event, $element);

                if (condition) {
                    const table = materializetool.tables[$tableElement.attr('datatable-selector')].table;
                    const $row = $(this).closest('tr');
                    const fId = parseInt($(table.cell($row, dataTablesConstants.HIERARCHY_DATA_COL_SELECTOR).node()).attr(dataTablesConstants.ATTR_F_ID), 10);
                    let opened;

                    const fIdArrayIdx = visibleRowParentIds.indexOf(fId);
                    if (fIdArrayIdx > -1) {
                        visibleRowParentIds.splice(fIdArrayIdx, 1);
                        $row.removeClass(dataTablesConstants.ROW_CHILDREN_VISIBLE_CLASS);
                        _hideGrandChildren(table, fId, useInfoCache, internalRowInfoCache, visibleRowParentIds);
                        opened = false;
                    } else {
                        visibleRowParentIds.push(fId);
                        $row.addClass(dataTablesConstants.ROW_CHILDREN_VISIBLE_CLASS);
                        opened = true;
                    }
                    dataTablesTreeTables.filterForParentRowIds(table, visibleRowParentIds);

                    if (opened) {
                        _executeOnRowDisplay();
                    }
                }
            });
        }

        /**
         * Function to also hide any "grandchild"-rows when a branched row is toggled closed.
         * @param table instance of datatables api.
         * @param fId ID of a row.
         * @param useInfoCache flag to determine if a cache for parent/child relations shall be used.
         * @param internalRowInfoCache cache for parent/child relations.
         * @param visibleRowParentIds array of ids for visible parent rows.
         * @private
         */
        function _hideGrandChildren(table, fId, useInfoCache, internalRowInfoCache, visibleRowParentIds) {
            const hierarchyDataColumnIdx = table.column(dataTablesConstants.HIERARCHY_DATA_COL_SELECTOR).index();
            const childRowIndexes = _getChildRowIdxs(fId, useInfoCache, internalRowInfoCache);
            for (let cri = 0; cri < childRowIndexes.length; cri++) {
                let idx = childRowIndexes[cri];
                const childRow = table.row(idx, hierarchyDataColumnIdx).node();
                const childRowId = parseInt(table.cell(idx, hierarchyDataColumnIdx).node().getAttribute(dataTablesConstants.ATTR_F_ID), 10);
                const fIdArrayIdx = visibleRowParentIds.indexOf(childRowId);
                if (fIdArrayIdx > -1) {
                    visibleRowParentIds.splice(fIdArrayIdx, 1);
                    childRow.classList.remove(dataTablesConstants.ROW_CHILDREN_VISIBLE_CLASS);
                    _hideGrandChildren(table, childRowId, useInfoCache, internalRowInfoCache, visibleRowParentIds);
                }
            }
        }

        /**
         * Function to display correct toggle arrow for hidden/visible children.
         * @param visibleRowParentIds array of ids for visible parent rows.
         * @private
         */
        function _setToggleArrowDirection(visibleRowParentIds) {
            $('tr').removeClass(dataTablesConstants.ROW_CHILDREN_VISIBLE_CLASS);
            visibleRowParentIds.forEach(value => {
                $('td[f-id = ' + value + ']').parent().addClass(dataTablesConstants.ROW_CHILDREN_VISIBLE_CLASS);
            });
        }

        /**
         * Function to get f-ids for all rows on a hierarchy level containing children.
         * @param hierarchyLevel number of hierarchy level.
         * @returns array of f-ids for matching rows.
         * @private
         */
        function _getFidsForHierarchyLevel(hierarchyLevel) {
            const fIdsForHierarchyLevel = [];
            table.cells('[hierarchy-level = ' + hierarchyLevel + ']').every(function (idx) {
                if ($(this.node()).parent().hasClass(dataTablesConstants.ROW_HAS_CHILDREN_CLASS)) {
                    const fId = parseInt($(this.node()).attr('f-id'), 10);
                    fIdsForHierarchyLevel.push(fId);
                }
            });
            return fIdsForHierarchyLevel;
        }

        /**
         * Function to get row indexes of all child rows for a row in a tree table.
         * @param fId ID of a row.
         * @param useInfoCache flag to determine if a cache for parent/child relations shall be used.
         * @param internalRowInfoCache cache for parent/child relations.
         * @returns array of child row indexes
         * @private
         */
        function _getChildRowIdxs(fId, useInfoCache, internalRowInfoCache) {
            let childRows = [];
            if (useInfoCache) {
                let rowInfo = internalRowInfoCache[fId];
                if (rowInfo != null) {
                    childRows = rowInfo.childRowIdx;
                } else {
                    // console.log("no row info found in cache for fId " + fId);
                }
            } else {
                const hierarchyDataColumnIdx = table.column(dataTablesConstants.HIERARCHY_DATA_COL_SELECTOR).index();
                childRows = table.rows().eq(0).filter(function (rowIdx) {
                    const parentId = table.cell(rowIdx, hierarchyDataColumnIdx).node().getAttribute(dataTablesConstants.ATTR_PARENT_ID);
                    return parseInt(parentId, 10) === fId;
                });
            }

            return childRows;
        }

        /**
         * Function to create tags on newly visible rows.
         * @private
         */
        function _executeOnRowDisplay() {
            if (typeof (inlineTagEdit) !== "undefined") {
                inlineTagEdit.initialize();
            }
        }

        /**
         * Function to determine if a value was entered in any search or column filter field.
         * @param table instance of datatables api.
         * @returns {boolean}
         * @private
         */
        function _isSearchOtherThanParentIdOrLevelOrPreFilter(table) {
            let result = false;
            if (table.search().length > 0) {
                result = true;
            } else {
                table.columns().every(function () {
                    const colHeader = this.header();
                    const colFooter = this.footer();
                    if (!colHeader.classList.contains('hierarchy-data-parent-id')
                        && !colHeader.classList.contains('hierarchy-level')
                        && !colFooter.classList.contains('view-prefilter')
                        && this.search().length > 0) {
                        result = true;
                        return false;
                    }
                });
            }
            return result;
        }

        /**
         * Helper function to compare values according to their data type.
         * @param valueA cell value.
         * @param valueB cell value.
         * @param removeHtmlTags function to remove html tags.
         * @returns {number} 1,-1 or 0
         * @private
         */
        function _compareCellValues(valueA, valueB, removeHtmlTags) {
            let valA = removeHtmlTags(valueA).toLowerCase();
            let valB = removeHtmlTags(valueB).toLowerCase();
            // valA = valA === '' || isNaN(valA) ? valA : Number(valA);
            // valB = valB === '' || isNaN(valB) ? valB : Number(valB);
            if (valA !== '' && valB !== '') {
                if (!isNaN(valA) && !isNaN(valB)) {
                    valA = Number(valA);
                    valB = Number(valB);
                }
            }

            return (valA > valB ? 1 : valA < valB ? -1 : 0);
        }

    }(jQuery);
})();