/**
 * Name: ts_materialize.js
 *
 * Creator: Michael Heyer (mhy)
 *
 * Date: 2020-03-23 ff.
 *
 * Description: Javascript ts_materialize.js implementation.
 *
 * Copyright (c) 2020-2021 The TechSpring GmbH. All rights reserved.
 *
 * $Author$
 * $Revision$
 * $Date$
 * $Id$
 */

if (!String.prototype.format) {
    /**
     * Augment String.prototype to allow for easier formatting.  This implementation
     * doesn't completely destroy any existing String.prototype.format functions,
     * and will stringify objects/arrays.
     *
     * Source: https://gist.github.com/tbranyen/1049426
     */
    String.prototype.format = function(i, safe, arg) {

        function format() {
            let str = this, len = arguments.length + 1;

            // For each {0} {1} {n...} replace with the argument in that position.  If
            // the argument is an object, an array or a jQuery element it will be stringified to JSON.
            for (let i = 0; i < len; arg = arguments[i++]) {
                safe = typeof arg === 'object' || arg instanceof jQuery ? JSON.stringify(arg) : arg;
                str = str.replace(RegExp('\\{'+(i-1)+'\\}', 'g'), safe);
            }
            return str;
        }

        // Save a reference of what may already exist under the property native.
        // Allows for doing something like: if("".format.native) { /* use native */ }
        format.native = String.prototype.format;

        // Replace the prototype property
        return format;
    }();
}

if (!Element.prototype.scrollIntoViewIfNeeded) {

    Element.prototype.scrollIntoViewIfNeeded = function (centerIfNeeded) {
        "use strict";

        function makeRange(start, length) {
            return { "start": start, "length": length, "end": start + length };
        }

        function coverRange(inner, outer) {
            if (
                false === centerIfNeeded ||
                (outer.start < inner.end && inner.start < outer.end)
            ) {
                return Math.max(
                    inner.end - outer.length,
                    Math.min(outer.start, inner.start)
                );
            }
            return (inner.start + inner.end - outer.length) / 2;
        }

        function makePoint(x, y) {
            return {
                "x": x,
                "y": y,
                "translate": function translate(dX, dY) {
                    return makePoint(x + dX, y + dY);
                }
            };
        }

        function absolute(element, pt) {
            while (element) {
                pt = pt.translate(element.offsetLeft, element.offsetTop);
                element = element.offsetParent;
            }
            return pt;
        }

        let target = absolute(this, makePoint(0, 0)),
            extent = makePoint(this.offsetWidth, this.offsetHeight),
            elem = this.parentNode,
            origin;

        while (elem instanceof HTMLElement) {
            // Apply desired scroll amount.
            origin = absolute(elem, makePoint(elem.clientLeft, elem.clientTop));
            elem.scrollLeft = coverRange(
                makeRange(target.x - origin.x, extent.x),
                makeRange(elem.scrollLeft, elem.clientWidth)
            );
            elem.scrollTop = coverRange(
                makeRange(target.y - origin.y, extent.y),
                makeRange(elem.scrollTop, elem.clientHeight)
            );

            // Determine actual scroll amount by reading back scroll properties.
            target = target.translate(-elem.scrollLeft, -elem.scrollTop);
            elem = elem.parentNode;
        }
    };
}

