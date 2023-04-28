/**
 * Name: ts_column.js
 *
 * Creator: Tim Freund (tfr)
 *
 * Date: 2022-09-28 ff.
 *
 * Description: Javascript ts_column.js implementation.
 *
 * Copyright (c) 2022 The TechSpring GmbH. All rights reserved.
 *
 */

(function () {
    if (!window.ts_column) window.tsColumn = function ($) {

        var TsColumn = {
            Column: function () {
                this.id = null;
                this.filterSwitch = null;
                this.filter = null;
                this.referencedColumns = null;
                this.filterColor = null;
                this.columnName = null;
            }
        }

        TsColumn.init = function () {

        }

        TsColumn.getRows = function () {
            if (this.rows != null) {
                return this.rows
            }
            console.error("rows are not set!");
        }


        return TsColumn;
    }(jQuery);
    tsColumn.init();
})();