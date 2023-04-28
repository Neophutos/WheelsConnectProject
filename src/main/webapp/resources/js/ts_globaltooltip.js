/**
 * Name: ts_globaltooltip.js
 *
 * Creator: Fabian Frank (ffr)
 *
 * Date: 16.04.2020 ff.
 *
 * Description: Javascript ts_chat.js implementation.
 *
 * Copyright (c) 2020 The TechSpring GmbH. All rights reserved.
 *
 * $Author$
 * $Revision$
 * $Date$
 * $Id$
 */

(function () {
    if (!window.globalTooltipHandler) window.globalTooltipHandler = function ($) {
        let tooltipInstance = null;
        let closeTooltip = true;

        const CHECKER_CLASS = {
            TOOLTIPPED: "tooltipped",
            REQUIRED: "required",
            DYNAMIC: "dynamic"
        }

        const ATTRIBUTE = {
            DATA_POSITION: "data-position",
            DATA_TOOLTIP: "data-tooltip",
            CUSTOM_OPTIONS: "tooltip-custom-options",
            STYLE_CLASS: "style-class-tooltip",
            HTML_DATA: "data-tooltip-html",
            HTML_FROM: "tooltip-html-from",
            DYNAMIC_FROM: "dynamic-from"        // valid css selector which is applied from target i.e. $target.find(*)
        }

        let GlobalTooltipHandler = {

            nearMouseEnabled: true,             // This can be overwritten globally and is used to change the tooltip positioning

            initializeHandler: function () {
                $("body").on("mouseenter", ".tooltipped,.required,.dynamic-tooltip", function (event) {
                    _onMouseEnter(this, event);
                    event.stopPropagation();
                });
            }
        };

        /**
         * Event functionality for on mouse enter
         * @param target Target element which triggers the tooltip
         * @param event Event object propagated by JS event
         * @private
         */
        function _onMouseEnter(target, event) {
            let $target = $(target);

            if ($target.length) {
                _destroyTooltip();
                _createTooltip($target, event);
            } else {
                console.error('No delegate target found for target.', event);
            }
        }

        /**
         * Creates tooltip for given target
         * @param target Target element which triggers the tooltip
         * @param event Event object propagated by JS event
         * @private
         */
        function _createTooltip(target, event) {
            let $target = $(target);

            let defaultOptions = {
                nearMouse: hasDataPosition($target) ? false : globalTooltipHandler.nearMouseEnabled
            };

            // for required fields
            let isRequired = $target.hasClass(CHECKER_CLASS.REQUIRED);

            if (isRequired) {
                $target.addClass(CHECKER_CLASS.TOOLTIPPED);
            }

            let customOptionsStr = $target.attr(ATTRIBUTE.CUSTOM_OPTIONS);
            let customOptions = materializetool.parseCustomOptions(customOptionsStr);

            let options = $.extend(true, {},
                defaultOptions,
                customOptions
            );

            options.mouseEvent = event;

            _prepareTooltipContent($target, options);

            if (!emptyTooltip($target)) {
                let instances = M.Tooltip.init($target, options);

                if (instances.length > 0) {
                    let instance = instances[0];
                    let customStyleClass = $target.attr(ATTRIBUTE.STYLE_CLASS);

                    if (typeof customStyleClass !== "undefined") {
                        $(instance.tooltipEl).addClass(customStyleClass);
                    }

                    instance.open();
                }
            }
        }

        /**
         * Destroys every opened tooltip to avoid overlapping
         *
         * @private
         */
        function _destroyTooltip() {
            let toolTip = $(".material-tooltip");

            if (toolTip.length && tooltipInstance !== null) { // TODO GSI 2020-07-08: added 2nd temporarily, because tooltips currently are not unified on each xhtml
                tooltipInstance.destroy();
            }
            toolTip.remove();
        }

        /**
         * Prepares the content of the to be shown tooltip.
         *
         * @param $target Target element which triggers the tooltip
         * @param options Optional options for the tooltip creation (look at materialize tooltip initialization)
         *
         * @see https://materializecss.com/tooltips.html
         * @private
         */
        function _prepareTooltipContent($target, options) {
            if (typeof (options.callbackContentFunction) === 'function') {
                let title = options.callbackContentFunction($target);
                $target.attr(ATTRIBUTE.DATA_TOOLTIP, title);
            } else {
                let htmlFromSelector = $target.attr(ATTRIBUTE.HTML_FROM);
                if (htmlFromSelector) {
                    let $htmlFrom = $(htmlFromSelector);

                    if ($htmlFrom.length > 0) {
                        options.html = $htmlFrom.html();
                    }
                } else {
                    let dataTooltipHtml = $target.attr(ATTRIBUTE.HTML_DATA) || "";

                    if (dataTooltipHtml) {
                        dataTooltipHtml = dataTooltipHtml.replace(/"/g, "&quot;")
                            .replace(/'/g, "&#039;")
                            .replace(/</g, "&lt;")
                            .replace(/>/g, "&gt;");

                        options.html = dataTooltipHtml;
                    } else {
                        if ($target.hasClass(CHECKER_CLASS.REQUIRED)) {
                            _handleRequiredContent($target);
                        } else if ($target.hasClass(CHECKER_CLASS.DYNAMIC)) {
                            _handleDynamicContent($target)
                        }
                    }
                }
            }
        }

        /**
         * Handles tooltips for required elements
         * @param $target Target element which triggers the tooltip
         * @private
         */
        function _handleRequiredContent($target) {
            let dataPosition = $target.attr(ATTRIBUTE.DATA_POSITION);
            if (!dataPosition) {
                $target.attr(ATTRIBUTE.DATA_POSITION, "bottom");
            }

            let dataTooltip = $target.attr(ATTRIBUTE.DATA_TOOLTIP);
            let requiredText = tsMsg("de.techspring.label.required.tooltip");
            if (!dataTooltip) {
                $target.attr(ATTRIBUTE.DATA_TOOLTIP, requiredText);
            } else {
                let tooltipSuffix = " (" + requiredText + ")";
                if (dataTooltip !== requiredText && !dataTooltip.endsWith(tooltipSuffix)) {
                    dataTooltip += tooltipSuffix;
                    $target.attr(ATTRIBUTE.DATA_TOOLTIP, dataTooltip);
                }
            }
        }

        /**
         * Handles dynamic tooltips.
         *
         * @param $target Target element which triggers the tooltip
         * @private
         */
        function _handleDynamicContent($target) {
            let dynamicFrom = $target.attr(ATTRIBUTE.DYNAMIC_FROM);
            let content = "";

            if (dynamicFrom) {
                let $dynamicTarget = $target.find(dynamicFrom);

                if ($dynamicTarget.length) {
                    content = $dynamicTarget.val();
                } else {
                    console.error("Passed selector is invalid.", dynamicFrom);
                }
            } else {
                content = $target.val();
            }

            content = content.replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");

            $target.attr(ATTRIBUTE.DATA_TOOLTIP, content);
        }

        /**
         * Checks if the tooltip would have an empty content
         *
         * @param $target Target element which triggers the tooltip
         * @returns {boolean}
         */
        function emptyTooltip($target) {
            return !$target.length || (!$target.attr(ATTRIBUTE.DATA_TOOLTIP) && !$target.attr(ATTRIBUTE.HTML_DATA) && !$target.attr(ATTRIBUTE.HTML_FROM));
        }

        function hasDataPosition($target) {
            return $target.length && $target.attr(ATTRIBUTE.DATA_POSITION);
        }

        return GlobalTooltipHandler;
    }(jQuery);
})();
