/**
 * Name: ts_query.js
 *
 * Creator: Tim Freund (tfr)
 *
 * Date: 2022-09-28 ff.
 *
 * Description: Javascript ts_query.js implementation.
 *
 * Copyright (c) 2022 The TechSpring GmbH. All rights reserved.
 *
 */

(function () {
    if (!window.ts_query) window.ts_query = function ($) {

        var TS_Query = {
            Query: function () {
                this.id = null;
                this.columns = [];
            }
        }

        TS_Query.init = function () {

        }


        return TS_Query;
    }(jQuery);
    ts_query.init();
})();