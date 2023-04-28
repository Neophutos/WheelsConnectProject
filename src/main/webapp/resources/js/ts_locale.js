/**
 * Name: ts_locale.js
 *
 * Creator: Michael Heyer (mhy)
 *
 * Date: 2018-03-07 ff.
 *
 * Description: Javascript ts_locale.js implementation.
 *
 * Copyright (c) 2018 The TechSpring GmbH. All rights reserved.
 *
 * $Author$
 * $Revision$
 * $Date$
 * $Id$
 */

(function () {
    "use strict";
    if (!window.tsLocale) {
        window.tsLocale = function ($) {
            var TsLocale = {
                language: navigator.language || navigator.userLanguage,
                globalizer: null,
                loadCompleteCallbacks: []
            };

            TsLocale.msg = function(msg) {
                if (!msg) {
                    return;
                }

                msg = msg.replace(/\./g, "/");
                let values = [];
                for (let aidx = 1; aidx < arguments.length; aidx++) {
                    values.push(arguments[aidx]);
                }

                let gl;
                if (tsLocale.globalizer) {
                    gl = tsLocale.globalizer;
                } else {
                    try {
                        gl = Globalize(tsLocale.language);
                    } catch (ex) {
                        gl = null;
                    }
                }
                try {
                    msg = gl.formatMessage(msg, values);
                } catch (ex) {
                    try {
                        msg = Globalize("en").formatMessage(msg, values);
                    } catch (ex2) {
                        console.error("message not found: " + msg + " : " + ex2.message);
                    }
                }
                return msg;
            };

            TsLocale.parseDate = function(dateValue, dateFormat) {
                let parser = tsLocale.globalizer.dateParser({raw: dateFormat});
                return parser(dateValue);
            };

            TsLocale.formatDate = function(dateValue, options) {
                let formatter = tsLocale.globalizer.dateFormatter(options);
                return formatter(dateValue);
            };

            TsLocale.formatDateMedium = function(dateValue) {
                let formatedDateString;
                let parser = tsLocale.globalizer.dateParser({datetime: "medium"});
                let formatter = tsLocale.globalizer.dateFormatter({datetime: "medium"});
                let d = parser(dateValue.replace(" ",", "));
                if (d) {
                    formatedDateString = formatter(d);
                } else {
                    formatedDateString = dateValue;
                }

                return formatedDateString;
            };

            TsLocale.formatNumber = function(numberValue, maxNumberOfFractionalDigits, minNumberOfFractionalDigits, useGrouping) {
                maxNumberOfFractionalDigits = maxNumberOfFractionalDigits || 0;
                if (minNumberOfFractionalDigits == null) {
                    minNumberOfFractionalDigits = maxNumberOfFractionalDigits;
                }
                useGrouping = useGrouping == null ? true : useGrouping;
                let formatterOptions = {
                    minimumFractionDigits: minNumberOfFractionalDigits,
                    maximumFractionDigits: maxNumberOfFractionalDigits,
                    useGrouping: useGrouping
                }
                let formattedNumberString;
                if (minNumberOfFractionalDigits !== '0') {
                    formattedNumberString = tsLocale.globalizer.numberFormatter(formatterOptions)(Number(numberValue));
                } else {
                    formattedNumberString = '' + numberValue;
                }
                return formattedNumberString;
            };

            TsLocale.formatNumberToHumanReadableSi = function(size, si, suffix) {
                suffix = suffix || 'B';
                let unit = si ? 1000 : 1024;
                if (size < unit) {
                    return size + " B";
                }
                let exp = Math.floor(Math.log(size) / Math.log(unit));
                let pre = (si ? "kMGTPE" : "KMGTPE").charAt(exp-1) + (si ? "" : "i");
                return ((Math.round(size * 10 / Math.pow(unit, exp)) / 10) + " " + pre + suffix);
            };

            TsLocale.currentLocale = function() {
                var locale = "en";
                if (this.globalizer && this.globalizer.cldr && this.globalizer.cldr.attributes) {
                    locale = this.globalizer.cldr.attributes.minlanguageId || "en";
                }
                return locale;
            };

            TsLocale.loadJSON = function(url) {
                $.ajax({
                    url: url,
                    type: 'GET',
                    async: false,
                    success: function(data) {
                        Globalize.load(data);
                    }
                });
            };

            TsLocale.init = function() {
                tsLocale.globalizer = Globalize;
                $(window).on("languagechange", function(event) {
                    tsLocale.language = navigator.language || navigator.userLanguage;
                    console.log("language changed " + tsLocale.language);
                    try {
                        svgEditor.putLocale(tsLocale.language);
                    } catch (ex) {
                        console.error("cannot initialize editor language " + tsLocale.language);
                    }
                    try {
                        tsLocale.globalizer = new Globalize(tsLocale.language);
                    } catch (ex) {
                        console.error("cannot initialize language " + tsLocale.language);
                        tsLocale.language = "en";
                        try {
                            tsLocale.globalizer = new Globalize(tsLocale.language);
                        } catch (ex2) {
                            console.error("cannot initialize default language " + tsLocale.language);
                            tsLocale.globalizer = Globalize;
                        }
                    }
                });
                console.log("load globalize data");

                $.ajaxSetup({
                    async: false
                });

                let ts = new Date().getTime();
                let tsdata = {_: ts};

                if (typeof(window.pagePrefix) === 'undefined') {
                    window.pagePrefix = "";
                }

                $.when(
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/supplemental/likelySubtags.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/supplemental/calendarData.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/supplemental/timeData.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/supplemental/numberingSystems.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/supplemental/weekData.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/supplemental/plurals.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/supplemental/ordinals.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/supplemental/currencyData.json", tsdata, function(data){Globalize.load(data)} ),
        
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/de/numbers.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/de/currencies.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/de/ca-gregorian.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/de/timeZoneNames.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/de/dateFields.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/de/units.json", tsdata, function(data){Globalize.load(data)} ),
        
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/en/numbers.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/en/currencies.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/en/ca-gregorian.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/en/timeZoneNames.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/en/dateFields.json", tsdata, function(data){Globalize.load(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/globalize/cldr/main/en/units.json", tsdata, function(data){Globalize.load(data)} ),

                    $.getJSON(window.pagePrefix + "resources/js/messages_de.json", tsdata, function(data){Globalize.loadMessages(data)} ),
                    $.getJSON(window.pagePrefix + "resources/js/messages_en.json", tsdata, function(data){Globalize.loadMessages(data)} )
                ).then(function() {
                    try {
                        tsLocale.globalizer = new Globalize(tsLocale.language);
                    } catch (ex) {
                        console.error("cannot initialize Globalize with language " + tsLocale.language + ": " + ex.message);
                        tsLocale.globalizer = Globalize;
        
                    }
                    console.log("globalize loaded");

                    for (let callBack of tsLocale.loadCompleteCallbacks) {
                        if (typeof(callBack) === 'function') {
                            callBack();
                        }
                    }
                });

                $.ajaxSetup({
                    async: true
                });
            };

            return TsLocale;
        }(jQuery);

        tsLocale.init();
    }
})();

function tsMsg(msg) {
    return tsLocale.msg.apply(null, arguments);
}