(function () {
    if (!window.tsEchartHandler) window.tsEchartHandler = function ($) {
        let defaultDataLoaded = false;

        let fileAllocation = {};

        const TsEChartHandler = {
            selectors: {
                CONTAINER: ".e-chart-container",
                INITIALIZE_ON_LOAD: ".initialize-on-load"
            },
            attributes: {
                E_CHART_JSON: "e-chart-json",
                E_CHART_AUTOFILL_JSON: "e-chart-autofill-json",
                E_CHART_TYPE: "e-chart-type",
                E_CHART_RENDERER: "e-chart-renderer"
            },

            /**
             * Expand, if new default chart data are implemented.
             *
             * Please ensure to use the same key as in defaultRadarCharts.json
             */
            defaultData: {
                E_CHART_RADAR: null
            }
        }

        /**
         * Initializes the class and the existing e charts which should be rendered instantly
         *
         * @returns {Promise<void>}
         */
        TsEChartHandler.initialize = async function () {
            let eChartsElements = $(tsEchartHandler.selectors.CONTAINER + tsEchartHandler.selectors.INITIALIZE_ON_LOAD);

            if (typeof echarts !== "undefined") {
                if (eChartsElements.length) {
                    if (!defaultDataLoaded) {
                        await tsEchartHandler._loadEChartFilePaths();
                        await tsEchartHandler._loadDefaultValues();
                        defaultDataLoaded = true;
                    }

                    eChartsElements.toArray().forEach(eChart => {
                        tsEchartHandler.initializeEChart(eChart);
                    })
                }
            } else {
                console.error("The required files seem to not be integrated. " +
                    "Please ensure to integrate the required files to your project")
            }
        }

        /**
         * Initialized the passed eChart. The type of chart is determined by the e-chart-type which the passed eChart
         * dom element needs to hold
         *
         * @param eChart dom element which holds the attribute e-chart-type
         * @returns {*|jQuery|HTMLElement}
         * @private
         */
        TsEChartHandler.initializeEChart = function(eChart) {
            let $eChart = $(eChart);

            if ($eChart.length) {
                if (!$eChart.hasClass("ts-initialized")) {
                    let type = $eChart.attr(tsEchartHandler.attributes.E_CHART_TYPE);

                    if (tsEchartHandler.isPresent(type)) {
                        let jsonObj = null;

                        switch (type.toLowerCase()) {
                            case "radar":
                                jsonObj = tsEchartHandler.initializeRadarChart($eChart);
                                break;
                            default:
                                console.warn(`Given type is not yet supported. Type: ${type}`);
                        }

                        if (jsonObj !== null) {
                            let initOptions = {};

                            let renderer = $eChart.attr(tsEchartHandler.attributes.E_CHART_RENDERER);
                            if (tsEchartHandler.isPresent(renderer)) {
                                initOptions["renderer"] = renderer;
                            }

                            let chart = echarts.init($eChart[0], null, initOptions);
                            chart.setOption(jsonObj);

                            $eChart.addClass("ts-initialized");
                        } else {
                            console.warn("Couldn't initialize eChart. ", eChart)
                        }
                    } else {
                        console.warn(`Couldn't instantiate passed echart, because it hasn't a valid type. ` +
                            `Please ensure to assign a valid type to ${tsEchartHandler.attributes.E_CHART_TYPE}`);
                    }
                }
            } else {
                console.warn(`Couldn't initialize passed element. EChart ${eChart}`);
            }

            return $eChart;
        }

        /**
         * Constructs the eChar object for the initialization.
         *
         * @param eChart Container element which holds the required attributes
         */
        TsEChartHandler.initializeRadarChart = function(eChart) {
            let $eChart = $(eChart);
            let jsonObject = null;
            const maxWordLength = 45;    // Maximal character length of legend and chart text. Set to 0 in order to deactivate slicing.

            if ($eChart.length) {
                let constructedJSON = $eChart.attr(tsEchartHandler.attributes.E_CHART_JSON);
                let autofillJSON = $eChart.attr(tsEchartHandler.attributes.E_CHART_AUTOFILL_JSON);

                if (tsEchartHandler.isPresent(constructedJSON)) {
                    try {
                        jsonObject = JSON.parse(constructedJSON);

                        if (tsEchartHandler.isPresent(autofillJSON) && tsEchartHandler.isPresent(tsEchartHandler.defaultData.E_CHART_RADAR)) {
                            jsonObject = tsEchartHandler.mergeDeep(tsEchartHandler.defaultData.E_CHART_RADAR, jsonObject)
                        }

                        if (maxWordLength > 0) {
                            jsonObject["legend"]["formatter"] = function(data){ return data.length > maxWordLength ? data.slice(0, maxWordLength) + "..." : data; };
                        }


                        let indicators = jsonObject["radar"]["indicator"];

                        for (let indicator of indicators) {
                            if (tsEchartHandler.isPresent(indicator["text"]) && maxWordLength > 0 && indicator["text"].length > maxWordLength) {
                                indicator["text"] = indicator["text"].slice(0, maxWordLength).trim() + "...";
                            }
                        }
                    } catch (exc) {
                        console.error(`Couldn't parse to extracted json. Please validate the backend function. Exception: ${exc}`)
                    }
                }
            }

            return jsonObject;
        }

        /**
         * Fetches the eChart file paths.
         *
         * @returns {*|jQuery}
         * @private
         */
        TsEChartHandler._loadEChartFilePaths = function() {
            return $.getJSON("../resources/js/echarts/helper/defaultRadarCharts.json", function(data) {
                if (tsEchartHandler.isPresent(data)) {
                    fileAllocation = data;
                } else {
                    console.warn("Data is undefined");
                }
            });
        }

        /**
         * Evaluates the default eChart data paths and fetches the according data
         *
         * @returns {Promise<boolean>}
         * @private
         */
        TsEChartHandler._loadDefaultValues = async function () {
            if (fileAllocation !== {}) {
                for (const [key, value] of Object.entries(fileAllocation)) {
                    console.log(`Trying to fetch data for ${key}`);

                    if (typeof value === "string") {
                        await $.getJSON(value, function(data) {
                            console.log(`Fetched data for key. Data: ${JSON.stringify(data)}`);
                            tsEchartHandler.defaultData[key] = data;
                        })
                    } else {
                        console.log("Couldn't fetch data for key, because its value isn't a string")
                    }
                }
            } else {
                console.warn("The fileAllocation variable hasn't been initialized properly.")
            }
        }

        /**
         * Reloads all EChart elements allocated on the current site
         *
         * @returns {Promise<void>}
         */
        TsEChartHandler.reloadECharts = async function() {
            let eChartsElements = $(tsEchartHandler.selectors.CONTAINER + ":visible");

            if (eChartsElements.length) {
                eChartsElements.toArray().forEach(eChart => {
                    let $eChart = $(eChart);

                    if ($eChart.hasClass("ts-initialized")) {
                        $eChart.removeClass("ts-initialized");
                        echarts.dispose($eChart[0]);
                    }

                    tsEchartHandler.initializeEChart($eChart);
                })
            }
        }

        /**
         * Move to helper/common javascript class
         *
         * Performs a deep merge of objects and returns new object. Does not modify
         * objects (immutable) and merges arrays via concatenation.
         *
         * Source: https://stackoverflow.com/a/48218209
         *
         * @param {...object} objects - Objects to merge
         * @returns {object} New object with merged key/values
         */
        TsEChartHandler.mergeDeep = function(...objects) {
            const isObject = obj => obj && typeof obj === 'object';

            return objects.reduce((prev, obj) => {
                if (tsEchartHandler.isPresent(obj)) {
                    Object.keys(obj).forEach(key => {
                        const pVal = prev[key];
                        const oVal = obj[key];

                        if (Array.isArray(pVal) && Array.isArray(oVal)) {
                            prev[key] = [...pVal, ...oVal].filter((element, index, array) => array.indexOf(element) === index);
                        }
                        else if (isObject(pVal) && isObject(oVal)) {
                            prev[key] = tsEchartHandler.mergeDeep(pVal, oVal);
                        }
                        else {
                            prev[key] = oVal;
                        }
                    });
                }

                return prev;
            }, {});
        }

        TsEChartHandler.isPresent = function(obj) {
            return obj !== null && typeof(obj) !== "undefined";
        }

        return TsEChartHandler;

    }(jQuery);

    $(document).ready(function() {
        tsEchartHandler.initialize();
    });

})();