var TS_MATERIALIZED_ATTR_INITIALIZED = "ts-initialized";
(function() {
    if (!window.materializetool) window.materializetool = function($) {
        const MaterializeTool = {
            sessionTimeoutWarnLeadTimeInMillis: 60000,
            sessionTimerHandler: null,
            sessionTimeoutDialogName: null,
            sessionTimeoutDialogClass: "modal-tiny",
            sessionTimeoutDialogDismissable: true,
            showSessionTimer: false,
            requestTimerHandler: null,
            requestTimerInterval: 1000,
            showRequestTimer: false,
            showToastsOnAjaxError: true,
            updateSessionTimerClockHandler: null,
            beginRequestTimestamp: null,
            lastRequestTimestamp: null,
            scrollTop: null,
            scrollPositions: [],
            debug: false,
            enableTraceModalStatus: false,
            useModalStatusOnAjaxRequest: true,
            redirectOnAjaxErrorPage: null,
            redirectOnAjaxExpiredPage: null,
            modalStatusOnAjaxRequestTimeoutHandler: null,
            modalStatusOnAjaxRequestTimeout: 0,
            windowResizeTimeoutHandler: null,
            tables: {},
            editors: {},
            preferences: {},
            oncompleteFunctions: {},
            useJavaPreferences: true,
            jsfRequestStatus: null,
            webSocketQueue: [],
            webSocketCallbacks: [],
            escapeHelperElement: document.createElement('textarea')
        };

        MaterializeTool.createXPathFromElement = function (element) {
            let allNodes = document.getElementsByTagName('*');
            let segs = [];

            if (element instanceof jQuery) {
                if (element.length === 0) {
                    return;
                }
                element = element.get(0);
            }

            if (($(element).is(document))) {
                return 'document';
            }

            if (($(element).is(window))) {
                return 'window';
            }

            for (; element && element.nodeType == 1; element = element.parentNode) {
                if (element.hasAttribute('preference-id')) {
                    let uniqueIdCount = 0;
                    for (let n = 0; n < allNodes.length; n++) {
                        let node = allNodes[n];
                        if (node.hasAttribute('preference-id') && node.getAttribute("preference-id") == element.getAttribute("preference-id")) {
                            uniqueIdCount++;
                        }
                        if (uniqueIdCount > 1) {
                            break;
                        }
                    }

                    if (uniqueIdCount == 1) {
                        segs.unshift('preference-id("' + element.getAttribute('preference-id') + '")');
                        return segs.join('/');
                    } else {
                        segs.unshift(element.localName.toLowerCase() + '[@preference-id="' + element.getAttribute('preference-id') + '"]');
                    }
                } else if (element.hasAttribute('id')) {
                    let uniqueIdCount = 0;
                    for (let n = 0; n < allNodes.length; n++) {
                        let node = allNodes[n];
                        if (node.hasAttribute('id') && node.id == element.id) {
                            uniqueIdCount++;
                        }
                        if (uniqueIdCount > 1) {
                            break;
                        }
                    }

                    if (uniqueIdCount == 1) {
                        segs.unshift('id("' + element.getAttribute('id') + '")');
                        return segs.join('/');
                    } else {
                        segs.unshift(element.localName.toLowerCase() + '[@id="' + element.getAttribute('id') + '"]');
                    }
                } else if (element.hasAttribute('class')) {
                    segs.unshift(element.localName.toLowerCase() + '[@class="' + element.getAttribute('class') + '"]');
                } else {
                    let i = 1;
                    for (let sib = element.previousSibling; sib; sib = sib.previousSibling) {
                        if (sib.localName == element.localName) {
                            i++;
                        }
                    }
                    segs.unshift(element.localName.toLowerCase() + '[' + i + ']');
                }
            }
            return segs.length ? '/' + segs.join('/') : null;
        };

        MaterializeTool.lookupElementByXPath = function (path) {
            if (path == 'document') {
                return document;
            }

            if (path == 'window') {
                return window;
            }

            let evaluator = new XPathEvaluator();
            let result = evaluator.evaluate(path, document.documentElement, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
            return result.singleNodeValue;
        };

        MaterializeTool.escapejsfid = function (id) {
            if (typeof (jsf) !== 'undefined' && jsf.separatorchar && id) {
                id = id.replace(new RegExp(jsf.separatorchar, 'g'), '\\' + jsf.separatorchar);
            }

            return id;
        };

        MaterializeTool.onAjaxError = function (data) {
            console.log("ajax error");
            console.log(data);
            let redirected = false;

            materializetool.jsfRequestStatus = null;
            materializetool.processWebSocketQueue();

            if (materializetool.useModalStatusOnAjaxRequest) {
                if (materializetool.modalStatusOnAjaxRequestTimeoutHandler != null) {
                    clearTimeout(materializetool.modalStatusOnAjaxRequestTimeoutHandler);
                    materializetool.modalStatusOnAjaxRequestTimeoutHandler = null;
                }
                materializetool.hideModalStatus();
            }

            if (materializetool.redirectOnAjaxErrorPage || materializetool.redirectOnAjaxExpiredPage) {
                let url;
                if (typeof (baseURL) !== 'undefined') {
                    url = baseURL + "/";
                } else {
                    url = "";
                }

                if (materializetool.redirectOnAjaxExpiredPage &&
                    materializetool.lastRequestTimestamp != null &&
                    ((new Date()) - materializetool.lastRequestTimestamp) > materializetool.getSessionTimeoutInMilliseconds(true)) {
                    url += materializetool.redirectOnAjaxExpiredPage;
                } else if (materializetool.redirectOnAjaxErrorPage) {
                    url += materializetool.redirectOnAjaxErrorPage;
                } else {
                    url = null;
                }

                if (url) {
                    window.location.replace(url);
                    redirected = true;
                }
            }

            if (!redirected) {
                let message = "!";

                try {
                    message = "AJAX error: " + JSON.stringify(data, 2);
                } catch (e) {
                    let reducedData = $.extend(true, {}, data);
                    reducedData.source = "removed due to cyclic object error";
                    message = "AJAX error: " + JSON.stringify(reducedData, 2);
                }

                if (toastHandler && materializetool.showToastsOnAjaxError) {
                    toastHandler.openError("!");
                }
                console.error(message);
            }
        };

        MaterializeTool.init = function () {
            // patch materialize functions
            // tooltip positioning
            let origTooltip_positionTooltip = M.Tooltip.prototype._positionTooltip;
            M.Tooltip.prototype._positionTooltip = function () {
                if (this.options != null && this.options.nearMouse && this.options.mouseEvent != null) {
                    let tooltip = this.tooltipEl;
                    let my;
                    let offset = this.options.offset == null ? 25 : this.options.offset;
                    if (this.options.position == 'top') {
                        my = 'bottom-' + offset;
                    } else if (this.options.position == 'right') {
                        my = 'left+' + offset;
                    } else if (this.options.position == 'left') {
                        my = 'right-' + offset;
                    } else {
                        my = 'top+' + offset;
                    }

                    $(tooltip).position({
                        my: my,
                        of: this.options.mouseEvent,
                        collision: 'fit'
                    });
                } else {
                    origTooltip_positionTooltip.call(this);
                }
            };

            $(document).ready(function () {
                if (materializetool.debug) console.log("add jsf ajax callback");

                materializetool.lastRequestTimestamp = new Date();

                jsf.ajax.addOnError(materializetool.onAjaxError);

                jsf.ajax.addOnEvent(function (data) {
                    let $source = $(data.source);

                    materializetool.jsfRequestStatus = data.status;

                    if (materializetool.debug) {
                        console.log("jsf ajax event: " + data.status);
                        console.log($source);
                    }

                    if ($source.attr('disable-update') == 'true') {
                        if (data.status == 'success') {
                            materializetool.updateSessionTimer();
                            materializetool.processWebSocketQueue();
                            materializetool.jsfRequestStatus = null;
                        }
                        return;
                    }

                    try {
                        switch (data.status) {
                            case "begin":
                                if (materializetool.debug) console.log("begin ajax request");

                                materializetool.beginRequestTimestamp = new Date();

                                if ($source.attr('keep-position') == 'true') {
                                    materializetool.scrollPositions = materializetool.evalScrollPositions($source);
                                }

                                // unset ts-validation-failed attribute on all elements (has to be set in response if required)
                                $('[ts-validation-failed]').attr('ts-validation-failed', null);

                                if (!materializetool.useModalStatusOnAjaxRequest && (!$("body").css("cursor") || $("body").css("cursor") == "auto")) {
                                    $("body").css("cursor", "wait");
                                }

                                let t2 = performance.now();
                                if (materializetool.debug) console.log("perf ajax begin: " + (t2 - t1 + "ms"));

                                materializetool.scrollTop = $(document).scrollTop();

                                materializetool.deinitDatepickers();

                                if (materializetool.useModalStatusOnAjaxRequest && $source.attr('disable-status') != 'true') {
                                    if (materializetool.modalStatusOnAjaxRequestTimeout > 0) {
                                        if (materializetool.modalStatusOnAjaxRequestTimeoutHandler != null) {
                                            clearTimeout(materializetool.modalStatusOnAjaxRequestTimeoutHandler);
                                        }
                                        materializetool.modalStatusOnAjaxRequestTimeoutHandler = setTimeout(function () {
                                            materializetool.showModalStatus();
                                            materializetool.modalStatusOnAjaxRequestTimeoutHandler = null;
                                        }, materializetool.modalStatusOnAjaxRequestTimeout);
                                    } else {
                                        materializetool.showModalStatus();
                                    }
                                }

                                // $("#tsJsPreferences").val(JSON.stringify(materializetool.preferences));
                                break;
                            case "success":
                                if (materializetool.debug) console.log("ajax success");
                                let t3 = performance.now();

                                let beforeSuccessFunction = $source.attr('before-success');
                                if (beforeSuccessFunction != null) {
                                    try {
                                        eval(beforeSuccessFunction);
                                    } catch (e) {
                                        console.log("call to beforeSuccessFunction failed: " + e.message, e);
                                    }
                                }

                                if (materializetool.requestTimerHandler != null) {
                                    clearTimeout(materializetool.requestTimerHandler);
                                    materializetool.requestTimerHandler = null;
                                    materializetool.beginRequestTimestamp = null;
                                }

                                if (materializetool.useModalStatusOnAjaxRequest && $source.attr('disable-status') != 'true') {
                                    if (materializetool.modalStatusOnAjaxRequestTimeoutHandler != null) {
                                        clearTimeout(materializetool.modalStatusOnAjaxRequestTimeoutHandler);
                                        materializetool.modalStatusOnAjaxRequestTimeoutHandler = null;
                                    }
                                    if ($source.attr('keep-modal-status') != 'true') {
                                        materializetool.hideModalStatus();
                                    }
                                }

                                materializetool.initOnLoadAndAjax();

                                let t5 = performance.now();
                                if (materializetool.debug) console.log("perf ajax onLoad: " + (t5 - t3 + "ms"));

                                if (materializetool.scrollTop != null) {
                                    $(document).scrollTop(materializetool.scrollTop);
                                    materializetool.scrollTop = null;
                                }

                                for (let key in materializetool.oncompleteFunctions) {
                                    if (materializetool.oncompleteFunctions.hasOwnProperty(key)) {
                                        let func = materializetool.oncompleteFunctions[key];
                                        if (typeof (func) === 'function') {
                                            func();
                                        }
                                    }
                                }

                                if (!materializetool.useModalStatusOnAjaxRequest && $("body").css("cursor") == "wait") {
                                    $("body").css("cursor", "auto");
                                }
                                let t4 = performance.now();
                                if (materializetool.debug) console.log("perf ajax success: " + (t4 - t3 + "ms"));

                                $('.material-tooltip').css("opacity", 0);

                                if ($source.attr('keep-position') == 'true') {
                                    materializetool.restoreScrollPositions(materializetool.scrollPositions);
                                    materializetool.scrollPositions = [];
                                }

                                let afterSuccessFunction = $source.attr('after-success');
                                if (afterSuccessFunction != null) {
                                    try {
                                        eval(afterSuccessFunction);
                                    } catch (e) {
                                        console.log("call to afterSuccessFunction failed: " + e.message, e);
                                    }
                                }

                                materializetool.updateResponsiveTables();

                                materializetool.processWebSocketQueue();
                                break;
                        }
                    } catch (e) {
                        console.warn("ajax callback failed: " + e.message,e);
                    }

                    if (data.status == 'success') {
                        materializetool.jsfRequestStatus = null;
                    }
                });

                materializetool.initOnLoadAndAjax();
                materializetool.initAutocompleteAdditionalEvents();
                materializetool.delayedUpdateResponsiveTables();

                // click on label focuses corresponding input element and scrolls into view
                $(document).on("click.focusel", "label[for]", materializetool.focusForElement);

                $(document).on("click.unset", "input[type=radio] ~ label[for]", function (event) {
                    let forId = $(this).attr("for");
                    let $inputElement = $("#" + materializetool.escapejsfid(forId));
                    if (event.ctrlKey || event.metaKey || event.shiftKey || $inputElement.prop('checked')) {
                        $inputElement.prop('checked', false);
                        // trigger valueChange listener for jsf radio buttons
                        if ($inputElement.length > 0 && typeof ($inputElement[0].onclick) === 'function') {
                            $inputElement[0].onclick.call($inputElement[0], event);
                        }
                        event.stopPropagation();
                        return false;
                    }
                });

                // event handler to prevent writing and pasting into date/timepicker fields
                $('body').on('paste keydown', '.datepicker, .timepicker', function (event) {
                    if (event.key !== "Tab") {
                        event.preventDefault();
                    }
                });

                $('body').on('click.sellabel', '.input-field > label:not(.browser-default)', function (event) {
                    let $label = $(this);
                    let $input = $label.parent().find("> .select-wrapper >input.select-dropdown.dropdown-trigger");
                    if ($input.length > 0) {
                        $input.click();
                        event.preventDefault();
                        event.stopPropagation();
                    }
                });

                $(window).resize(function () {
                    materializetool.delayedUpdateResponsiveTables();
                });

                // sticky header observer
                let observer = new IntersectionObserver(function (entries) {
                    for (let eidx = 0; eidx < entries.length; eidx++) {
                        let entry = entries[eidx];
                        if (entry != null) {
                            if (entry.isIntersecting) {
                                $(entry.target).removeClass("sticky-stuck");
                            } else {
                                $(entry.target).addClass("sticky-stuck");
                            }
                        }
                    }
                }, {rootMargin: "-65px 0px 0px 0px", threshold: 1});
                let observerElements = document.querySelector(".sticky-header64 > thead > tr");
                if (observerElements != null) {
                    observer.observe(observerElements);
                }
            });
        };

        MaterializeTool.initOnLoadAndAjax = function () {
            // console.log("initOnLoadAndAjax")
            let t1 = performance.now();
            materializetool.initTables();
            let t2 = performance.now();
            M.updateTextFields();
            let t3 = performance.now();
            $("textarea.autoresize:visible").each(function (index, textAreaElement) {
                M.textareaAutoResize(textAreaElement);
            });
            let t4 = performance.now();
            materializetool.updateSessionTimer();
            let t5 = performance.now();
            materializetool.initSelect();
            let t6 = performance.now();
            materializetool.initDropdown();
            let t7 = performance.now();
            if (typeof collapsibleHandler !== "undefined") {
                collapsibleHandler.initializeCollapsibles();
            }
            let t8 = performance.now();
            materializetool.initDatepickers();
            let t9 = performance.now();
            materializetool.initAutocompletes();
            let t10 = performance.now();
            materializetool.initFloatingActionButtons();
            let t11 = performance.now();
            materializetool.initEditors();
            materializetool.updateAllEditorCharCounters();
            let t12 = performance.now();
            materializetool.initDualSelectLists();
            let t13 = performance.now();
            if (typeof (navbarhandler) !== "undefined") {
                navbarhandler.init();
            }
            let t14 = performance.now();
            if (typeof (globalTooltipHandler) !== "undefined") {
                globalTooltipHandler.initializeHandler();
            }
            let t15 = performance.now();
            materializetool.initTimepickers();
            let t16 = performance.now();
            materializetool.initOverlayPanels();
            let t17 = performance.now();
            if (typeof (chatTool) !== 'undefined') {
                chatTool.initializeChat();
            }
            let t18 = performance.now();

            if (typeof (toastHandler) !== "undefined") {
                toastHandler.initialize();
            }

            let t19 = performance.now();

            materializetool.prepareForms();

            let t20 = performance.now();

            if (typeof (inlineTagEdit) !== "undefined") {
                inlineTagEdit.updateChips();
            }

            let t21 = performance.now();

            if (typeof (codeeditortool) !== "undefined") {
                codeeditortool.initCodeEditors();
            }

            let t22 = performance.now();

            if (materializetool.debug) {
                console.log("perf onLoad updateTextFields:          " + (t2 - t1) + "ms");
                console.log("perf onLoad textareaAutoResize:        " + (t3 - t2) + "ms");
                console.log("perf onLoad updateSessionTimer:        " + (t4 - t3) + "ms");
                console.log("perf onLoad initSelect:                " + (t5 - t4) + "ms");
                console.log("perf onLoad initDropDown:              " + (t6 - t5) + "ms");
                console.log("perf onLoad initCollapsible:           " + (t7 - t6) + "ms");
                console.log("perf onLoad initTables:                " + (t8 - t7) + "ms");
                console.log("perf onLoad initDatepickers:           " + (t9 - t8) + "ms");
                console.log("perf onLoad initAutocompletes:         " + (t10 - t9) + "ms");
                console.log("perf onLoad initFloatingActionButtons: " + (t11 - t10) + "ms");
                console.log("perf onLoad initEditors:               " + (t12 - t11) + "ms");
                console.log("perf onLoad initDualSelectLists:       " + (t13 - t12) + "ms");
                console.log("perf onLoad initnavbar:                " + (t14 - t13) + "ms");
                console.log("perf onLoad inithandlers:              " + (t15 - t14) + "ms");
                console.log("perf onLoad initTimepickers:           " + (t16 - t15) + "ms");
                console.log("perf onLoad initOverlayPanels:         " + (t17 - t16) + "ms");
                console.log("perf onLoad initializeChat :           " + (t18 - t17) + "ms");
                console.log("perf onLoad initializeToast :          " + (t19 - t18) + "ms");
                console.log("perf onLoad prepareForms :             " + (t20 - t19) + "ms");
                console.log("perf onLoad updating tag chips :       " + (t21 - t20) + "ms");
                console.log("perf onLoad updating codemirror        " + (t22 - t21) + "ms");
                console.log("perf onLoad overall:                   " + (t22 - t1) + "ms");
            }
        };

        /**
         * tsAutoCompleteDisablement === true: Standardmäßig wird der Autocomplete bei allen Forms deaktiviert, außer sie besitzen die dazugehörige Klasse
         * tsAutoCompleteDisablement === false: Standardmäßig wird der Autocomplete bei allen Forms aktiviert, außer sie besitzen die dazugehörige Klasse
         */
        MaterializeTool.prepareForms = function () {
            if (typeof (tsAutoCompleteDisablement) !== "undefined") {
                let autocompleteDisabled = tsAutoCompleteDisablement;

                let $forms = $("form");

                if ($forms.length) {
                    $forms.toArray().forEach(form => {
                        let $form = $(form);
                        let hasClass = $form.hasClass("ts-autocomplete-disablement");

                        if (autocompleteDisabled && !hasClass || !autocompleteDisabled && hasClass) {
                            $form.attr("autocomplete", "off");
                        }
                    })
                }
            }
        }

        MaterializeTool.showModalStatus = function () {
            let $modalStatus = $("#modalstatus");
            if ($modalStatus.length > 0 && !$modalStatus.is(":visible")) {
                if (materializetool.enableTraceModalStatus) {
                    console.trace("showModalStatus");
                }

                let $modalStatusRequestTimerContainer = $modalStatus.find("#modalstatus-requesttimer");
                $modalStatusRequestTimerContainer.text("");
                $modalStatus.show();
                if (materializetool.showRequestTimer) {
                    if (materializetool.requestTimerHandler != null) {
                        clearTimeout(materializetool.requestTimerHandler);
                    }
                    if (materializetool.beginRequestTimestamp == null) {
                        materializetool.beginRequestTimestamp = new Date();
                    }
                    materializetool.requestTimerHandler = setTimeout(materializetool.updateModalStatusRequestTimer,
                        materializetool.requestTimerInterval);
                }
            } else {
                if ($modalStatus.length === 0) {
                    console.warn("modalstatus panel not found");
                }
            }
        };

        MaterializeTool.hideModalStatus = function () {
            let $modalStatus = $("#modalstatus");
            if ($modalStatus.length > 0) {
                if (materializetool.enableTraceModalStatus) {
                    console.trace("hideModalStatus");
                }

                if (materializetool.modalStatusOnAjaxRequestTimeoutHandler != null) {
                    clearTimeout(materializetool.modalStatusOnAjaxRequestTimeoutHandler);
                }
                if (materializetool.requestTimerHandler != null) {
                    clearTimeout(materializetool.requestTimerHandler);
                    materializetool.requestTimerHandler = null;
                }
                $modalStatus.hide();
            } else {
                console.warn("modalstatus panel not found");
            }
        };

        MaterializeTool.updateModalStatusRequestTimer = function () {
            let $modalStatusRequestTimerContainer = $("#modalstatus-requesttimer:visible");
            if ($modalStatusRequestTimerContainer.length > 0) {
                if (materializetool.showRequestTimer && materializetool.beginRequestTimestamp != null) {
                    let now = new Date();
                    let requestTime = now - materializetool.beginRequestTimestamp;
                    let requestTimeMessage = "(" + Math.floor(requestTime / 1000) + "s)";
                    $modalStatusRequestTimerContainer.text(requestTimeMessage);
                    materializetool.requestTimerHandler = setTimeout(materializetool.updateModalStatusRequestTimer, materializetool.requestTimerInterval);
                }
            }
        };

        MaterializeTool.getFunctionReferenceFromString = function (functionName) {
            let functionReference = null;

            if (functionName != null) {
                let parts = functionName.split(".");
                let container = window;
                for (let pidx = 0; pidx < (parts.length - 1); pidx++) {
                    let part = parts[pidx];
                    container = container[part];
                    if (container == null) {
                        break;
                    }
                }
                if (container != null) {
                    let func = container[parts[parts.length - 1]];
                    if (typeof (func) === 'function') {
                        functionReference = func;
                    }
                }
            }

            return functionReference;
        };

        MaterializeTool.parseCustomOptions = function (customOptionsStr) {
            let customOptions = null;
            try {
                if (customOptionsStr) {
                    customOptionsStr = customOptionsStr
                        .replace(/(['"])?([\w]+)(['"])?[ ]*:([^:])/g, '"$2": $4')
                        .replace(/__quot__/g, '"')
                        .replace(/'/g, '"')
                        .replace(/::/g, ':');
                    customOptions = JSON.parse(customOptionsStr);

                    let replaceFunctions = function (root) {
                        for (let key in root) {
                            if (root.hasOwnProperty(key)) {
                                let value = root[key];
                                if (typeof (value) === "string") {
                                    let functionRegex = /^\/(callFunction|Function)\(([^)]+)\)\/$/g;
                                    let regexResult = functionRegex.exec(value);
                                    if (regexResult != null && regexResult.length === 3) {
                                        let func = materializetool.getFunctionReferenceFromString(regexResult[2]);
                                        if (func != null) {
                                            root[key] = func;
                                        }
                                    } else {
                                        let evalRegex = /^\/(eval)\(([^)]+)\)\/$/g;
                                        let regexResult2 = evalRegex.exec(value);
                                        if (regexResult2 != null && regexResult2.length === 3) {
                                            root[key] = eval(regexResult2[2]);
                                        }
                                    }
                                } else if (typeof (value) === 'object') {
                                    replaceFunctions(value);
                                }
                            }
                        }
                    }

                    if (materializetool.debug) console.log("custom options: " + customOptionsStr);
                    replaceFunctions(customOptions);
                    if (materializetool.debug) console.log(customOptions);
                }
            } catch (e) {
                console.warn("cannot parse custom options");
            }

            return customOptions;
        };

        MaterializeTool.evalScrollPositions = function ($element) {
            let positions = [];
            if ($element) {
                $element = $element.closest(":visible");
                let boundingBox = $element[0].getBoundingClientRect();
                let entry = {
                    isParent: false,
                    xpath: materializetool.createXPathFromElement($element),
                    scrollTop: boundingBox.top,
                    scrollLeft: boundingBox.left
                };
                positions.push(entry);

                let $scrollParent = $element;
                do {
                    $scrollParent = $scrollParent.scrollParent();
                    let entry = {
                        isParent: true,
                        xpath: materializetool.createXPathFromElement($scrollParent),
                        scrollTop: $scrollParent.scrollTop(),
                        scrollLeft: $scrollParent.scrollLeft()
                    };
                    positions.push(entry);
                } while (!$scrollParent.is(document));
            }
            return positions;
        };

        MaterializeTool.restoreScrollPositions = function (positions) {
            if ($.isArray(positions) && positions.length > 0) {
                let entry = positions[0];
                if (!entry.isParent) {
                    let $element = $(materializetool.lookupElementByXPath(entry.xpath));
                    if ($element.length > 0) {
                        materializetool.scrollToViewPortOffset($element, entry.scrollTop);
                    }
                } else {
                    for (entry of positions) {
                        if (entry != null) {
                            let $element = $(materializetool.lookupElementByXPath(entry.xpath));
                            if ($.isNumeric(entry.scrollTop)) {
                                $element.scrollTop(entry.scrollTop);
                            }
                            if ($.isNumeric(entry.scrollLeft)) {
                                $element.scrollLeft(entry.scrollLeft);
                            }
                        }
                    }
                }
            }
        };

        MaterializeTool.initTables = function(selector, force) {
            if (selector == null) {
                selector = "table.ts-datatable";
            }

            let $dataTables = $(selector);
            $dataTables.each(function(index, tableElement) {
                let $table = $(tableElement);

                let tableSelector = $table.attr("datatable-selector");
                if (tableSelector == null && $table.attr("id")) {
                    tableSelector = "#" + $table.attr("id");
                }

                if (materializetool.debug) console.log("init datatable " + tableSelector);

                let customOptionsStr = $table.attr("datatable-custom-options");
                let customOptions = materializetool.parseCustomOptions(customOptionsStr);

                let customButtonsStr = $table.attr("datatable-custom-buttons");
                let customButtons = materializetool.parseCustomOptions(customButtonsStr);

                materializetool.initTable(tableSelector, customOptions, customButtons, force);
            });
        };

        MaterializeTool.initTable = function(tableSelector, customOptions, customButtons, force) {
            let $table = $(tableSelector);
            let tableSettings = materializetool.tables[tableSelector];

            if ($table.attr(TS_MATERIALIZED_ATTR_INITIALIZED) && tableSettings && !force) {
                if ($table.hasClass("enable-autorefresh")) {
                    if (materializetool.debug) console.log("redraw generic table " + tableSelector);
                    tableSettings.table.rows().invalidate().draw(false);
                }
            } else {
                if (tableSettings != null && tableSettings.table != null) {
                    let $tableWrapper = $(materializetool.escapejsfid('#' + $table.attr("id") + '_wrapper'));
                    if ($tableWrapper.length > 0) {
                        $table.insertBefore($tableWrapper);
                        $tableWrapper.remove();
                    }
                    // if (typeof(tableSettings.table.destroy) === 'function') {
                    //     tableSettings.table.destroy();
                    // }
                }
                delete materializetool.tables[tableSelector];

                if (materializetool.debug) console.log("init generic table " + tableSelector);
                tableSettings = new GenericDataTable(tableSelector, customOptions, customButtons);
                materializetool.tables[tableSelector] = tableSettings;
                $table.attr(TS_MATERIALIZED_ATTR_INITIALIZED, "true");

                $table.find("[ts-rerender]").each(function(index, element) {
                    let $element = $(element);
                    if (!$element.parent().hasClass("dtr-data")) {
                        $element.attr(TS_MATERIALIZED_ATTR_INITIALIZED, "true");
                    }
                });
            }
        };

        MaterializeTool.markTableDirty = function(tableSelector) {
            let tableSettings = materializetool.tables[tableSelector];
            if (tableSettings != null) {
                tableSettings.markDirty(true);
            }
        };

        MaterializeTool.delayedUpdateResponsiveTables = function(timeout) {
            $(".dt-searchfield-and-buttons").css("width","");
            if (timeout == null) {
                timeout = 500;
            }
            if (materializetool.windowResizeTimeoutHandler != null) {
                clearTimeout(materializetool.windowResizeTimeoutHandler);
            }
            materializetool.windowResizeTimeoutHandler = setTimeout(function() {
                materializetool.windowResizeTimeoutHandler = null;
                materializetool.updateResponsiveTables();
            }, timeout);
        };

        MaterializeTool.updateResponsiveTables = function() {
            for (let tableKey in materializetool.tables) {
                if (materializetool.tables.hasOwnProperty(tableKey)) {
                    let tableSettings = materializetool.tables[tableKey];
                    if (tableSettings != null && tableSettings.table != null) {
                        tableSettings.table.columns.adjust().responsive.recalc();

                        let tableWidth = tableSettings.$tableElement.width();
                        let $wrapper = $(tableSettings.table.table().container());
                        $wrapper.children(".dt-searchfield-and-buttons").width(tableWidth);
                        let additionalTableWidthElementsSelector = tableSettings.$tableElement.attr("datatable-width-adjust-selector");
                        if (additionalTableWidthElementsSelector) {
                            let additionalTableWidthElements = $(additionalTableWidthElementsSelector)
                            additionalTableWidthElements.each(function() {
                                $(this).width(tableWidth);

                            });
                        }
                    }

                    materializetool.recognizeLastElementsInTable(tableSettings.$tableElement);
                }
            }
        };

        MaterializeTool.initSelect = function() {
            $('select:not(:data(uiSelectmenu),.no-materialize)').each(function(index, selectElement) {
                materializetool.initSelectElement(selectElement);
            });
        };

        MaterializeTool.initSelectElement = function(selectElement) {
            if (typeof(selectElement) !== "undefined") {
                let $selectElement = $(selectElement);

                if ($selectElement.length) {
                    if (!$selectElement.attr(TS_MATERIALIZED_ATTR_INITIALIZED)) {
                        let defaultOptions = {
                            dropdownOptions: {
                                coverTrigger: false,
                                container: document.body
                            }
                        };

                        let customOptionsStr = $selectElement.attr("select-custom-options");
                        let customOptions = materializetool.parseCustomOptions(customOptionsStr);

                        let options = $.extend(true, {},
                            defaultOptions,
                            customOptions
                        );

                        M.FormSelect.init($selectElement, options);

                        $selectElement.attr(TS_MATERIALIZED_ATTR_INITIALIZED, "true");

                        materializetool.toggleSelectLabel(selectElement);

                        $selectElement.on('change', function(event) {
                            materializetool.toggleSelectLabel(this);
                        });
                    }

                    if ($selectElement.hasClass("invalid")) {
                        let $dropDownTrigger = $selectElement.closest(".select-wrapper").find(".dropdown-trigger");
                        $dropDownTrigger.addClass("invalid");
                    }
                }
            }
        }

        MaterializeTool.initDropdown = function() {
            $('.dropdown-trigger:not(.select-dropdown)').each(function(index, dropDownTriggerElement) {
                let $dropDownTrigger = $(dropDownTriggerElement);
                if (!$dropDownTrigger.attr(TS_MATERIALIZED_ATTR_INITIALIZED)) {
                    let defaultOptions = {
                        coverTrigger: false
                    };

                    let customOptionsStr = $dropDownTrigger.attr("dropdown-custom-options");
                    let customOptions = materializetool.parseCustomOptions(customOptionsStr);
                    let options = $.extend(true, {},
                        defaultOptions,
                        customOptions
                    );
                    M.Dropdown.init($dropDownTrigger, options);
                    $dropDownTrigger.attr(TS_MATERIALIZED_ATTR_INITIALIZED, "true");
                }
            });
        };

        MaterializeTool.initSidenavs = function(selector) {
            if (selector == null) {
                selector = ".sidenav";
            }

            let $sidenavs = $(selector);
            $sidenavs.each(function(index, sidenavElement) {
                let $sidenav = $(sidenavElement);
                if (materializetool.debug) console.log("init sidenav " + materializetool.createXPathFromElement(sidenavElement));

                let customOptionsStr = $sidenav.attr("sidenav-custom-options");
                let customOptions = materializetool.parseCustomOptions(customOptionsStr);

                materializetool.initSidenav($sidenav, customOptions);
            });
        };

        MaterializeTool.initSidenav = function(selector, customOptions) {
            if (materializetool.debug) console.log("init sidenav ", selector);

            const $sidenav = $(selector);
            let instance = M.Sidenav.getInstance($sidenav);

            if ($sidenav.attr(TS_MATERIALIZED_ATTR_INITIALIZED) && instance) {
                return instance;
            }

            let defaultOptions = {};

            let options = $.extend(true, {},
                defaultOptions,
                customOptions
            );

            return M.Sidenav.init($sidenav, options);
        };

        MaterializeTool.deinitDatepickers = function(selector) {
            if (!selector) {
                selector = ".datepicker";
            }

            let $datepickers = $(selector);
            $datepickers.each(function(index, datePickerElement) {
                let $datepicker = $(datePickerElement);
                let instance = M.Datepicker.getInstance($datepicker);
                if (instance != null) {
                    instance.destroy();
                }
            });
        };

        MaterializeTool.initDatepickers = function(selector) {
            if (!selector) {
                selector = ".datepicker";
            }

            if (!materializetool.datepickerOptions) {
                let options = {
                    format: "yyyy-mm-dd",
                    firstDay: 1,
                    showMonthAfterYear: false,
                    showClearBtn: true,
                    onDraw: function(instance) {
                        if (instance.options.format == "yyyy") {
                            $(instance.$modalEl).addClass("year-only");
                        } else if (instance.options.format == "mm/yyyy") {
                            $(instance.$modalEl).addClass("month-only");
                        }

                        let datePickerControls = $(instance.$modalEl).find(".datepicker-controls");
                        if (!instance.updating) {
                            let monthSelector = datePickerControls.find(".select-month .datepicker-select");
                            let month = monthSelector.val();
                            let yearSelector = datePickerControls.find(".select-year .datepicker-select");
                            let year = yearSelector.val();
                            let selectedDateStr = instance.toString() || "";
                            let selectedDate = tsLocale.parseDate(selectedDateStr, instance.options.origFormat);

                            let updateDatePicker = function(selectedDate) {
                                setTimeout(function() {
                                    // update datepicker date asynchronously because it triggers a redraw itself
                                    instance.updating = true;
                                    instance.setDate(selectedDate);
                                    instance.updating = false;
                                }, 1);
                            }

                            if (selectedDate == null) {
                                // choose current date if no date has been set before
                                selectedDate = new Date();
                                updateDatePicker(selectedDate);
                            } else if (instance.options.format === 'yyyy' && year != null) {
                                selectedDate.setFullYear(year);
                                updateDatePicker(selectedDate);
                            } else if (month != null && year != null) {
                                // select valid date on month/year change
                                if (month != selectedDate.getMonth() || year != selectedDate.getFullYear()) {
                                    selectedDate.setMonth(month);
                                    selectedDate.setFullYear(year);
                                    updateDatePicker(selectedDate);
                                }
                           }
                        }
                    }
                };

                if (typeof(tsLocale) !== 'undefined' && typeof(tsLocale.globalizer) !== 'undefined' &&
                    typeof(tsLocale.globalizer.cldr) !== 'undefined' && typeof(tsLocale.globalizer.cldr.main) === 'function') {
                    let datepickerI18N = {
                        months: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', ' Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
                        monthsShort: ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
                        weekdays: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
                        weekdaysShort: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
                        weekdaysAbbrev: ['S', 'M', 'T', 'W', 'T', 'F', 'S']
                    };

                    let months = tsLocale.globalizer.cldr.main(["dates/calendars/gregorian/months", "stand-alone"]);
                    if (months != null) {
                        if (typeof(months.wide) !== 'undefined') {
                            datepickerI18N.months = [];
                            for (let i in months.wide) {
                                if (months.wide.hasOwnProperty(i)) {
                                    datepickerI18N.months.push(months.wide[i]);
                                }
                            }
                        }

                        if (typeof(months.abbreviated) !== 'undefined') {
                            datepickerI18N.monthsShort = [];
                            for (let i in months.abbreviated) {
                                if (months.abbreviated.hasOwnProperty(i)) {
                                    datepickerI18N.monthsShort.push(months.abbreviated[i]);
                                }
                            }
                        }
                    }

                    let days = tsLocale.globalizer.cldr.main(["dates/calendars/gregorian/days", "stand-alone"]);
                    if (days != null) {
                        if (typeof(days.wide) !== 'undefined') {
                            datepickerI18N.weekdays = [];
                            for (let i in days.wide) {
                                if (days.wide.hasOwnProperty(i)) {
                                    datepickerI18N.weekdays.push(days.wide[i]);
                                }
                            }
                        }

                        if (typeof(days.abbreviated) !== 'undefined') {
                            datepickerI18N.weekdaysShort = [];
                            for (let i in days.abbreviated) {
                                if (days.abbreviated.hasOwnProperty(i)) {
                                    datepickerI18N.weekdaysShort.push(days.abbreviated[i]);
                                }
                            }
                        }

                        if (typeof(days.narrow) !== 'undefined') {
                            datepickerI18N.weekdaysAbbrev = [];
                            for (let i in days.narrow) {
                                if (days.narrow.hasOwnProperty(i)) {
                                    datepickerI18N.weekdaysAbbrev.push(days.narrow[i]);
                                }
                            }
                        }
                    }

                    if (tsLocale.currentLocale() == "de") {
                        options.format = "dd.MM.yyyy";
                    }
                    // let dateFormats = tsLocale.globalizer.cldr.main(["dates/calendars/gregorian/dateFormats"]);
                    // if (dateFormats != null && dateFormats.short != null) {
                    //     options.format = dateFormats.short.toLowerCase();
                    // }

                    if (typeof(tsLocale.globalizer.cldr.supplemental) !== 'undefined') {
                        let firstDayAbbr = tsLocale.globalizer.cldr.supplemental.weekData.firstDay();
                        switch (firstDayAbbr) {
                            case 'sun':
                                options.firstDay = 0;
                                break;
                            case 'mon':
                                options.firstDay = 1;
                                break;
                            case 'tue':
                                options.firstDay = 2;
                                break;
                            case 'wed':
                                options.firstDay = 3;
                                break;
                            case 'thu':
                                options.firstDay = 4;
                                break;
                            case 'fri':
                                options.firstDay = 5;
                                break;
                            case 'sat':
                                options.firstDay = 6;
                                break;
                            default:
                                break;
                        }
                    }

                    datepickerI18N.cancel = tsMsg("de.techspring.dialog.button.cancel.value");
                    datepickerI18N.clear = tsMsg("de.techspring.dialog.button.delete.value");
                    datepickerI18N.done = tsMsg("de.techspring.dialog.button.confirm.value");

                    options.i18n = datepickerI18N;

                    materializetool.datepickerOptions = options;
                }
            }

            let $datepickers = $(selector);
            $datepickers.each(function(index, datePickerElement) {
                let $datepicker = $(datePickerElement);
                materializetool.initDatepicker($datepicker);
            });
        };

        MaterializeTool.initDatepicker = function(selector) {
            const $datepicker = $(selector);

            let customOptionsStr = $datepicker.attr("datepicker-custom-options");
            let customOptions = materializetool.parseCustomOptions(customOptionsStr);

            let options = $.extend(true, {},
                materializetool.datepickerOptions,
                customOptions
            );

            let instance = M.Datepicker.getInstance($datepicker);
            if (instance != null) {
                instance.destroy();
            }

            if (options.format != null) {
                options.origFormat = options.format;
                options.format = options.format.toLowerCase();
            }

            let instances = M.Datepicker.init($datepicker, options);
            if (instances.length) {
                instance = instances[0];
            }

            let value = $datepicker.val();
            if (value != null) {
                try {
                    let date = tsLocale.parseDate(value, options.origFormat);
                    instance.setDate(date);
                    instance.gotoDate(date);
                } catch (e) {
                    console.log("error parsing date " + value + " with format " + options.origFormat);
                }
            }
        }

        MaterializeTool.initTimepickers = function() {
            const elems = document.querySelectorAll('.timepicker');
            const options = {
                container: 'body',
                twelveHour: false,
                showClearBtn: true,
                i18n: {
                    cancel: tsMsg("de.techspring.dialog.button.cancel.value"),
                    done: tsMsg("de.techspring.dialog.button.confirm.value"),
                    clear: tsMsg("de.techspring.dialog.button.delete.value")
                }
            }

            M.Timepicker.init(elems, options);
        }

        MaterializeTool.initAutocompletes = function(selector) {
            if (selector == null) {
                selector = ".autocomplete";
            }

            let $autoCompletes = $(selector);
            $autoCompletes.each(function(index, autoCompleteElement) {
                let $autoComplete = $(autoCompleteElement);

                if (materializetool.debug) console.log("init autocomplete " + materializetool.createXPathFromElement(autoCompleteElement));

                let customOptionsStr = $autoComplete.attr("autocomplete-custom-options");
                let customOptions = materializetool.parseCustomOptions(customOptionsStr);

                let jsonDataSelector = $autoComplete.attr("autocomplete-json-selector");

                let onCompleteFunctionName = $autoComplete.attr("autocomplete-oncomplete");
                let onCompleteFunction = materializetool.getFunctionReferenceFromString(onCompleteFunctionName);

                materializetool.initAutocomplete($autoComplete, jsonDataSelector, onCompleteFunction, customOptions);

                let $autoCompleteDropdown = $("#" + $autoComplete.attr("data-target"));
                $autoComplete.on("keyup.ac", function(event) {
                    if (event && event.originalEvent) {
                        if (event.originalEvent.key == 'ArrowUp' || event.originalEvent.key == 'ArrowDown') {
                            let $focusedElement = $autoCompleteDropdown.find(".active,:focus");
                            if ($focusedElement.length > 0) {
                                materializetool.scrollIntoViewIfNeeded($focusedElement, false);
                            }
                        }
                    }
                });

                $autoCompleteDropdown.remove();
                $autoCompleteDropdown.appendTo('body');
            });
        };

        MaterializeTool.initAutocomplete = function(autoCompleteSelector, jsonDataSelector, onCompleteFunction, customOptions) {
            if (materializetool.debug) console.log("init autocomplete, json selector ", jsonDataSelector);

            const $autocomplete = $(autoCompleteSelector);
            let instance = M.Autocomplete.getInstance($(autoCompleteSelector));

            if (instance != null) {
                instance.destroy();
                instance = null;
            }
            // if ($autocomplete.attr(TS_MATERIALIZED_ATTR_INITIALIZED)) {
            //     return M.Autocomplete.getInstance($(autoCompleteSelector));
            // }

            let autoCompleteJsonStr = $autocomplete.attr("autocomplete-json-data");
            if (autoCompleteJsonStr == null) {
                autoCompleteJsonStr = $(jsonDataSelector) != null ? $(jsonDataSelector).val() : null;
            }

            if (autoCompleteJsonStr != null) {
                try {
                    let parsedJson = JSON.parse(autoCompleteJsonStr);

                    // set url in autocomplete json structure to null -> otherwise yields to access of non-existing pages and ViewExpiredException
                    // provide original json structure in options as tsData entry (for index evaluation)

                    let autoCompleteJson = {};
                    for (let key in parsedJson) {
                        autoCompleteJson[key] = null;
                    }

                    if (customOptions && customOptions.customItem != null) {
                        autoCompleteJson[customOptions.customItem.name] = null;
                    }

                    //  autoCompleteJson.unshift( "");
                    // if (materializetool.debug) console.log("json", autoCompleteJson);
                    let options = {
                        data: autoCompleteJson,
                        tsData: parsedJson,
                        onAutocomplete: function(val) {
                            let idx = this.options.tsData[val];

                            if (idx != null && onCompleteFunction != null) {
                                onCompleteFunction({ index: idx });
                            } else if (customOptions && customOptions.customItem && val == customOptions.customItem.name) {
                                customOptions.customItem.callback();
                            }
                        },
                        minLength: customOptions && customOptions.minLength ? customOptions.minLength : 0,
                        sortFunction: function(a, b, inputString) {
                            if (inputString) {
                                if (a.startsWith(inputString) && !b.startsWith(inputString)) {
                                    return -1;
                                } else if (!a.startsWith(inputString) && b.startsWith(inputString)) {
                                    return 1;
                                }
                            }
                            return a - b;
                        }
                    };
                    instance = M.Autocomplete.init($autocomplete, options);

                    $autocomplete.attr(TS_MATERIALIZED_ATTR_INITIALIZED, "true");
                } catch (e) {
                    console.warn("catch error in autocomplete init");
                }
            } else {
                console.debug("autocomplete init failed (no json data) for " + materializetool.createXPathFromElement($autocomplete));
            }

            return instance;
        };

        MaterializeTool.initAutocompleteAdditionalEvents = function() {
            $('body').on('keyup', '.autocomplete', function(event) {

                if (event.which === 13) {       // event.which 13 is the enter key
                    const $thisAc = $(this);

                    if ($thisAc.length) {
                        let dataTargetAttr = $thisAc.attr("data-target");

                        if (dataTargetAttr) {
                            let $dataTarget = $("#" + dataTargetAttr);

                            if ($dataTarget.length) {
                                let $activeLi = $($dataTarget).find("li .active");

                                if ($activeLi.length) {
                                    $thisAc.val($activeLi.text().trim())
                                }
                            }
                        } else {
                            console.warn("Autocomplete seems to not be initialized because no data target is available", $thisAc)
                        }

                        $thisAc.blur();
                    } else {
                        console.error("Autocomplete object is undefined", this)
                    }
                }
            });
        };

        MaterializeTool.initFloatingActionButtons = function(selector) {
            if (selector == null) {
                selector = ".fixed-action-btn";
            }

            let floatingActionButtons = $(selector);
            floatingActionButtons.each(function(index, actionButtonElement) {
                let $actionButton = $(actionButtonElement);

                if (materializetool.debug) console.log("init floating action button " + materializetool.createXPathFromElement(actionButtonElement));

                let customOptionsStr = $actionButton.attr("fab-custom-options");
                let customOptions = materializetool.parseCustomOptions(customOptionsStr);

                materializetool.initFloatingActionButton($actionButton, customOptions);
            });
        };

        MaterializeTool.initFloatingActionButton = function(actionButtonSelector, customOptions) {
            if (materializetool.debug) console.log("init floating action buttons");

            const $actionButton = $(actionButtonSelector);
            let instance = M.FloatingActionButton.getInstance($actionButton);

            if (instance != null && $actionButton.attr(TS_MATERIALIZED_ATTR_INITIALIZED)) {
                return instance;
            }

            try {
                let defaultOptions = {
                    direction: 'left',
                    hoverEnabled: false
                };
                let options = $.extend(true, {},
                    defaultOptions,
                    customOptions
                );
                instance = M.FloatingActionButton.init($actionButton, options);

                $actionButton.attr(TS_MATERIALIZED_ATTR_INITIALIZED, "true");
            } catch (e) {
                console.warn("catch error in floating action buttons init");
            }

            return instance;
        };

        MaterializeTool.initOverlayPanels = function(selector) {
            if (selector == null) {
                selector = ".overlay-panel";
            }

            let $overlayPanels = $(selector);
            $overlayPanels.each(function(index, overlayPanelElement) {
                let $overlayPanel = $(overlayPanelElement);
                if (materializetool.debug) console.log("init overlaypanel " + materializetool.createXPathFromElement(overlayPanelElement));

                materializetool.initOverlayPanel($overlayPanel);
            });
        };

        MaterializeTool.initOverlayPanel = function(selector) {
            if (materializetool.debug) console.log("init overlaypanel ", selector);

            const $overlayPanel = $(selector);
            if ($overlayPanel.attr(TS_MATERIALIZED_ATTR_INITIALIZED)) {
                return;
            }

            if ($overlayPanel.hasClass('overlay-panel-resizable')) {
                $overlayPanel.resizable();
            }

            let of = $overlayPanel.attr("overlaypanel-for") || null;
            let onevent = $overlayPanel.attr("overlaypanel-onevent") || null;
            let showevent = $overlayPanel.attr("overlaypanel-showevent") || "click";
            let hideevent = $overlayPanel.attr("overlaypanel-hideevent") || "click";

            if (of != null) {
                of = "[id$='" + of.replace(/:/g, "\\:") + "']";
                let $forElement = $(of);
                if ($forElement.length > 0) {
                    let overlayPanelId = $overlayPanel.attr("id").replace(/:/g, "\\:");
                    $forElement.attr("overlaypanel-selector", "#" + overlayPanelId)
                    if (showevent != null) {
                        $forElement.unbind(showevent + ".overlaypanelshow");
                        $forElement.bind(showevent + ".overlaypanelshow", function(event) {
                            // let $overlayPanel = $($(this).attr("overlaypanel-selector"));
                            if ($overlayPanel.is(":visible")) {
                                if (hideevent == showevent) {
                                    materializetool.hideOverlayPanel(selector);
                                }
                            } else {
                                materializetool.showOverlayPanel(selector);
                            }

                            if (onevent) {
                                try {
                                    eval(onevent);
                                } catch(e) {
                                    log.warn('overlay onevent failed: ' + e.message, e);
                                }
                            }
                        });
                    }
                    if (hideevent != null && hideevent != showevent) {
                        $forElement.unbind(hideevent + ".overlaypanelhide");
                        $forElement.bind(hideevent + ".overlaypanelhide", function(event) {
                            // let $overlayPanel = $($(this).attr("overlaypanel-selector"));
                            if ($overlayPanel.is(":visible")) {
                                materializetool.hideOverlayPanel(selector);
                            }
                            if (onevent) {
                                try {
                                    eval(onevent);
                                } catch(e) {
                                    log.warn('overlay onevent failed: ' + e.message, e);
                                }
                            }
                        });
                    }
                }
            }

            $overlayPanel.attr(TS_MATERIALIZED_ATTR_INITIALIZED, "true");
        };

        MaterializeTool.showOverlayPanel = function(selector) {
            const $overlayPanel = $(selector).closest(".overlay-panel");
            if ($overlayPanel.length === 0) {
                return;
            }

            let my = $overlayPanel.attr("overlaypanel-my") || "left bottom";
            let at = $overlayPanel.attr("overlaypanel-at") || "left top";
            let of = $overlayPanel.attr("overlaypanel-for") || null;
            let showeffect = $overlayPanel.attr("overlaypanel-showeffect") || null;
            let onshow = $overlayPanel.attr("overlaypanel-onshow") || "";

            $overlayPanel.show(showeffect);
            if (of != null) {
                of = "[id$='" + of.replace(/:/g, "\\:") + "']";
                $overlayPanel.position({
                    my: my,
                    at: at,
                    of: of
                });
            }
            if (onshow) {
                eval(onshow);
            }
        };

        MaterializeTool.hideOverlayPanel = function(selector) {
            const $overlayPanel = $(selector).closest(".overlay-panel");
            if ($overlayPanel.length === 0) {
                return;
            }

            let hideeffect = $overlayPanel.attr("overlaypanel-hideeffect") || null;
            let onhide = $overlayPanel.attr("overlaypanel-onhide") || "";

            $overlayPanel.hide(hideeffect);
            if (onhide) {
                eval(onhide);
            }
        };

        MaterializeTool.focusForElement = function(event) {
            if (event == null) {
                return;
            }

            let $label = $(event.target);
            let rawForId = $label.attr("for");
            if (rawForId != null) {
                let forId = rawForId.replace(/:/g, "\\:");
                let $target = $("#" + forId);

                let editor = materializetool.editors[$target.attr("id")];
                if (editor != null && editor.editing != null && editor.editing.view != null && typeof(editor.editing.view.focus) === 'function') {
                    editor.editing.view.focus()
                    materializetool.scrollIntoViewIfNeeded($target, {
                        $container: $target.scrollParent()
                    });
                } else {
                    $target.focus();
                    materializetool.scrollIntoViewIfNeeded($target, false);
                }
            }
        };

        MaterializeTool.scrollIntoViewIfNeeded = function($target, options) {
            if ($target == null || $target.length === 0) {
                return;
            }

            if (typeof($target[0].scrollIntoViewIfNeeded) === 'function') {
                $target[0].scrollIntoViewIfNeeded(options);
            } else {
                $target[0].scrollIntoView(options);
            }
        };

        MaterializeTool.scrollToViewPortOffset = function($element, offsetY) {
            if ($element == null || $element.length === 0) {
                return;
            }

            $element[0].scrollIntoView(true);

            if (offsetY != null) {
                let boundingBox = $element[0].getBoundingClientRect();
                let viewPortY = boundingBox.top;
                let diffY = Math.floor(offsetY - viewPortY);

                if (diffY != 0) {
                    let $scrollParent = $element.scrollParent();
                    while ($scrollParent != null && $scrollParent != document) {
                        let scrollTop = $scrollParent.scrollTop();
                        if (diffY < 0) {
                            if (scrollTop > 0) {
                                if (scrollTop > (-diffY)) {
                                    scrollTop -= diffY;
                                    diffY = 0;
                                } else {
                                    diffY += scrollTop;
                                    scrollTop = 0;
                                }

                            }
                        } else {
                            if (diffY <= scrollTop) {
                                scrollTop -= diffY;
                                diffY = 0;
                            } else {
                                diffY -= scrollTop;
                                scrollTop = 0;
                            }
                        }

                        $scrollParent.scrollTop(scrollTop);

                        if (diffY === 0) {
                            break;
                        }

                        $scrollParent = $scrollParent.scrollParent();
                    }
                }
            }
        };

        MaterializeTool.autofocusInput = function(event, selector, deferredTimeout) {
            if (event == null || event.status === 'success') {
                if (materializetool.debug) console.log("selector for auto-input " + selector);
                let setFocusFunction = function() {
                    let $theParentDiv = $("." + selector);
                    let $theInputElement = $theParentDiv.find("input, textarea, .form-inline-editor");
                    let $theInputLabel = $theParentDiv.find("> label");
                    if ($theInputLabel &&
                        $theInputLabel.hasClass("active") !== true) {
                        $theInputLabel.addClass("active");
                        // $theInputLabel.val
                    }
                    let $theInputIcon = $theParentDiv.find("> li");
                    if ($theInputIcon &&
                        $theInputIcon.hasClass("active") !== true) {
                        $theInputIcon.addClass("active");
                    }
                    if ($theInputElement &&
                        $theInputElement.hasClass("form-inline-editor") === true) {
                        if (typeof(InlineEditor) !== 'function') {
                            console.error("ckeditor not included");
                            return;
                        }
                        let editor = $theParentDiv.find('.form-inline-editor')[0].ckeditorInstance;
                        editor.editing.view.focus();
                    }
                    $theInputElement.css("display", "block");
                    $theInputElement.trigger("focus");
                };

                if (deferredTimeout) {
                    setTimeout(setFocusFunction, deferredTimeout);
                } else {
                    setFocusFunction();
                }
            }
        };

        MaterializeTool.closeModal = function(event, modalBaseName) {
            if (event == null || event.status === 'begin') {
                dialogtool.closeModal(modalBaseName);
            }
        };

        MaterializeTool.closeModalCheckValidation = function(event, modalBaseName) {
            if (event.status === 'success') {
                // refresh dom element (element in event.source is from before ajax request stage)
                let sourceElement = $(materializetool.lookupElementByXPath(materializetool.createXPathFromElement(event.source)));
                if (sourceElement.attr('ts-validation-failed') !== 'true') {
                    dialogtool.closeModal(modalBaseName);
                }
            }
        };

        MaterializeTool.closeModalCheckValidationIntoCollapsible = function(event, modalBaseName, selector, styleClass, deferredTimeout) {
            if (event.status === 'success') {
                // refresh dom element (element in event.source is from before ajax request stage)
                let sourceElement = $(materializetool.lookupElementByXPath(materializetool.createXPathFromElement(event.source)));
                if (sourceElement.attr('ts-validation-failed') !== 'true') {
                    dialogtool.closeModal(modalBaseName);
                } else {
                    collapsibleHandler.selectCollapsibleTab(event, selector, "." + styleClass, deferredTimeout);
                }
            }
        };

        MaterializeTool.closeModalAndOpenSuccessCheckValidation = function(event, modalBaseName, modalSuccessName) {
            // refresh dom element (element in event.source is from before ajax request stage)
            let sourceElement = $(materializetool.lookupElementByXPath(materializetool.createXPathFromElement(event.source)));
            if (event.status === 'success') {
                if (sourceElement.attr('ts-validation-failed') !== 'true') {
                    dialogtool.closeModal(modalBaseName);
                    dialogtool.openModal(modalSuccessName, true);
                }
            }
        };

        MaterializeTool.initEditors = function(selector) {
            if (selector == null) {
                selector = ".form-inline-editor";
            }

            let $editors = $(selector);
            $editors.each(function(index, editorElement) {
                let $editor = $(editorElement);
                materializetool.initEditor($editor);
            });
        };

        MaterializeTool.initEditor = function(selector) {
            let editor = null;
            let $editorElement = $(selector);
            let language = tsLocale.currentLocale() || "de";

            if (typeof(InlineEditor) !== 'function') {
                console.error("ckeditor not included");
                return;
            }

            if ($editorElement.length === 0) {
                console.warn("cannot init editor " + selector);
                return;
            }

            if ($editorElement.attr(TS_MATERIALIZED_ATTR_INITIALIZED)) {
                return;
            }

            let initEditorInt = function() {
                const maxCharacters = $editorElement.attr("editor-max-length") != null ? $editorElement.attr("editor-max-length") : 0;
                const container = $editorElement.closest('.'.concat($editorElement.attr("editor-input-id")).concat('-container'));
                const progressCircle = container.find('.'.concat($editorElement.attr("editor-input-id")).concat('-update__chart__circle'));
                const charactersBox = container.find('.'.concat($editorElement.attr("editor-input-id")).concat('-update__chart__characters'));
                const charactersTitleBox = container.find('.'.concat($editorElement.attr("editor-input-id")).concat('-title__chart__characters'));
                const wordsBox = container.find('.'.concat($editorElement.attr("editor-input-id")).concat('-update__words'));
                const circleCircumference = progressCircle != null ? Math.floor(2 * Math.PI * progressCircle.attr('r')) : 1;

                const defaultOptions = {
                    // the resource is defined into /ckeditor/de.js
                    language: language,
                    toolbar: ['removeFormat', '|', 'heading', '|', 'bold', 'italic', 'underline', '|', 'bulletedList', 'numberedList', 'blockQuote', 'highlight', '|', 'undo', 'redo'],
                    heading: {
                        options: [{
                                model: 'paragraph',
                                title: 'Paragraph',
                                "class": 'ck-heading_paragraph'
                            },
                            {
                                model: 'heading1',
                                view: 'h1',
                                title: 'Heading 1',
                                "class": 'ck-heading_heading1'
                            },
                            {
                                model: 'heading2',
                                view: 'h2',
                                title: 'Heading 2',
                                "class": 'ck-heading_heading2'
                            }
                        ]
                    },
                    highlight: {
                        options: [{
                                model: 'bluePen',
                                "class": 'pen-blue',
                                title: tsMsg('de.techspring.common.color.pen.value', tsMsg('de.techspring.common.color.blue.value')),
                                color: 'var(--ck-highlight-pen-blue)',
                                type: 'pen'
                            },
                            {
                                model: 'yellowPen',
                                "class": 'pen-yellow',
                                title: tsMsg('de.techspring.common.color.pen.value', tsMsg('de.techspring.common.color.yellow.value')),
                                color: 'var(--ck-highlight-pen-yellow)',
                                type: 'pen'
                            },
                            {
                                model: 'greenPen',
                                "class": 'pen-green',
                                title: tsMsg('de.techspring.common.color.pen.value', tsMsg('de.techspring.common.color.green.value')),
                                color: 'var(--ck-highlight-pen-green)',
                                type: 'pen'
                            },
                            {
                                model: 'redPen',
                                "class": 'pen-red',
                                title: tsMsg('de.techspring.common.color.pen.value', tsMsg('de.techspring.common.color.red.value')),
                                color: 'var(--ck-highlight-pen-red)',
                                type: 'pen'
                            },
                        ]
                    },
                    wordCount: {
                        onUpdate: stats => {

                            if (container.length > 0 && container.hasClass("counter-active")) {
                                const charactersProgress = stats.characters / maxCharacters * circleCircumference;
                                const isLimitExceeded = stats.characters > maxCharacters;
                                const isCloseToLimit = !isLimitExceeded && stats.characters > maxCharacters * .8;
                                const circleDashArray = Math.min(charactersProgress, circleCircumference);

                                let wordCountLabel = tsMsg('de.techspring.common.inline-editor.word.count.label');

                                // Set the stroke of the circle to show how many characters were typed.
                                if (progressCircle.length > 0) {
                                    progressCircle.attr('stroke-dasharray', `${circleDashArray},${circleCircumference}`);
                                }

                                // Display the number of characters in the progress chart. When the limit is exceeded,
                                // display how many characters should be removed.
                                if (charactersBox.length > 0) {
                                    if (isLimitExceeded) {
                                        charactersBox.get(0).textContent = `-${stats.characters - maxCharacters}`;
                                    } else {
                                        charactersBox.get(0).textContent = stats.characters;
                                    }
                                    let $maxLengthHolderElement = $($editorElement.attr("editor-max-length-holder"));
                                    if ($maxLengthHolderElement) {
                                        $maxLengthHolderElement.val(stats.characters);
                                    }
                                }

                                if (charactersTitleBox.length > 0) {
                                    var nf = new Intl.NumberFormat();
                                    charactersTitleBox.get(0).textContent = nf.format(stats.characters) + ' / ' + nf.format(maxCharacters);
                                }

                                if (wordsBox.length > 0) {
                                    wordsBox.get(0).textContent = `${wordCountLabel.concat(' ').concat(stats.words)}`;
                                }

                                // If the content length is close to the character limit, add a CSS class to warn the user.
                                container.toggleClass('update-limit-close', isCloseToLimit);

                                // If the character limit is exceeded, add a CSS class that makes the content's background red.
                                container.toggleClass('update-limit-exceeded', isLimitExceeded);
                            }
                        }
                    },
                    removePlugins: ['Link', 'Title', 'RestrictedEditingMode']
                };

                let customOptionsStr = $editorElement.attr("editor-custom-options");
                let customOptions = materializetool.parseCustomOptions(customOptionsStr);

                let options = $.extend(true, {},
                    defaultOptions,
                    customOptions
                );

                if (customOptions != null) {
                    if (typeof(customOptions.toolbar) !== 'undefined') {
                        options.heading = customOptions.toolbar;
                    }

                    if (typeof(customOptions.heading) !== 'undefined') {
                        options.heading = customOptions.heading;
                    }

                    if (typeof(customOptions.highlight) !== 'undefined') {
                        options.highlight = customOptions.highlight;
                    }

                    if (typeof(customOptions.removePlugins) !== 'undefined') {
                        options.removePlugins = customOptions.removePlugins;
                    }
                }

                InlineEditor.create($editorElement[0], options).then(newEditor => {
                        editor = newEditor;
                        materializetool.editors[$editorElement.attr("id")] = editor;
                        let $dataElement = $editorElement.closest(".ck-editor-container").find($editorElement.attr("editor-data-selector"));
                        let value = $dataElement.val();
                        editor.setData(value);
                        editor.isReadOnly = $editorElement.hasClass("disabled");
                        $editorElement.attr(TS_MATERIALIZED_ATTR_INITIALIZED, "true");

                        let $labelElement = $("label[for='" + $editorElement.attr("id") + "']");
                        if (value.length > 0) {
                            $dataElement.parent().find('label').addClass('active');
                            $labelElement.addClass('active');
                        } else {
                            $dataElement.parent().find('label').removeClass('active');
                            $labelElement.removeClass('active');
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    });

                $editorElement.blur(function(event) {
                    const editorData = editor.getData();
                    let $dataElement = $editorElement.closest(".ck-editor-container").find($editorElement.attr("editor-data-selector"));
                    $dataElement.val(editorData);

                    let doExecuteChangeEvent = $editorElement.attr("editor-data-save-on-blur");
                    let hasValueChangeListener = $editorElement.attr("editor-data-has-valuechangelistener");
                    if ((doExecuteChangeEvent != null && doExecuteChangeEvent === 'true') ||
                        (hasValueChangeListener != null && hasValueChangeListener === 'true')) {
                        $dataElement.change();
                    }

                    let $maxLengthHolderElement = $($editorElement.attr("editor-max-length-holder"));
                    if ($maxLengthHolderElement &&
                        typeof $maxLengthHolderElement !== "undefined") {
                        if (doExecuteChangeEvent != null && doExecuteChangeEvent === 'true') {
                            $maxLengthHolderElement.change();
                        }
                    }

                    let $iconElement = $($editorElement.parent().prevAll($editorElement.attr("editor-icon-selector")).first());
                    let $labelElement = $("label[for='" + $editorElement.attr("id") + "']");
                    $iconElement.addClass('inline-editor-content-blur').removeClass('inline-editor-content-focus');
                    if (editorData.length > 0) {
                        $dataElement.parent().find('label').addClass('active');
                        $labelElement.addClass('active');
                    } else {
                        $dataElement.parent().find('label').removeClass('active');
                        $labelElement.removeClass('active');
                    }
                });

                $editorElement.focus(function(event) {
                    let $labelElement = $("label[for='" + $editorElement.attr("id") + "']");
                    $labelElement.addClass('active');

                    let $iconElement = $($editorElement.attr("editor-icon-selector"));
                    $iconElement.addClass('inline-editor-content-focus').removeClass('inline-editor-content-blur');
                });
            };

            if ($editorElement.get(0).ckeditorInstance != null) {
                $editorElement.get(0).ckeditorInstance.destroy()
                    .then(destroyed => {
                        initEditorInt();
                    })
                    .catch(error => {
                        console.error(error);
                    });
                return;
            }
            initEditorInt();
        };

        MaterializeTool.updateAllEditorCharCounters = function(selector) {
            if (selector == null) {
                selector = ".char-counter-input";
            }

            let $charCounterElements = $(selector);
            $charCounterElements.each(function(index, charCounterElement) {
                let $charCounterElement = $(charCounterElement);

                if (materializetool.debug) console.log("update char counter " + materializetool.createXPathFromElement(charCounterElement));
                materializetool.updateEditorCharCounter($charCounterElement);
            });
        };

        MaterializeTool.updateEditorCharCounterEv = function(event) {
            if (event) {
                let $charCounterElement = $(event.target);
                materializetool.updateEditorCharCounter($charCounterElement);
            }
        };

        MaterializeTool.updateEditorCharCounter = function(selector, outPanelName, maxCharactersIn) {
            try {
                let $textAreaElement = $(selector);
                if ($textAreaElement.length === 0) {
                    if (typeof(event) !== 'undefined' && typeof(event.srcElement) !== 'undefined') {
                        $textAreaElement = $(event.srcElement);
                    }
                }

                let maxCharacters = $textAreaElement.attr("editor-max-length");
                if (maxCharacters == null) {
                    maxCharacters = maxCharactersIn;
                }
                let theValue = $textAreaElement.val() || "";

                let nf = new Intl.NumberFormat();
                let counterText = nf.format(theValue.length) + ' / ' + nf.format(maxCharacters);

                let $charactersTitleBox = $textAreaElement.parent().find(".counter-characters");
                if ($charactersTitleBox.length > 0) {
                    $charactersTitleBox.text(counterText);
                } else {
                    const charactersTitleBox = document.querySelector('.'.concat(outPanelName).concat('-title__chart__characters'));
                    if (charactersTitleBox != null) {
                        charactersTitleBox.textContent = counterText;
                    }
                }
            } catch (e) {
                console.warn("richTextEditorCharCounter exception:" + e.message);
            }
        };

        MaterializeTool.initDualSelectLists = function(selector) {
            if (!selector) {
                selector = '.dual-select-list-container';
            }

            let $dualSelectLists = $(selector);
            $dualSelectLists.each(function(index, dualSelectElement) {
                let $dualSelectElement = $(dualSelectElement);
                materializetool.initDualSelectList($dualSelectElement);
            });

        };

        MaterializeTool.initDualSelectList = function(selector) {
            let $dualSelectList = $(selector);

            if ($dualSelectList.length === 0) {
                return;
            }

            if ($dualSelectList.attr(TS_MATERIALIZED_ATTR_INITIALIZED)) {
                return;
            }

            const CLASS_ASSIGN_ALL = 'assign-all';
            const CLASS_ASSIGN_SELECTED = 'assign-selected';
            const CLASS_REMOVE_ALL = 'remove-all';
            const CLASS_REMOVE_SELECTED = 'remove-selected';
            const SELECTOR_SELECT_LIST_SOURCE = '.dual-select-list-source';
            const SELECTOR_SELECT_LIST_TARGET = '.dual-select-list-target';

            function hideOrShowBorders() {
                // :has is a CSS 4 selector, not working in most browsers. Therefore, it needs to be processed here, in jQuery
                $dualSelectList.find('ul.collection:not(:has(li))').hide();
                $dualSelectList.find('ul.collection:has(li)').show();
            }

            let updateButtons = function() {
                let DISABLE = "disabled";
                let disableAssignAll = null;
                let disableAssignSelected = null;
                let disableRemoveAll = null;
                let disableRemoveSelected = null;

                let $sourceUL = $dualSelectList.find(SELECTOR_SELECT_LIST_SOURCE);
                let $sourceLI = $sourceUL.children("li");
                if ($sourceLI.length === 0) {
                    disableAssignAll = DISABLE;
                    disableAssignSelected = DISABLE;
                }
                if (!disableAssignSelected) {
                    $sourceLI = $sourceUL.children("li.ui-selected");
                    if ($sourceLI.length === 0) {
                        disableAssignSelected = DISABLE;
                    }
                }
                $dualSelectList.find("." + CLASS_ASSIGN_ALL).attr("disabled", disableAssignAll);
                $dualSelectList.find("." + CLASS_ASSIGN_SELECTED).attr("disabled", disableAssignSelected);

                let $targetUL = $dualSelectList.find(SELECTOR_SELECT_LIST_TARGET);
                let $targetLI = $targetUL.children("li");
                if ($targetLI.length === 0) {
                    disableRemoveAll = DISABLE;
                    disableRemoveSelected = DISABLE;
                }
                if (!disableRemoveSelected) {
                    $targetLI = $targetUL.children("li.ui-selected");
                    if ($targetLI.length === 0) {
                        disableRemoveSelected = DISABLE;
                    }
                }
                $dualSelectList.find("." + CLASS_REMOVE_ALL).attr("disabled", disableRemoveAll);
                $dualSelectList.find("." + CLASS_REMOVE_SELECTED).attr("disabled", disableRemoveSelected);
            }

            function selectUnselect(event, ui) {
                let $that = $(this);
                $that.children(".ui-selecting").removeClass("ui-selecting").addClass("ui-selected");
                $that.selectable("refresh");
                materializetool.updateDualSelectListSelectedIds($dualSelectList);
                updateButtons();
            }

            let sourceList = $dualSelectList.find('ul.collection.dual-select-list-source');
            let targetList = $dualSelectList.find('ul.collection.dual-select-list-target');

            let selectableOptions = {
                cancel: "li.ui-selected,.ui-selecting",
                filter: "li:not(.disabled)",
                selected: selectUnselect,
                unselected: selectUnselect
            };

            let draggableStartStopFunction = function(event, ui) {
                let origin = $(ui.helper).attr("origin");
                if (origin == "source") {
                    sourceList.droppable("enable");
                } else {
                    targetList.droppable("enable");
                }
            };

            let draggableOptions = {
                appendTo: $dualSelectList,
                cancel: "li:not(.ui-selected,.disabled)",
                revert: true,
                revertDuration: 0,
                helper: function() {
                    let $helper = $("<ul>", {
                        "class": "draggable-helper"
                    });

                    let $originUl = $(this).closest("ul");
                    $originUl.find("li.ui-selected").each(function(index, liElement) {
                        let $liElement = $(liElement);
                        $liElement.clone().appendTo($helper);
                    });

                    if ($originUl.hasClass("dual-select-list-source")) {
                        $helper.attr("origin", "source");
                    } else {
                        $helper.attr("origin", "target");
                    }
                    return $helper;
                },
                start: draggableStartStopFunction,
                stop: draggableStartStopFunction,
            };

            let dropOptions = {
                drop: function(event, ui) {
                    let $that = $(this);
                    let actionButtonSelector;

                    if ($that.hasClass("dual-select-list-source")) {
                        actionButtonSelector = "." + CLASS_REMOVE_SELECTED;
                    } else {
                        actionButtonSelector = "." + CLASS_ASSIGN_SELECTED;
                    }

                    $dualSelectList.find(actionButtonSelector).click();
                }
            }

            sourceList
                .dblclick(function(event) {
                    $dualSelectList.find("." + CLASS_ASSIGN_SELECTED).click();
                })
                .selectable(selectableOptions)
                .droppable(dropOptions)
                .disableSelection();
            sourceList.children("li")
                .draggable(draggableOptions);

            targetList
                .dblclick(function(event) {
                    $dualSelectList.find("." + CLASS_REMOVE_SELECTED).click();
                })
                .selectable(selectableOptions)
                .droppable(dropOptions)
                .disableSelection();
            targetList.children("li")
                .draggable(draggableOptions);

            $dualSelectList.on('click', '.btn', function(event) {
                const $that = $(this);

                function addElems($theseElements) {
                    $theseElements.remove();
                    $theseElements.removeClass('ui-selected').appendTo(targetList);
                }

                function removeElems($theseElements) {
                    $theseElements.remove();
                    $theseElements.removeClass('ui-selected').appendTo(sourceList);
                }

                if ($that.hasClass(CLASS_ASSIGN_ALL)) {
                    const $elements = $dualSelectList.find(SELECTOR_SELECT_LIST_SOURCE).find('li');
                    addElems($elements);
                } else if ($that.hasClass(CLASS_ASSIGN_SELECTED)) {
                    const $elements = $dualSelectList.find(SELECTOR_SELECT_LIST_SOURCE).find('li.ui-selected');
                    addElems($elements);
                } else if ($that.hasClass(CLASS_REMOVE_ALL)) {
                    const $elements = $dualSelectList.find(SELECTOR_SELECT_LIST_TARGET).find('li:not(.disabled)');
                    removeElems($elements);
                } else if ($that.hasClass(CLASS_REMOVE_SELECTED)) {
                    const $elements = $dualSelectList.find(SELECTOR_SELECT_LIST_TARGET).find('li.ui-selected');
                    removeElems($elements);
                }
                // hideOrShowBorders();
                materializetool.updateDualSelectListSelectedIds($dualSelectList);
                updateButtons();
            });
            updateButtons();

            let $sourceFilter = $dualSelectList.find("input.picklist-source-filter");
            $sourceFilter.on('keyup', function(event) {
                const $that = $(this);
                let filterValue = $that.val();
                if (filterValue) {
                    filterValue = filterValue.toLowerCase();
                }
                console.log("source filter " + filterValue);
                sourceList.children("li").each(function(index, liElement) {
                    let $li = $(liElement);
                    if (filterValue) {
                        let text = $li.text();
                        if (text != null && text.toLowerCase().indexOf(filterValue) >= 0) {
                            $li.show();
                        } else {
                            $li.hide();
                        }
                    } else {
                        $li.show();
                    }
                });
            });

            let $targetFilter = $dualSelectList.find("input.picklist-target-filter");
            $targetFilter.on('keyup', function(event) {
                const $that = $(this);
                let filterValue = $that.val();
                if (filterValue) {
                    filterValue = filterValue.toLowerCase();
                }
                console.log("target filter " + filterValue);
                targetList.children("li").each(function(index, liElement) {
                    let $li = $(liElement);
                    if (filterValue) {
                        filterValue = filterValue.toLowerCase();
                        let text = $li.text();
                        if (text != null && text.toLowerCase().indexOf(filterValue) >= 0) {
                            $li.show();
                        } else {
                            $li.hide();
                        }
                    } else {
                        $li.show();
                    }
                });
            });

            $dualSelectList.attr(TS_MATERIALIZED_ATTR_INITIALIZED, "true");

            targetList.sortable({
                axis: 'y',
                start: function(event, ui) {
                    $(this).attr('data-previndex', ui.item.index());
                },
                stop: function(event, ui) {
                    const oldIndex = $(this).attr('data-previndex');
                    // console.log(event);
                    // console.log(ui);
                    // console.log(oldIndex);
                    // console.log(ui.item.index());
                    // add to java list at new index
                    moveItemToIndexAtTargetList({oldIndex: oldIndex, newIndex: ui.item.index()});
                }
            });
        }

        MaterializeTool.updateDualSelectListSelectedIds = function(selector) {
            if (!selector) {
                return;
            }

            let selectedIds = {
                source: [],
                target: []
            };
            let $clickElement = $(selector);
            let container = $clickElement.find(".dual-select-list");
            if (container.length === 0) {
                container = $clickElement.closest(".dual-select-list");
            }
            let selectedIdsElement = container.find(".dual-list-selected-ids");

            let sourceListElement = container.find(".dual-select-list-source");
            let selectedSourceElements = sourceListElement.children(".ui-selected");
            selectedSourceElements.each(function(index, liElement) {
                selectedIds.source.push($(liElement).attr("data-id"));
            });

            let targetListElement = container.find(".dual-select-list-target");
            let selectedTargetElements = targetListElement.children(".ui-selected");
            selectedTargetElements.each(function(index, liElement) {
                selectedIds.target.push($(liElement).attr("data-id"));
            });

            let jsonStr = JSON.stringify(selectedIds);
            selectedIdsElement.val(jsonStr);
        };

        MaterializeTool.dualSelectList_onevent = function(ev) {
            if (ev && ev.status == 'success') {
                let $source = $(ev.source);
                let $dualListContainer = $source.closest(".dual-select-list-container");
                let onchange = $dualListContainer.attr("onchange");
                if (onchange != null) {
                    try {
                        eval(onchange);
                    } catch (e) {
                        console.warn("duallist call to onchange failed: " + e.message, e);
                    }
                }
            }
        };

        MaterializeTool.getSessionTimeoutInMilliseconds = function(originalValue) {
            let sessionTimeoutInMilliseconds = 30 * 60 * 1000;
            // webSessionTimeout is in minutes
            if ($.isNumeric(window.webSessionTimeout)) {
                let webSessionTimeoutinMilliseconds = parseFloat(window.webSessionTimeout) * 60 * 1000;
                if (originalValue || webSessionTimeoutinMilliseconds >= materializetool.sessionTimeoutWarnLeadTimeInMillis) {
                    sessionTimeoutInMilliseconds = webSessionTimeoutinMilliseconds;
                }
            }
            return sessionTimeoutInMilliseconds;
        };

        MaterializeTool.updateSessionTimer = function() {
            if (materializetool.sessionTimerHandler != null) {
                materializetool.clearExactTimeout(materializetool.sessionTimerHandler);
                if (materializetool.sessionTimeoutDialogName != null) {
                    dialogtool.destroyModal(materializetool.sessionTimeoutDialogName);
                    materializetool.sessionTimeoutDialogName = null;
                }
            }

            let sessionTimeoutInMilliseconds = materializetool.getSessionTimeoutInMilliseconds();

            // if (materializetool.debug) console.log("set session sessiontimer, ends in " + sessionTimeoutInMilliseconds / 1000 + " seconds");
            // let now = new Date();
            // now.setTime(now.getTime()+sessionTimeoutInMilliseconds)
            // console.log("set session sessiontimer, ends in " + sessionTimeoutInMilliseconds / 1000 + " seconds, " + now);

            materializetool.sessionTimerHandler = materializetool.setExactTimeout(function() {
                if (materializetool.debug) console.log("Session ends in " + materializetool.sessionTimeoutWarnLeadTimeInMillis / 1000 + " seconds");
                materializetool.sessionTimeoutDialogName = "sessiontimeout";
                let dialogElement = dialogtool.openModal(materializetool.sessionTimeoutDialogName, materializetool.sessionTimeoutDialogDismissible);
                let contentElement = $(dialogElement.el).find(".modal-content");
                let footerElement = $(dialogElement.el).find(".modal-footer");

                $(dialogElement.el).addClass(materializetool.sessionTimeoutDialogClass);

                var secondsToSessionTimeout = Math.floor(materializetool.sessionTimeoutWarnLeadTimeInMillis / 1000);

                let updateButton = $('<a href="#!" class="btn waves-effect btn-flat" style="margin-right:3px;">' + tsMsg("de.techspring.panel.logout.session.refresh.label") + '</a>')
                    .appendTo(footerElement);
                updateButton.click(function() {
                    if (secondsToSessionTimeout > 0) {
                        if (typeof(tsUpdateSession) === 'function') {
                            tsUpdateSession();
                            dialogtool.destroyModal(materializetool.sessionTimeoutDialogName);
                        }
                    } else {
                        window.location.href = window.baseURL;
                    }
                });

                $('<a href="#!" class="btn modal-close waves-effect btn-flat">' + tsMsg("de.techspring.dialog.button.close.value") + '</a>')
                    .appendTo(footerElement);

                $('<h4>' + tsMsg("de.techspring.panel.logout.expires.soon.label") + '</h4>' +
                    '<p style="white-space: nowrap;">' + tsMsg("de.techspring.panel.logout.expires.soon.message") + '</p>' +
                    '').appendTo(contentElement);

                var sessionTimeoutValueElement = contentElement.find(".session-timeout-value");
                sessionTimeoutValueElement.text(secondsToSessionTimeout);

                var sessionTimeoutValueUpdaterInterval = setInterval(function() {
                    if (materializetool.sessionTimerHandler == null) {
                        clearInterval(sessionTimeoutValueUpdaterInterval);
                        return;
                    }

                    if (secondsToSessionTimeout > 0) {
                        secondsToSessionTimeout -= 1;
                        sessionTimeoutValueElement.text(secondsToSessionTimeout);
                    } else {
                        clearInterval(sessionTimeoutValueUpdaterInterval);
                        updateButton.text(tsMsg("de.techspring.panel.logout.login.value"));

                        let dialogTitle = contentElement.find("h4");
                        dialogTitle.text(tsMsg("de.techspring.panel.logout.expired.title"));

                        let dialogContent = contentElement.find("p");
                        dialogContent.text(tsMsg("de.techspring.panel.logout.expired.message"))
                    }
                }, 1000);

            }, sessionTimeoutInMilliseconds - materializetool.sessionTimeoutWarnLeadTimeInMillis, 10000);

            if (materializetool.showSessionTimer) {
                materializetool.lastRequestTimestamp = new Date();
                materializetool.updateSessionTimerClockHandler = setTimeout(materializetool.updateSessionTimerClock, 1);
            }
        };

        MaterializeTool.updateSessionTimerClock = function() {
            clearTimeout(materializetool.updateSessionTimerClockHandler);
            if (!materializetool.showSessionTimer) {
                return;
            }

            let diff = materializetool.getSessionTimeoutInMilliseconds();
            if (materializetool.lastRequestTimestamp != null) {
                let now = new Date();
                diff -= now - materializetool.lastRequestTimestamp;
            }

            let msg;
            let style;
            if (diff < 0) {
                style = "background-color:#ff9595;";
                msg = "abgelaufen";
            } else {
                var secs = Math.floor(diff / 1000);
                if (secs < 120) {
                    style = "background-color:#ff9595;";
                } else if (secs < 300) {
                    style = "background-color:#fcfca3;";
                } else {
                    style = "background-color:#c5e3c7;";
                }
                var mins = Math.floor(secs / 60);
                if (mins < 5) {
                    msg = "0" + mins;
                    msg = msg + ":";
                    secs = secs - (mins * 60);
                    if (secs < 10) {
                        msg = msg + "0" + secs;
                    } else {
                        msg = msg + secs;
                    }
                } else {
                    msg = mins;
                }
                msg = msg + " min";

                let timeout;
                if (diff > 330000) {
                    timeout = 60000;
                } else {
                    timeout = 1000;
                }
                materializetool.updateSessionTimerClockHandler = setTimeout(materializetool.updateSessionTimerClock, timeout);
            }

            let elm = jQuery("[id$=sessionTimeoutClock]");
            if (elm.length > 0) {
                let elem = elm.get(0);
                if (elem.innerHTML != msg) {
                    elem.innerHTML = msg;
                }
            }
            elm = jQuery("[id$=sessionTimeoutClockDiv]");
            if (elm.length > 0) {
                let elem = elm.get(0);
                if (elem.style.cssText != style) {
                    elem.style.cssText = style;
                }
            }
        };

        MaterializeTool.setExactTimeout = function(callback, duration, resolution) {
            const start = (new Date()).getTime();
            const timeout = setInterval(function(){
                // console.log("setExactTimeout " + ((new Date()).getTime() - start) + " > " +  duration);
                if ((new Date()).getTime() - start > duration) {
                    callback();
                    clearInterval(timeout);
                }
            }, resolution);

            return timeout;
        };

        MaterializeTool.clearExactTimeout = function(timeout) {
            clearInterval(timeout);
        };

        MaterializeTool.recognizeLastElementsInTable = function(tableElement) {
            materializetool.recognizeLastColumnHeader(tableElement);
            materializetool.recognizeLastFooterElement(tableElement);
            materializetool.recognizeLastCell(tableElement);
        }

        MaterializeTool.recognizeLastColumnHeader = function (tableElement) {
            let row = $(tableElement).find("thead > tr");

            if (row.length) {
                let lastMarkedHeaderElement = $(row.find("th.last-header"));

                if (lastMarkedHeaderElement.length) {
                    lastMarkedHeaderElement.removeClass("last-header");
                }

                let lastHeaderElement = row.find("th:visible:last");

                if (lastHeaderElement.length && !lastHeaderElement.hasClass("last-header")) {
                    lastHeaderElement.addClass("last-header");
                }
            }
        }

        MaterializeTool.recognizeLastFooterElement = function (tableElement) {
            let row = $(tableElement).find("tfoot > tr");

            if (row.length) {
                let lastMarkedHeaderElement = $(row.find("td.last-footer"));

                if (lastMarkedHeaderElement.length) {
                    lastMarkedHeaderElement.removeClass("last-footer");
                }

                let lastHeaderElement = row.find("td:visible:last");

                if (lastHeaderElement.length && !lastHeaderElement.hasClass("last-footer")) {
                    lastHeaderElement.addClass("last-footer");
                }
            }
        }

        MaterializeTool.recognizeLastCell = function (tableElement) {
            let rows = $(tableElement).find("tbody > tr");

            if (rows.length) {
                let lastCellElements = $(rows.find("td.last-cell"));

                if (lastCellElements.length) {
                    lastCellElements.removeClass("last-cell");
                }

                rows.toArray().forEach(element => {
                    let lastCell = $(element).find("td:visible:last");

                    if (lastCell.length && !lastCell.hasClass("last-cell")) {
                        lastCell.addClass("last-cell")
                    }
                })
            }
        }

        MaterializeTool.toggleSelectLabel = function(senderElement) {
            const $sender = $(senderElement);
            let $label = $sender.parent().parent().find('label');

            if ($sender.find('option:selected').text() !== "" && !$label.hasClass('active')) {
                $label.addClass('active');
            } else if ($sender.find('option:selected').text() === "" && $label.hasClass('active')) {
                $label.removeClass('active');
            }
        };

        MaterializeTool.escapeHtmlString = function(str) {
            if (str == null) {
                str = "";
            }

            materializetool.escapeHelperElement.textContent = str;
            let ret = materializetool.escapeHelperElement.innerHTML;

            ret = ret.replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
            ;
            return ret;
        };

        MaterializeTool.unescapeHtmlString = function (input) {
            materializetool.escapeHelperElement.innerHTML = input;
            return materializetool.escapeHelperElement.childNodes.length === 0 ? "" : materializetool.escapeHelperElement.childNodes[0].nodeValue;
        };

        MaterializeTool.cloneObject = function(obj) {
            return jQuery.extend({}, obj);
        };

        MaterializeTool.deepCloneObject = function(obj) {
            // MHY 20200424: doesn't work for custom objects (only copies references)
            // return jQuery.extend(true, {}, obj);
            return JSON.parse(JSON.stringify(obj));
        };

        MaterializeTool.isPresent = function(value) {
            return value != null &&
                   typeof(value) != "undefined" &&
                   ((typeof(value) == "string" && value.length > 0) ||
                    (typeof(value) == "number") ||
                    (typeof(value.length) == "number" && value.length > 0) ||
                    (typeof(value) == "object" && !Array.isArray(value)))
        };

        MaterializeTool.isValid = function (value) {
            let valid = false;

            if (value != null) {
                if ($.isArray(value)) {
                    if (value.length > 0) {
                        valid = true;
                    }
                } else if (typeof(value) === 'string') {
                    if (a.trim().length > 0) {
                        valid = true;
                    }
                } else {
                    valid = true;
                }
            }

            return valid;
        };

        MaterializeTool.htmlToSvg = function(container, cssNameFilter, cssClassFilter) {
            let div = $('<div xmlns="http://www.w3.org/1999/xhtml" class="svgContainer" style="display:inline-block;"></div>');
            div.html(container[0].outerHTML);

            let width = container.width();
            let height = container.height();

            try {
                let browserVersion = getBrowserVersion();
                if (browserVersion.name.toLowerCase() == "firefox" && browserVersion.version < 67) {
                    if (typeof(detectZoom) !== 'undefined') {
                        let zoom = detectZoom.zoom();
                        if (zoom > 1.0) {
                            zoom = -0.15 / zoom + 1.169666661;
                        } else if (zoom < 1.0) {
                            zoom = 0.33284 * zoom + 0.7325443801;

                        }
                        height = height * zoom;
                    }
                }
            } catch (e) {
                console.log("detect zoom failed: " + e.message, e);
            }

            let ns = 'http://www.w3.org/2000/svg';
            let svg = document.createElementNS( ns, 'svg');
            svg.setAttribute('xmlns', ns);
            svg.setAttribute('display', "block");
            svg.setAttribute('width', width);
            svg.setAttribute('height', height);
            svg.setAttribute('max-height', "100%");
            svg.setAttribute('margin', 0);
            svg.setAttribute('padding', 0);
            svg.setAttribute('font-size', '12px');
            svg.setAttribute('font-family', 'Lucida Grande, Lucida Sans, Arial, sans-serif');
            svg.setAttribute('background-color', '#ffffff');

            let textContains = function(text, filterArray) {
                let rc;
                if (text && filterArray && filterArray.length > 0) {
                    rc = false;
                    for (let filter of filterArray) {
                        if (text.indexOf(filter) >= 0) {
                            rc = true;
                            break;
                        }
                    }
                } else {
                    rc = true;
                }
                return rc;
            };

            let cssToStr = function(css) {
                for (let cssrule of css.cssRules) {
                    let cssText = cssrule.cssText;
                    if (textContains(cssText, cssClassFilter)) {
                        cssdefs += '\n' + cssrule.cssText;
                    }
                }
            };

            let cssdefs = '<![CDATA[\n';
            for (let css of document.styleSheets) {
                if (css != null && css.href != null) {
                    if (textContains(css.href, cssNameFilter)) {
                        cssToStr(css);
                    }
                }
            }

            cssdefs += '\n]]>';

            let svgDefs = document.createElementNS( ns, 'defs');
            svg.appendChild(svgDefs);

            let svgStyles = document.createElementNS( ns, 'style');
            svgStyles.setAttribute('type','text/css');
            svgStyles.innerHTML = cssdefs;
            svgDefs.appendChild(svgStyles);

            let foreignObject = document.createElementNS( ns, 'foreignObject');
            foreignObject.setAttribute('width', "100%");
            foreignObject.setAttribute('height', "100%");

            foreignObject.appendChild( div[0] );
            svg.appendChild(foreignObject);

            return $(svg);
        };

        MaterializeTool.svgToImage = function(svgElement, canvas, removeSvg, callback) {
            let data = new XMLSerializer().serializeToString(svgElement[0]);
            let ctx = canvas[0].getContext("2d");
            let img = new Image();
            img.crossOrigin = 'Anonymous';

            let url = 'data:image/svg+xml;base64,' + Base64.encode(data);
            if (removeSvg) {
                $(svgElement).remove();
            }
            img.onerror = function(e) {
                console.log("svgToImage onerror " + e);
            };
            img.onload = function() {
                ctx.drawImage(img, 0, 0);
                if (typeof(callback) === 'function') {
                    callback(ctx);
                }
            };
            img.src = url;
        };

        MaterializeTool.triggerChangeOnEnter = function(event) {
            if (event && event.keyCode === 13) {
                $(event.target).trigger("change");
                event.preventDefault();
                return false;
            }
        };

        MaterializeTool.registerWebSocketCallback = function(channel, callback) {
            materializetool.webSocketCallbacks[channel] = callback;
        };

        MaterializeTool.deregisterWebSocketCallback = function(channel) {
            delete materializetool.webSocketCallbacks[channel];
        };

        MaterializeTool.pushWebSocketMessage = function(channel, message, event) {
            if (materializetool.jsfRequestStatus != null) {
                if (materializetool.debug) {
                    console.log("websocket queue callback on channel " + channel);
                }
                materializetool.webSocketQueue.push({
                    channel: channel,
                    message: message,
                    event: event
                });
            } else {
                if (materializetool.debug) {
                    console.log("websocket direct callback on channel " + channel);
                }
                let callback = materializetool.webSocketCallbacks[channel];
                if (typeof(callback) === 'function') {
                    callback(channel, message, event);
                } else {
                    console.warn("no callback for websocket message on channel " + channel);
                }
            }
        };

        MaterializeTool.processWebSocketQueue = function() {
            try {
                for (let entry of materializetool.webSocketQueue) {
                    if (materializetool.debug) {
                        console.log("process websocket queue entry on channel " + entry.channel);
                    }

                    let callback = materializetool.webSocketCallbacks[entry.channel];
                    if (typeof(callback) === 'function') {
                        callback(entry.channel, entry.message, entry.event);
                    } else {
                        console.warn("no callback for queued websocket message on channel " + entry.channel);
                    }
                }

                // clear queue
                materializetool.webSocketQueue.splice(0, materializetool.webSocketQueue.length);
            } catch (e) {
                console.warn("error processing websocket queue: " + e.message, e);
            }
        };

        return MaterializeTool;
    }(jQuery);

    materializetool.init();
    materializetool.updateSessionTimer();

})();

function tsUpdateSession() {
    if (typeof(window.tsUpdateSessionInt) === 'function') {
        console.log("tsUpdateSession");
        tsUpdateSessionInt();
    }
}