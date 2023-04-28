(function () {
    if (!window.dataTablesAdditionalPlugins) window.dataTablesAdditionalPlugins = function ($) {
        const DataTablesAdditionalPlugins = {};

        /**
         * Function to generate an additional row containing results of matching columns.
         * @param $tableElement jQuery object of table DOM element.
         * @param table instance of datatables api.
         */
        DataTablesAdditionalPlugins.generateResultsRow = function($tableElement, table) {
            if ($tableElement.hasClass('results-row-table')) {
                const $thisTableElement = $tableElement;

                $thisTableElement
                    .find('tbody')
                    .append('<tr class="results-row"/>');

                table
                    .columns(':not(.none, .never)')
                    .every(function (idx) {
                        const $resultsCell = $('<td class="col_' + idx + '_results_cell number-column"/>');
                        $resultsCell.appendTo($thisTableElement.find('.results-row'));

                        let sum = 0.0;

                        if ($thisTableElement.hasClass("complex-fields")) {
                            let $data = $(this.nodes());

                            $data.toArray().forEach(elem => {
                                let $elem = $(elem);

                                if ($elem.attr("data-order")) {
                                    sum += parseFloat($elem.attr("data-order"));
                                }
                            })
                        } else {
                            sum = this.data().sum();
                        }

                        if (this.header().classList.contains('number-result-column')) {
                            $resultsCell
                                .append(
                                    $.fn.dataTable.render
                                        .number( '\.', ',', 2)
                                        .display(sum)
                                );
                        } else if (this.header().classList.contains('currency-result-column')) {
                            $resultsCell
                                .append(this
                                    .data()
                                    .sum()
                                    .toLocaleString('de-DE', {style: 'currency', currency: 'EUR'})
                                );
                        } else if (this.header().classList.contains('result-title-column')) {
                            $resultsCell
                                .removeClass('number-column')
                                .append(tsMsg("de.techspring.common.datatables.custom.results.row.title.value"));
                        }
                    });
            }
        }

        return DataTablesAdditionalPlugins;
    }(jQuery);
})();