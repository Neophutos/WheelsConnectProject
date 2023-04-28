/**
 * Name: ts_toasthandler.js
 *
 * Creator: Fabian Frank (ffr)
 *
 * Date: 09.02.2021 ff.
 *
 * Description: Javascript ts_toasthandler.js implementation.
 *
 * Copyright (c) 2021 The TechSpring GmbH. All rights reserved.
 *
 * $Author$
 * $Revision$
 * $Date$
 * $Id$
 */

(function () {
    if (!window.toastHandler) window.toastHandler = function ($) {
        this.noticeClass = "noticeToast";
        this.warningClass = "warningToast";
        this.errorClass = "errorToast";

        const ToastHandler = {
            toastTypes: {
                NOTICE: "0",
                WARNING: "1",
                ERROR: "2"
            }
        };

        /**
         * This functions needs to be called in order to construct toasts
         */
        ToastHandler.initialize = function(noticeClass, warningClass, errorClass, otherClasses) {
            toastHandler.noticeClass = typeof noticeClass !== "undefined" ? noticeClass : "noticeToast";
            toastHandler.warningClass = typeof warningClass !== "undefined" ? warningClass : "warningToast";
            toastHandler.errorClass = typeof errorClass !== "undefined" ? errorClass : "errorToast";
            toastHandler.otherClasses = typeof otherClasses !== "undefined" ? otherClasses : "";
        }

        /**
         * Construct an notice-toast with the passed parameters.
         *
         * @param html HTML of the toast
         * @param additionalOptions Additional options object which will be concatenated
         * @param completeCallback Callback after the toast disappeared
         */
        ToastHandler.openNotice = function (html, additionalOptions, completeCallback) {
            let toastOptions = ToastHandler._createOption(ToastHandler.toastTypes.NOTICE, html, additionalOptions, completeCallback);

            if (Object.keys(toastOptions).length !== 0 && toastOptions.constructor === Object) {
                this._openToasts(toastOptions);
            } else {
                console.error("ToastHandler.openNotice(): Couldn't open toast because the constructed option object is invalid", toastOptions);
            }
        }

        /**
         * Construct an warning-toast with the passed parameters.
         *
         * @param html HTML of the toast
         * @param additionalOptions Additional options object which will be concatenated
         * @param completeCallback Callback after the toast disappeared
         */
         ToastHandler.openWarning = function (html, additionalOptions, completeCallback) {
            let toastOptions = ToastHandler._createOption(ToastHandler.toastTypes.WARNING, html, additionalOptions, completeCallback);

            if (Object.keys(toastOptions).length !== 0 && toastOptions.constructor === Object) {
                this._openToasts(toastOptions);
            } else {
                console.error("ToastHandler.openWarning(): Couldn't open toast because the constructed option object is invalid", toastOptions);
            }
        }

        /**
         * Construct an error-toast with the passed parameters.
         *
         * @param html HTML of the toast
         * @param additionalOptions Additional options object which will be concatenated
         * @param completeCallback Callback after the toast disappeared
         */
         ToastHandler.openError = function (html, additionalOptions, completeCallback) {
            let toastOptions = ToastHandler._createOption(ToastHandler.toastTypes.ERROR, html, additionalOptions, completeCallback);

            if (typeof(dialogtool) !== 'undefined') {
                dialogtool.dialogBlocked = true;
            }

            if (Object.keys(toastOptions).length !== 0 && toastOptions.constructor === Object) {
                this._openToasts(toastOptions);
            } else {
                console.error("ToastHandler.openError(): Couldn't open toast because the constructed option object is invalid", toastOptions);
            }
        }

        /**
         * Dismiss all active toasts
         */
         ToastHandler.dismissAll = function() {
            M.Toast.dismissAll();
         }

        /**
         * Construct a toast with the passed options.
         *
         * @param options Options of the toast
         * @private This function is called by open*
         */
        ToastHandler._openToasts = function (options) {
            M.toast(options);
        }

        /**
         * Create an option object for constructing toasts.
         *
         * @param type Type of the toast (TOAST_TYPE)
         * @param html HTML of the toast
         * @param additionalOptions Additional options object which will be concatenated
         * @param completeCallback Callback after the toast disappeared
         * @returns {{}}
         * @private This function is called by open*.
         */
        ToastHandler._createOption = function (type, html, additionalOptions, completeCallback) {
            let toastOptions = {};

            if (typeof html !== "undefined" && html.length > 0) {
                let classes = "";
                toastOptions["html"] = html;

                if (typeof additionalOptions !== "undefined") {
                    toastOptions = {...toastOptions, ...additionalOptions};
                }

                if (typeof completeCallback != "undefined") {
                    toastOptions["completeCallback"] = completeCallback;
                }

                switch (type) {
                    case ToastHandler.toastTypes.NOTICE:
                        classes = ToastHandler.noticeClass;
                        break;
                    case ToastHandler.toastTypes.WARNING:
                        classes = ToastHandler.warningClass;
                        break;
                    case ToastHandler.toastTypes.ERROR:
                        classes = ToastHandler.errorClass;
                        break;
                }

                if (typeof toastOptions["classes"] !== "undefined") {
                    toastOptions["classes"] = classes + " " + toastOptions["classes"];
                } else {
                    toastOptions["classes"] = classes;
                }
            } else {
                console.warn("Couldn't create option for toast because the passed html is undefined")
            }

            return toastOptions;
        }

        return ToastHandler;
    }(jQuery);
})();
