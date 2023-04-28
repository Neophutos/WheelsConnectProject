/**
 * Name: ts_dialog.js
 *
 * Creator: Michael Heyer (mhy)
 *
 * Date: 2020-07-29 ff.
 *
 * Description: Javascript ts_dialog.js implementation.
 *
 * Copyright (c) 2020 The TechSpring GmbH. All rights reserved.
 *
 * $Author$
 * $Revision$
 * $Date$
 * $Id$
 */

(function () {
    if (!window.dialogtool) window.dialogtool = function ($) {
        let DialogTool = {

            dialogBlocked: false,
            buttonsLeft: typeof(dialogButtonsLeft) === 'undefined' ? false : dialogButtonsLeft,

            initModal: function (baseName, dismissible) {
                let dialogId = baseName + "-modal-dialog";
                let dialogElement = $("#" + dialogId);

                if (!dialogElement.length) {
                    let modalFooterAdditionalClasses = dialogtool.buttonsLeft ? 'modal-footer-left' : '';
                    dialogElement = $('<div id="' + dialogId + '" class="modal">' +
                        ' <div class="modal-content"></div>' +
                        ' <div class="modal-footer ' + modalFooterAdditionalClasses + '"></div>' +
                        '</div>').appendTo("body");
                }

                let defaultOptions = {
                    startingTop: '2%',
                    endingTop: '5%',
                    dismissible: dismissible,
                    draggable: false,
                    resizable: false,
                    onOpenEnd: function() {
                        $("textarea.autoresize:visible").each(function(index, textAreaElement) {
                            M.textareaAutoResize(textAreaElement);
                        });

                        let zIndex = this.options.zIndex;
                        if ($.isNumeric(zIndex)) {
                            this.$overlay.css('z-index', zIndex);
                            this.$el.css('z-index', zIndex + 1);
                        }
                    }
                };

                let options;
                if (typeof(materializetool) !== 'undefined') {
                    let customOptionsStr = dialogElement.attr("dialog-custom-options");
                    let customOptions = materializetool.parseCustomOptions(customOptionsStr);

                    options = $.extend(true, {},
                        defaultOptions,
                        customOptions
                    );
                } else {
                    options = defaultOptions;
                }

                M.Modal.init(dialogElement, options);

                if (options.resizable) {
                    let resizableDefaultOptions = {
                        handles: " n, e, s, w, ne, se, sw, nw",
                        classes: {
                            "ui-resizable-se": ""
                        },
                        autoHide: false,
                        hideOverflow: true
                    };

                    let resizableCustomOptions;
                    if (typeof(options.resizableOptions) !== 'undefined') {
                        resizableCustomOptions = options.resizableOptions;
                    } else {
                        resizableCustomOptions = {};
                    }

                    let resizableOptions = $.extend(true, {},
                        resizableDefaultOptions,
                        resizableCustomOptions
                    );
                    dialogElement.resizable(resizableOptions);
                    if (resizableOptions.hideOverflow) {
                        dialogElement.css("overflow", "hidden");
                    }
                    dialogElement.addClass("modal-resizable");
                }

                if (options.draggable) {
                    let draggableDefaultOptions = {
                        cancel:".modal-content,.modal-footer"
                    };

                    let draggableCustomOptions;
                    if (typeof(options.draggableOptions) !== 'undefined') {
                        draggableCustomOptions = options.draggableOptions;
                    } else {
                        draggableCustomOptions = {};
                    }

                    let draggableOptions = $.extend(true, {},
                        draggableDefaultOptions,
                        draggableCustomOptions
                    );
                    dialogElement.draggable(draggableOptions);
                }

                return dialogElement;
            },

    		openModal: function (baseName, dismissible) {
                let dialogElement = this.getMaterializeInstance(baseName);

                if (!this.dialogBlocked) {
                    if (typeof dialogElement === "undefined") {
                        dialogtool.initModal(baseName, dismissible);
                        dialogElement = this.getMaterializeInstance(baseName);
                    }

                    if (!dialogElement.isOpen) {
                        dialogElement.open();

                        if (dismissible != null) {
                            dialogElement.options.dismissible = dismissible;
                        }
                    }
                } else {
                    this.dialogBlocked = false;
                }

                return dialogElement;
            },

            openModalOnEvent: function (ev, status, baseName, dismissible, optionalCallback) {
                if (ev != null && ev.status === status) {
                    if (!this.dialogBlocked) {
                        dialogtool.openModal(baseName, dismissible);
                        if (optionalCallback) {
                            optionalCallback();
                        }
                    } else {
                        this.dialogBlocked = false;
                    }
                }
            },

    		closeModal: function (baseName) {
                let dialogElement = this.getMaterializeInstance(baseName)

                if (typeof dialogElement !== "undefined" && !this.dialogBlocked) {
                    dialogElement.close();
                }

                this.dialogBlocked = false;
            },

    		closeAndDestroyModal: function (baseName) {
                let dialogElement = this.getMaterializeInstance(baseName);

                if(typeof dialogElement !== "undefined") {
                    dialogElement.close();
                    dialogElement.destroy();
                }
            },

    		destroyModal: function (baseName) {
                let dialogElement = this.getMaterializeInstance(baseName);

                if(typeof dialogElement !== "undefined") {
                    dialogElement.close();
                    dialogElement.el.remove();
                    dialogElement.destroy();
                }
            },

            getMaterializeInstance : function(baseName) {
                let element = $("#" + baseName + "-modal-dialog");
                let modalInstance = undefined;

                if(element.length) {
                    modalInstance = M.Modal.getInstance(element);
                }

                return modalInstance;
            }
        };

        return DialogTool;
    }(jQuery);
})();
