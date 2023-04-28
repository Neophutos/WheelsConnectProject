/**
 * Name: ts_uilayouthandler.js.js
 *
 * Creator: Michael Heyer (mhy)
 *
 * Date: 2022-09-19 ff.
 *
 * Description: Javascript ts_uilayouthandler.js implementation.
 *
 * Copyright (c) 2022 The TechSpring GmbH. All rights reserved.
 *
 */

(function () {
    if (!window.uiLayoutHandler) window.uiLayoutHandler = function ($) {

        let UILayoutHandler = {

            uiLayout: null,

            defaultLayoutOptions: {
                enableCursorHotkey : false,
                showErrorMessages: false,
                fxSpeed: 0,
                north: {
                    initClosed: false,
                    resizable: false,
                    size: 69,
                },
                west: {
                    resizable: false,
                    size: 186,
                },
                center: {
                    minWidth: 50
                }
            },

            initializeHandler: function () {
                $(document).ready(function () {
                    uiLayoutHandler.initUiLayout();
                });
            },

            initUiLayout: function(options) {
                if (this.uiLayout != null) {
                    this.uiLayout.destroy();
                }

                if (options == null) {
                    options = {};
                }

                let $layoutContainer = $('.ui-layout-center').parent();
                let layoutOptions = $.extend(options, this.defaultLayoutOptions);
                this.uiLayout = $layoutContainer.layout(layoutOptions);
            }
        };

        return UILayoutHandler;
    }(jQuery);

    uiLayoutHandler.initializeHandler();
})();
