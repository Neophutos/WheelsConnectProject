/**
 * Name: ts_spring_websocket.js
 *
 * Creator: Michael Heyer (mhy)
 *
 * Date: 2022-08-29 ff.
 *
 * Description: Javascript ts_spring_websocket.js implementation.
 *
 * Copyright (c) 2022 The TechSpring GmbH. All rights reserved.
 *
 */

(function () {
    if (!window.springWebsocketHandler) window.springWebsocketHandler = function ($) {

        const WEBSOCKET_APP_PREFIX = "/springQuery";
        const WEBSOCKET_ENDPOINT_DB_RESULT = "/dbresult";
        const WEBSOCKET_ENDPOINT_INFO_PANEL_RESULT = "/info-result";
        const WEBSOCKET_ENDPOINT_REF_COLUMN_RESULT = "/ref-column-result";

        const SpringWebsocketHandler = {
            connectOnStart: true,
            ws: null,
            activeTimers: [],
            responsive: false,
        }

        SpringWebsocketHandler.init = function () {
            materializetool.registerWebSocketCallback(WEBSOCKET_ENDPOINT_INFO_PANEL_RESULT, springWebsocketHandler.infoResultCallback);
            materializetool.registerWebSocketCallback(WEBSOCKET_ENDPOINT_DB_RESULT, springWebsocketHandler.dbResultCallback);
            materializetool.registerWebSocketCallback(WEBSOCKET_ENDPOINT_REF_COLUMN_RESULT, springWebsocketHandler.refColumnResultCallback);
            if (springWebsocketHandler.connectOnStart) {
                springWebsocketHandler.connect();
            }
        };

        SpringWebsocketHandler.connect = function () {
            let socket = new SockJS(WEBSOCKET_APP_PREFIX + WEBSOCKET_ENDPOINT_DB_RESULT);

            springWebsocketHandler.ws = StompJs.Stomp.over(socket);
            // disable debug
            springWebsocketHandler.ws.debug = () => {
            };

            springWebsocketHandler.ws.connect({}, function (frame) {
                springWebsocketHandler.ws.subscribe("/user/queue/errors", function (message) {
                    if (toastHandler != null) {
                        toastHandler.openError("Error " + message.body);
                    } else {
                        console.error("Error " + message.body);
                    }
                });

                springWebsocketHandler.ws.subscribe("/user/queue/reply", function (message) {
                    if (toastHandler != null) {
                        toastHandler.openNotice("Message " + message.body);
                    } else {
                        console.log("Message " + message.body);
                    }
                });

                springWebsocketHandler.ws.subscribe("/topic" + WEBSOCKET_ENDPOINT_REF_COLUMN_RESULT, function (message) {
                    materializetool.pushWebSocketMessage(WEBSOCKET_ENDPOINT_REF_COLUMN_RESULT, message, null);
                })

                springWebsocketHandler.ws.subscribe("/topic" + WEBSOCKET_ENDPOINT_DB_RESULT, function (message) {
                    materializetool.pushWebSocketMessage(WEBSOCKET_ENDPOINT_DB_RESULT, message, null);
                });

                springWebsocketHandler.ws.subscribe("/topic" + WEBSOCKET_ENDPOINT_INFO_PANEL_RESULT, function (message) {
                    materializetool.pushWebSocketMessage(WEBSOCKET_ENDPOINT_INFO_PANEL_RESULT, message, null);
                });

            }, function (error) {
                if (toastHandler != null) {
                    toastHandler.openError("STOMP error " + error);
                } else {
                    console.error("STOMP error " + error);
                }
            });
        }

        SpringWebsocketHandler.infoResultCallback = function (channel, message, event) {
            try {
                let parsed = JSON.parse(message.body);
                let panelConfig = JSON.parse(parsed.configuration);

                let infoPanel = $(parsed.tableSelector).closest(".query-container").find(".info-panel");

                let infoText = $(parsed.tableSelector).closest(".query-container").find(".info-panel").find(".info-text");

                infoText.text(panelConfig.text);
                infoPanel.show();

                springWebsocketHandler.activeTimers.push(panelConfig.queryId);
                const countDownDate = new Date().getTime();
                const x = setInterval(function () {
                    let now = new Date().getTime();
                    let distance = now - countDownDate;
                    let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                    let seconds = Math.floor((distance % (1000 * 60)) / 1000);
                    infoText.text(panelConfig.text + " (" + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0') + ")");

                    if (!springWebsocketHandler.activeTimers.includes(panelConfig.queryId)) {
                        clearInterval(x);
                    }
                }, 1000);


            } catch (e) {
                console.warn("handling dbresult message failed:", e);
            }
        }

        SpringWebsocketHandler.refColumnResultCallback = function (channel, message, event) {
            let parsed = JSON.parse(message.body);

            tablesFilter.refreshRefColumnsFromBackend(parsed);
        }

        SpringWebsocketHandler.dbResultCallback = function (channel, message, event) {
            try {
                let parsed = JSON.parse(message.body);
                let dataTableConfig = JSON.parse(parsed.configuration);

                resultTables.renderTablesFromJsonObject(dataTableConfig, parsed);

            } catch (e) {
                console.warn("handling dbresult message failed:", e);
            }
        }

        SpringWebsocketHandler.disconnect = function () {
            if (springWebsocketHandler.ws != null) {
                springWebsocketHandler.ws.close();
            }
            console.log("Disconnected");
        }

        SpringWebsocketHandler.sendMessage = function (queryId, message) {
            springWebsocketHandler.ws.send(WEBSOCKET_APP_PREFIX + WEBSOCKET_ENDPOINT_DB_RESULT, {}, JSON.stringify(
                {
                    'queryId': queryId == null ? "" : queryId,
                    'result': message == null ? "" : message,
                }
            ));
        }

        return SpringWebsocketHandler;
    }(jQuery);

    springWebsocketHandler.init();
})();