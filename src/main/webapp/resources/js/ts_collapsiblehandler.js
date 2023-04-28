/**
 * Name: ts_collapsiblehandler.js
 *
 * Creator: Fabian Frank (ffr)
 *
 * Date: 2020-03-23 ff.
 *
 * Description: Javascript ts_collapsiblehandler.js implementation.
 *
 * Copyright (c) 2022 The TechSpring GmbH. All rights reserved.
 *
 */

(function () {
    if (!window.collapsibleHandler) window.collapsibleHandler = function ($) {

        /**
         * It is mandatory to include ts_materialize.js to your project to use this class
         */
        if (typeof materializetool === "undefined") {
            alert("ERROR: Please include ts_materialize.js in your project")
        }

        /**
         * Available collapsible modes.
         *
         * Vertical: More than one collapsible can be opened. Collapsible headers are aligned vertically
         * Horizontal: Only on collapsible can be opened. Collapsible headers are aligned horizontally
         */
        const COLLAPSIBLE_MODE = {
            VERTICAL: 0,
            HORIZONTAL: 1
        }

        /**
         * Properties which are used to store data for processing.
         *
         * @type {{ID: string}}
         */
        const PROP = {
            ID: "COLLAPSIBLE_ID",
            CUSTOM_OPTIONS: "CUSTOM_OPTIONS"
        }

        /**
         * Attributes which are used while processing.
         */
        const ATTRIBUTES = {
            INITIALIZED: "ts-initialized",
            COLLAPSIBLE_ID: "collapsible-id",
            CUSTOM_OPTIONS: "collapsible-custom-options",
            TS_REFERENCE: "ts-ref"
        }

        /**
         * Selectors which are used while processing.
         */
        const SELECTOR = {
            COLLAPSIBLE_CONTAINER: "collapsible",
            COLLAPSIBLE_TOGGLE: "collapsible-toggle-icon",
            COLLAPSIBLE_HEADER: "collapsible-header",
            COLLAPSIBLE_BODY: "collapsible-body",
            TRIGGER_CLICK: "ts-trigger-click"
        }

        /**
         * Classes which are used to check states while processing.
         * @type {{ACTIVE: string, INACTIVE: string, CAN_TOGGLE: string, IS_EXPANDABLE: string, IS_HORIZONTAL_MODE: string}}
         */
        const CHECKERS = {
            API_ACTIVE: "supported-by-handler",                 // Style class: Activates preferences and storage
            IS_HORIZONTAL_MODE: "collapsible-tabs",
            ACTIVE: "active",
            INACTIVE: "non-active",
            CAN_TOGGLE: "collapsible-tabs-can-toggle",
            IS_EXPANDABLE: "expandable",
            NOT_SELECTABLE: "not-selectable"
        }

        /**
         * Includes functions to process associated preferences.
         */
        const PreferenceHandler = {

            /**
             * Generates a preference object by its associated collapsible object.
             * @param collapsible Collapsible object
             * @see collapsibleHandler.collapsibles
             * @returns {{mode, selectedLast: (string|*), active, id}}
             */
            generatePreference: function(collapsible) {
                return {
                    "id": collapsible.id,
                    "active": collapsible.active,
                    "mode": collapsible.mode,
                    "selectedLast": collapsible.selectedLast
                }
            },

            /**
             * Reads the preference of the passed collapsible jQuery object.
             * @param $collapsible jQuery object
             * @returns {{}}
             */
            read: function($collapsible) {
                let preference = {};

                if ($collapsible.length) {
                    const $collapsibleStateHiddenInput = $collapsible.prev("input[collapsible-state-hidden-input]");

                    if ($collapsibleStateHiddenInput.val()) {
                        let jsonObject = JSON.parse($collapsibleStateHiddenInput.val());

                        if (jsonObject && isSupported($collapsible)) {
                            preference = jsonObject;

                            let identifier = _evaluateCollapsibleIdentifier($collapsible);

                            if (preference.id !== identifier) {
                                preference.id = identifier;
                            }
                        }
                    }
                }

                return preference;
            },

            /**
             * Writes a preference of the passed collapsible jQuery object.
             * @param $collapsible jQuery object
             */
            write: function ($collapsible) {
                const collapsible = collapsibleHandler.collapsibles[$collapsible.prop(PROP.ID)];

                if (collapsible && isSupported($collapsible) && collapsible.parent) {
                    const $collapsibleStateHiddenInput = $(collapsible.parent).prev("input[collapsible-state-hidden-input]");

                    if ($collapsibleStateHiddenInput.length) {
                        $collapsibleStateHiddenInput
                            .val(JSON.stringify(PreferenceHandler.generatePreference(collapsible)))
                            .change();
                    }
                }
            }
        }

        const CollapsibleHandler = {

            /**
             * Storage for initialized collapsible elements.
             *
             * Attributes:
             *
             *  - id: Id of the collapsible. The id is evaluated on initialization
             *  - parent: The parent object of the collapsible (ul dom element as jQuery object)
             *  - children: The children objects of the parent (li dom elements as jQuery objects)
             *  - active: Indexes of the active children.
             *  - selectedLast: Index of the last activated child.
             *  - mode: The currently selected collapsible mode.
             */
            collapsibles: {
                "id": {
                    "id": "id",
                    "parent": "object",
                    "children": [
                        {
                            "id": "collapsible header id or xpath",
                            "element": "object"
                        }
                    ],
                    "active": [
                        "index",
                        "index"
                    ],
                    "selectedLast": "index of list element",
                    "mode": undefined
                }
            }
        }

        /**
         * Default object which is used for collapsible initialization.
         *
         * @see M.Collapsible
         */
        const CollapsibleDefaultOption = {
            accordion: false,
            inDuration: 0,
            outDuration: 0,

            onOpenEnd: _onOpenEnd,
            onCloseEnd: _onCloseEnd
        };

        /**
         * Default configuration object which is used for non-active collapsibles.
         *
         * @type {{accordion: boolean, outDuration: number, inDuration: number}}
         */
        const CollapsibleInactiveDefaultOption = {
            accordion: true,
            inDuration: 0,
            outDuration: 0,
        }

        let scrolledTo = false;         // Prohibits multiple scroll events in one initialization process

        CollapsibleHandler.init = function() {
            document.addEventListener('scroll', function (event) {
                let element = $(event.target);
                if (element.is("." + CHECKERS.CAN_TOGGLE + ":not(." + CHECKERS.IS_HORIZONTAL_MODE + ")")) {
                    element.find("> ." + SELECTOR.COLLAPSIBLE_TOGGLE).css("top", element.scrollTop()+"px")
                }
            }, true /*Capture event*/);
        }

        // --------------------------------------------------------------------
        // Initialization

        /**
         * Initializes all collapsibles which are in the dom tree and visible.
         */
        CollapsibleHandler.initializeCollapsibles = function() {
            let $collapsibleContainers = $(".{0}".format(SELECTOR.COLLAPSIBLE_CONTAINER));

            if ($collapsibleContainers.length) {
                $collapsibleContainers.toArray().forEach(collapsible => {
                    let $collapsible = $(collapsible);

                    if ($collapsible.length && $collapsible.children().length) {    // Checks if the jQuery object is initialized and isn't empty
                        _onInitialization($collapsible);

                        _onInitializationEnd($collapsible);
                    }
                })
            }

            _bindGlobalEvents();

            materializetool.delayedUpdateResponsiveTables(1000);       // Tables need to be updated. Sometimes the buttons are stuck on the left.

            scrolledTo = false;
        }

        /**
         * Scrolls to the last selected collapsible element.
         *
         * @param collapsibleInstance collapsible instance
         */
        CollapsibleHandler.scrollToLastSelected = function(collapsibleInstance) {
            if (collapsibleInstance) {

                /*
                 * If the collapsible instance has no set selected last, the smallest index in the active array will be
                 * selected
                 */
                if (typeof collapsibleInstance.selectedLast === "undefined" && collapsibleInstance.active.length) {
                    collapsibleInstance.selectedLast = Math.min(...collapsibleInstance.active);
                }

                let $scrollTo = collapsibleInstance.children[collapsibleInstance.selectedLast];

                if ($scrollTo.length) {
                    $scrollTo[0].scrollIntoView();
                }

                scrolledTo = true;
            } else {
                console.debug("Passed collapsible instance is undefined");
            }
        }

        /**
         * Initializes the passed collapsible.
         *
         * Order:
         *  1. Collapsible dom element will be prepared. Active collapsibles are determined.
         *  2. Local storage object will be created which is used to reset initial state and save preferences.

         * @param $collapsible jQuery object of the collapsible ul element
         * @param refreshInstance If the entity should be refreshed if it already exists
         * @returns {*}
         */
        CollapsibleHandler.initializeCollapsible = function ($collapsible, refreshInstance) {
            if (refreshInstance || !isInitialized($collapsible)) {
                _prepareCollapsibleDom($collapsible);                           // 1.

                collapsibleHandler.instantiateCollapsibleState($collapsible);   // 2.

                $collapsible.attr(TS_MATERIALIZED_ATTR_INITIALIZED, true);

                let options = $.extend(
                    true,
                    {},
                    _enhanceDefaultOption($collapsible),
                    _evaluateCustomOptions($collapsible)
                );

                return M.Collapsible.init(
                    $collapsible,
                    options);
            }
        }

        /**
         * Sets up the initial open state. Uses the collapsible instance to activate collapsibles.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         */
        CollapsibleHandler.setInitialOpenState = function ($collapsible) {
            let collapsible = collapsibleHandler.getCollapsibleByElement($collapsible);

            if (collapsible) {
                let instance = M.Collapsible.getInstance($collapsible);

                if (collapsible.mode === COLLAPSIBLE_MODE.VERTICAL) {
                    collapsible.children.forEach((_child, index) => {
                        jQuery.inArray(index, collapsible.active) >= 0 ? instance.open(index) : instance.close(index);
                    })
                } else {
                    let activeIndex = collapsible.active.length ? Math.min(...collapsible.active) : 0;  // Horizontal mode allows only one active collapsible

                    collapsible.children.forEach((_child, index) => {
                        activeIndex === index ? instance.open(index) : instance.close(index);
                    });
                }
            }
        }

        /**
         * Sets up initial collapsible mode of the passed collapsible.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         */
        CollapsibleHandler.setInitialMode = function ($collapsible) {
            let collapsibleId = $collapsible.attr(ATTRIBUTES.COLLAPSIBLE_ID);
            let collapsible = collapsibleHandler.collapsibles[collapsibleId];

            if (collapsible) {
                let isHorizontal = isHorizontalMode($collapsible);

                if (collapsible.mode === COLLAPSIBLE_MODE.VERTICAL && isHorizontal
                    || collapsible.mode === COLLAPSIBLE_MODE.HORIZONTAL && !isHorizontal) {

                    $collapsible.toggleClass(CHECKERS.IS_HORIZONTAL_MODE);
                }
            }
        }

        /**
         * Instantiates the collapsible state of the passed collapsible. The constructed object will be added to
         * the collapsible storage.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         */
        CollapsibleHandler.instantiateCollapsibleState = function($collapsible) {
            let jsonObject = {
                "parent": undefined,
                "children": [],
                "active": [],
                "mode": undefined,
                "selectedLast": undefined
            };

            jsonObject.parent = $collapsible;

            jsonObject = _evaluateCollapsibleHeaders($collapsible, jsonObject);

            if (jsonObject.children.length) {
                jsonObject = _evaluateSelectedLast($collapsible, jsonObject);
                jsonObject = _evaluateCollapsibleMode($collapsible, jsonObject);

                if ($collapsible.prop(PROP.ID)) {
                    jsonObject.id = $collapsible.prop(PROP.ID);

                    CollapsibleHandler.collapsibles[$collapsible.prop(PROP.ID)] = jsonObject;
                } else {
                    console.error("Collapsible has no valid x-path assigned.")
                }
            } else {
                console.warn("Collapsible doesn't have any headers.", $collapsible);
            }
        }

        // --------------------------------------------------------------------
        // visible convenience function(s)

        /**
         * Overwrites the selectedLast attribute of the collapsible associated with the passed list element.
         *
         * @param $listElement jQuery object (li dom element as jQuery)
         */
        CollapsibleHandler.overwriteSelectedLast = function ($listElement) {
            if ($listElement.length) {
                let $collapsible = collapsibleHandler.getCollapsibleByHeader($listElement);

                if ($collapsible.length) {
                    let collapsibleInstance = collapsibleHandler.getCollapsibleByElement($collapsible);

                    if (collapsibleInstance) {
                        collapsibleInstance.selectedLast = _getIndexOfHeader($listElement);

                        PreferenceHandler.write($collapsible);
                    }
                }
            }
        }

        /**
         * Opens collapsible element.
         *
         * @param $listElement jQuery object (li dom element as jQuery object)
         */
        CollapsibleHandler.openCollapsible = function ($listElement) {
            if ($listElement.length && isSelectable($listElement)) {
                if (!$listElement.hasClass(CHECKERS.ACTIVE)) {
                    let $collapsibleHeader = $listElement.children(".{0}".format(SELECTOR.COLLAPSIBLE_HEADER));

                    if ($collapsibleHeader.length) {
                        $collapsibleHeader.click();
                    }
                }

                collapsibleHandler.overwriteSelectedLast($listElement);
                $listElement[0].scrollIntoView();
            }
        }

        /**
         * Closes collapsible element.
         *
         * @param $listElement jQuery object (li dom element as jQuery object)
         */
        CollapsibleHandler.closeCollapsible = function ($listElement) {
            if ($listElement.length && isSelectable($listElement) && $listElement.hasClass(CHECKERS.ACTIVE)) {
                $listElement.children(SELECTOR.COLLAPSIBLE_HEADER).click();
            }
        }

        /**
         * Toggles collapsible active state.
         *
         * @param $listElement jQuery object (li dom element as jQuery object)
         */
        CollapsibleHandler.toggleCollapsibleOpenState = function ($listElement) {
            if ($listElement.length && isSelectable($listElement)) {
                $listElement.children(SELECTOR.COLLAPSIBLE_HEADER).click();
            }
        }

        /**
         * Returns associated collapsible instance by collapsible dom element.
         *
         * @see CollapsibleHandler.collapsibles
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @returns {*}
         */
        CollapsibleHandler.getCollapsibleByElement = function ($collapsible) {
            return collapsibleHandler.getCollapsibleById($collapsible.prop(PROP.ID));
        }

        /**
         * Returns associated collapsible instance by its id.
         *
         * @see CollapsibleHandler.collapsibles
         * @param collapsibleId Identifier of the collapsible
         * @returns {*}
         */
        CollapsibleHandler.getCollapsibleById = function(collapsibleId) {
            return CollapsibleHandler.collapsibles[collapsibleId];
        }

        /**
         * Returns parent of collapsible child (li dom element as jQuery object)
         * @param $listElement jQuery object (li dom element as jQuery object)
         * @returns {*}
         */
        CollapsibleHandler.getCollapsibleByHeader = function($listElement) {
            return $listElement.parent(".{0}".format(SELECTOR.COLLAPSIBLE_CONTAINER));
        }

        /**
         * Selects collapsible tab by passed list element selector
         *
         * @param collapsibleSelector Ul element selector
         * @param liSelector List element selector
         */
        CollapsibleHandler.selectCollapsibleTabByLiSelector = function(collapsibleSelector, liSelector) {
            let $collapsible = $(collapsibleSelector);
            if ($collapsible.length) {
                let $collapsibleLiElement = $collapsible.find("> li" + liSelector);
                let index = $collapsible.children("li").index($collapsibleLiElement);
                let instance = M.Collapsible.getInstance($collapsible);

                if (instance != null) {
                    instance.open(index);
                }
            }
        }

        /**
         * Selects collapsible tab.
         *
         * @param event Javascript event
         * @param collapsibleSelector Ul element selector
         * @param liSelector List element selector
         * @param deferredTimeout optional; Timeout for execution
         */
        CollapsibleHandler.selectCollapsibleTab = function(event, collapsibleSelector, liSelector, deferredTimeout) {
            if (event == null || event.status === 'success') {
                let selectFunction = function() {
                    collapsibleHandler.selectCollapsibleTabByLiSelector(collapsibleSelector, liSelector)
                };

                if (deferredTimeout) {
                    setTimeout(selectFunction, deferredTimeout);
                } else {
                    selectFunction();
                }
            }
        };

        /**
         * Closes all collapsibles via passed collapsible selector
         * @param collapsibleSelector valid css selector for identifying the collapsible dom element
         */
        CollapsibleHandler.closeAllCollapsibles = function(collapsibleSelector) {
            if (collapsibleSelector) {
                let $collapsible = $(collapsibleSelector);

                if ($collapsible.length) {
                    let instance = M.Collapsible.getInstance($collapsible);

                    if (instance) {
                        instance.close();                   // Closes all children via Materialize api
                    }

                    _deactivateChildren($collapsible);      // Keeps sure that no child element has the active class assigned
                }
            }
        }

        /**
         * Updates collapsibles headers according to currently selected collapsible mode.
         *
         * @param $collapsible jQuery object (li dom element as jQuery object)
         * @private
         */
        CollapsibleHandler.updateCollapsibleHeaders = function($collapsible) {
            let liWithLongNames = $collapsible.children("li[long-name]");

            liWithLongNames.each(function(_index, liElement) {
                let $liTextElement = $(liElement).find("> .collapsible-header .collapsible-header-text");

                if ($liTextElement.length === 1) {
                    let shortName = $(liElement).attr("short-name");
                    let longName = $(liElement).attr("long-name");
                    if (!shortName) {
                        shortName = longName;
                    }

                    let name;
                    if (isHorizontalMode($collapsible)) {
                        name = shortName;
                    } else {
                        name = longName;
                    }
                    $liTextElement.html(name);
                }
            });
        }

        // --------------------------------------------------------------------
        // action(s)

        /**
         * Prepares the passed collapsible dom element. This function is called on initialization.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @private
         */
        function _prepareCollapsibleDom($collapsible) {
            if ($collapsible.length) {
                _evaluateObjectProperties($collapsible);
                _addToggleElement($collapsible);
                _activateCollapsible($collapsible);
                _activateCollapsibleMode($collapsible);
                collapsibleHandler.updateCollapsibleHeaders($collapsible);
            } else {
                console.debug("Passed collapsible element is undefined");
            }
        }

        /**
         * Alters the active tab of a collapsible which is identified by one of its list elements.
         *
         * @param listElement List element of a collapsible
         * @param addMode Should the index of the element should be added. If false, it will be removed.
         * @private
         */
        function _alterActiveTabs(listElement, addMode) {
            let $listElement = $(listElement);

            let index = _getIndexOfHeader($listElement);
            let instance = collapsibleHandler.getCollapsibleByElement(
                collapsibleHandler.getCollapsibleByHeader($listElement)
            );

            if (index >= 0 && instance) {
                if (addMode) {
                    if (jQuery.inArray(index, instance.active) < 0) {
                        instance.active.push(index);
                    }

                    instance.selectedLast = index;
                } else {
                    if (jQuery.inArray(index, instance.active) >= 0) {
                        instance.active.splice(instance.active.indexOf(index), 1);
                    }

                    if (instance.active.length) {
                        instance.selectedLast = Math.min(...instance.active);
                    } else {
                        instance.selectedLast = undefined;
                    }
                }
            }
        }

        /**
         * Activated the collapsible mode of the passed collapsible element. This is used for ensuring the
         * synchronization of the dom tree elements and the held storage.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @private
         */
        function _activateCollapsibleMode($collapsible) {
            let preference = PreferenceHandler.read($collapsible);

            if (!jQuery.isEmptyObject(preference) && preference.mode !== undefined) {
                if (preference.mode === COLLAPSIBLE_MODE.VERTICAL) {
                    $collapsible.removeClass(CHECKERS.IS_HORIZONTAL_MODE);
                } else if (preference.mode === COLLAPSIBLE_MODE.HORIZONTAL) {
                    $collapsible.addClass(CHECKERS.IS_HORIZONTAL_MODE);
                } else {
                    console.warn("Collapsible mode is not supported. Mode {0}".format(preference.mode))
                }
            }
        }

        /**
         * Activates the collapsible which should be opened after initialization.
         *
         * Priority:
         *  1. Activates the first collapsible which has an error.
         *  2. If the url has a hash / an anchor. The content must be the id of an existing li element
         *  3. The collapsibles which are saved in the preferences are opened
         *  3. The first collapsible which has the class 'default-collapsible' will be opened.
         *  4. The first collapsible will be opened.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @private
         */
        function _activateCollapsible($collapsible) {
            _evaluateErrorsInCollapsible($collapsible);

            let $listElements = $collapsible.children("li:not(.{0})".format(CHECKERS.NOT_SELECTABLE));      // Fetches selectable list elements

            if ($listElements.length) {

                if (hasErrorCollapsibles($collapsible)) {                                                          // #1
                    adaptErrorCollapsibles($collapsible);
                } else if (hasLocationHash()) {                                                                    // #2
                    adaptLocationHash($collapsible)
                } else if (hasCollapsibleStorage($collapsible)) {
                    adaptCollapsibleStorage($collapsible);
                } else if (materializetool.useJavaPreferences) {                                                   // #3
                    adaptPreference($collapsible)
                } else {
                    if (hasDefaultCollapsible($collapsible)) {                                                     // #4
                        $($collapsible.children("li.default-collapsible")[0]).addClass("active");
                    } else {
                        $($collapsible.children("li")[0]).addClass("active");                                      // #5
                    }
                }

                let $activeListElements = $collapsible.children("li.active");

                if (isActive($collapsible) && !$activeListElements.length) {
                    $($listElements[0]).addClass("active");
                }
            }
        }

        /**
         * Marks error collapsibles as active.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         */
        function adaptErrorCollapsibles($collapsible) {
            if ($collapsible) {
                let $errors = $collapsible.children("li.has-error");

                if ($errors.length) {
                    $($errors[0]).addClass("active");
                }
            }
        }

        /**
         * Marks associated collapsible by location hash value as active.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         */
        function adaptLocationHash($collapsible) {
            if ($collapsible) {
                let rawAnchor = window.location.hash.replace("#", '');

                let $locationHashElements = $collapsible.children("li[id$='{0}']".format(rawAnchor));

                if ($locationHashElements.length) {
                    $($locationHashElements[0]).addClass("active");
                }
            }
        }

        /**
         * Marks collapsibles by preference as active.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         */
        function adaptPreference($collapsible) {
            if ($collapsible) {
                let preference = PreferenceHandler.read($collapsible);

                if (!jQuery.isEmptyObject(preference)) {
                    let selectedListElements = [];

                    let $listElements = $collapsible.children("li");

                    if ($listElements.length) {
                        for (let i = 0; i < $listElements.length; i++) {
                            if (jQuery.inArray(i, preference.active) >= 0) {
                                if (isSelectable($listElements.eq(i))) {
                                    selectedListElements.push($listElements.eq(i));

                                    if (preference.mode === COLLAPSIBLE_MODE.HORIZONTAL) {  // Only one tab can be active in horizontal mode
                                        break;
                                    }
                                }
                            }
                        }

                        /*
                         * Activates list elements.
                         *
                         * If no selected elements are found, the first selectable list element is marked as active.
                         */
                        if (selectedListElements.length) {
                            selectedListElements.forEach(selectedElement => {
                                selectedElement.addClass("active")
                            })
                        } else {
                            let elements = $listElements.toArray();

                            for (const element of elements) {
                                let $listElement = $(element);

                                if (isSelectable($listElement)) {
                                    $listElement.addClass("active")
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

        /**
         * Marks collapsibles by storage as active.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         */
        function adaptCollapsibleStorage($collapsible) {
            if ($collapsible) {
                let collapsibleStorage = collapsibleHandler.getCollapsibleByElement($collapsible);
                let $listElements = $collapsible.children("li");

                if ($listElements.length && collapsibleStorage.active.length) {
                    let indexes = [];

                    if (collapsibleStorage.mode === COLLAPSIBLE_MODE.VERTICAL) {
                        indexes = collapsibleStorage.active;
                    } else if (collapsibleStorage.mode === COLLAPSIBLE_MODE.HORIZONTAL) {
                        indexes.push(Math.min(...collapsibleStorage.active));
                    } else {
                        console.debug("Collapsible mode is not supported.", collapsibleStorage);
                    }

                    let listElements = $listElements.toArray();

                    indexes.forEach(index => {
                        let $listElement = $(listElements[index]);

                        if (isSelectable($listElement)) {
                            $listElement.addClass("active");
                        }
                    })
                }
            }
        }

        // --------------------------------------------------------------------
        // evaluation function(s)

        /**
         * Evaluates the last selected collapsible child (li dom element).
         *
         * Priority:
         *  1. Collapsible has preference and initialized value of selectedLast
         *  2. Collapsible has been initialized and information of selectedLast are held in storage
         *  3. The index of the first active collapsible child will be set as selectedLast
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @param jsonObject The json object which is created on initialization
         * @returns {*}
         * @private
         */
        function _evaluateSelectedLast($collapsible, jsonObject) {

            if (!hasErrorCollapsibles($collapsible) && !hasLocationHash()) {       // Errors and location hashes prevail
                let preference = PreferenceHandler.read($collapsible);

                if (!jQuery.isEmptyObject(preference) && preference.selectedLast !== undefined) {
                    jsonObject.selectedLast = preference.selectedLast;
                } else {
                    let collapsible = collapsibleHandler.getCollapsibleByElement($collapsible);

                    if (collapsible && collapsible.selectedLast !== undefined) {
                        jsonObject.selectedLast = collapsible.selectedLast;
                    }
                }
            }

            if (jsonObject.selectedLast === undefined) {
                jsonObject.selectedLast = Math.min(...jsonObject.active);
            }

            return jsonObject;
        }

        /**
         * Evaluates custom options of the passed collapsible.
         *
         * @param $collapsible jQuery object of the collapsible header (ul dom element)
         * @private
         */
        function _evaluateCustomOptions($collapsible) {
            let customOptionsStr = $collapsible.attr(ATTRIBUTES.CUSTOM_OPTIONS);
            let customOptions = materializetool.parseCustomOptions(customOptionsStr);

            let collapsible = collapsibleHandler.getCollapsibleByElement($collapsible);

            if (collapsible) {
                collapsible.customOptions = customOptions;
            }

            return materializetool.parseCustomOptions(customOptionsStr);
        }

        /**
         * Marks collapsible headers with 'error' if they hold a dom element with the class 'helper-text'. Either
         * the element isn't blank or it isn't invisible.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @private
         */
        function _evaluateErrorsInCollapsible($collapsible) {
            let listElements = $collapsible.children("li");

            if (listElements.length) {
                listElements.toArray().forEach(listElement => {
                    let $helper = $(listElement).find(".helper-text");

                    if ($helper.text().trim()
                        || ($helper.width() > 0 && $helper.height() > 0 && $helper.attr("data-error"))) {

                        $(listElement).addClass("has-error");

                        $(listElement)
                            .find("div[class*='collapsible-header'], div[class*='custom-collapsible-element']")
                            .addClass("error");
                    }
                })
            }
        }

        /**
         * Evaluates the view mode of the collapsible
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @param jsonObject to be enhanced object
         * @returns {*}
         * @private
         */
        function _evaluateCollapsibleMode($collapsible, jsonObject) {
            if ($collapsible.length) {
                jsonObject.mode = isHorizontalMode($collapsible)
                    ? COLLAPSIBLE_MODE.HORIZONTAL
                    : COLLAPSIBLE_MODE.VERTICAL;
            }

            return jsonObject;
        }

        /**
         * Evaluates the collapsible headers of the pass collapsible object.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @param jsonObject to be enhanced object
         * @returns {*}
         * @private
         */
        function _evaluateCollapsibleHeaders($collapsible, jsonObject) {
            if ($collapsible.length) {
                let $listElements = $collapsible.find("> li");

                if ($listElements.length) {
                    $listElements.toArray().forEach((listElement, index) => {
                        let $listElement = $(listElement);

                        jsonObject.children.push($listElement);

                        if ($listElement.hasClass(CHECKERS.ACTIVE)) {
                            jsonObject.active.push(index);
                        }
                    })
                }
            } else {
                console.error("Passed collapsible is invalid")
            }

            return jsonObject;
        }

        /**
         * Evaluates the object properties which are assigend to the passed collapsible.
         *
         * @see CollapsibleHandler.collapsibles
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @private
         */
        function _evaluateObjectProperties($collapsible) {
            $collapsible.prop(PROP.ID, _evaluateCollapsibleIdentifier($collapsible));

            let customOptionsString = $collapsible.attr(ATTRIBUTES.CUSTOM_OPTIONS);

            if (customOptionsString) {
                $collapsible.prop(PROP.CUSTOM_OPTIONS, materializetool.parseCustomOptions(customOptionsString))
            }
        }

        /**
         * Evaluates a unique identifier for the passed collapsible. That id is used for the local storage.
         *
         * Priority
         *  1. The collapsible element has the attribute COLLAPSIBLE_ID assigned to it.
         *  2. The collapsible has an id
         *  3. X-Path will be created for the passed collapsible which is unsecure and should be prohibited
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @returns {string|string}
         * @private
         */
        function _evaluateCollapsibleIdentifier($collapsible) {
            let identifier;

            if ($collapsible.attr(ATTRIBUTES.COLLAPSIBLE_ID)) {
                identifier = $collapsible.attr(ATTRIBUTES.COLLAPSIBLE_ID);
            } else if ($collapsible.attr(ATTRIBUTES.TS_REFERENCE)) {
                identifier = $collapsible.attr(ATTRIBUTES.TS_REFERENCE);
            } else if ($collapsible.attr("id")) {
                identifier = $collapsible.attr("id");
            } else {
                identifier = materializetool.createXPathFromElement($collapsible);
            }

            return identifier;
        }

        // --------------------------------------------------------------------
        // bound event function(s)

        /**
         * Binds global events to the body element. Includes delegate event functionalities.
         */
        function _bindGlobalEvents() {
            let $body = $("body");

            $body
                .off(".collapsible-toggle")
                .on("click.collapsible-toggle", ".{0}".format(SELECTOR.COLLAPSIBLE_TOGGLE), _onToggleCollapsibleMode)

            $body
                .off(".collapsible-header")
                .on("click.collapsible-header", ".{0}".format(SELECTOR.COLLAPSIBLE_HEADER), (event) => {
                    let $collapsibleHeader = $(event.target);
                    let $listElement = $collapsibleHeader.closest("li");

                    if ($listElement.length && $listElement.hasClass(CHECKERS.ACTIVE)) {    // Element exists and has been opened
                        let $collapsible = collapsibleHandler.getCollapsibleByHeader($listElement);
                        if (isSupported($collapsible)) {
                            event.target.scrollIntoView();
                        }
                    }
                })
        }

        /**
         * Is called on initialization.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @private
         */
        function _onInitialization($collapsible) {
            if (isSupported($collapsible) && isActive($collapsible)) {
                if (!isInitialized($collapsible)) {
                    collapsibleHandler.initializeCollapsible($collapsible);
                    PreferenceHandler.write($collapsible);
                } else {        // Collapsible is initialized. Tabs will be opened and mode will be set.
                    _deactivateChildren($collapsible);
                    collapsibleHandler.setInitialOpenState($collapsible);
                    collapsibleHandler.setInitialMode($collapsible);
                }

                collapsibleHandler.scrollToLastSelected(collapsibleHandler.getCollapsibleByElement($collapsible));
            } else {
                if (!isInitialized($collapsible)) {     // Collapsible is initialized without handler support
                    _prepareCollapsibleDom($collapsible);

                    let options = $.extend(
                        {},
                        CollapsibleInactiveDefaultOption,
                        _enhanceDefaultOption($collapsible),
                        _evaluateCustomOptions($collapsible)
                    );

                    M.Collapsible.init(
                        $collapsible,
                        options
                    );

                    $collapsible.attr(TS_MATERIALIZED_ATTR_INITIALIZED, true);
                }
            }
        }

        /**
         * Called on initialization end.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @private
         */
        function _onInitializationEnd($collapsible) {
            if ($collapsible.hasClass('set-new-element-active-when-added')) {
                const val = $collapsible
                    .parent()
                    .find('input[type=hidden]')
                    .val();
                if (val) {
                    $collapsible
                        .find('li[data-user-id=' + val + ']')
                        .find('.collapsible-header')
                        .click();
                }
            }

            collapsibleHandler.updateCollapsibleHeaders($collapsible);
        }

        /**
         * Executed when the collapsible mode changes through a click event. It changes the collapsible mode.
         *
         * @param event passed through event object.
         */
        function _onToggleCollapsibleMode(event) {
            let $collapsible = $(event.currentTarget).parent(".{0}".format(SELECTOR.COLLAPSIBLE_CONTAINER));

            if ($collapsible.length) {
                let collapsibleInstance = collapsibleHandler.getCollapsibleByElement($collapsible);
                let materializeInstance = M.Collapsible.getInstance($collapsible);

                if (materializeInstance) {
                    let mode;
                    if (isHorizontalMode($collapsible)) {
                        $collapsible.removeClass(CHECKERS.IS_HORIZONTAL_MODE);
                        mode = COLLAPSIBLE_MODE.VERTICAL;
                        materializeInstance.options.accordion = false;

                        $collapsible.find("> ." + SELECTOR.COLLAPSIBLE_TOGGLE).css("top", $collapsible.scrollTop()+"px")
                    } else {
                        $collapsible.addClass(CHECKERS.IS_HORIZONTAL_MODE);
                        mode = COLLAPSIBLE_MODE.HORIZONTAL;
                        materializeInstance.options.accordion = true;

                        if (!collapsibleInstance) {
                            // only one open tab allowed in horizontal mode
                            let isFirstActiveTab = true;
                            $collapsible.children("li").each(function (index, li) {
                                if ($(li).hasClass(CHECKERS.ACTIVE)) {
                                    if (isFirstActiveTab) {
                                        isFirstActiveTab = false;
                                    } else {
                                        materializeInstance.close(index);
                                    }
                                }
                            });
                        }

                        $collapsible.find("> ." + SELECTOR.COLLAPSIBLE_TOGGLE).css("top", "0")
                    }

                    if (collapsibleInstance) {
                        collapsibleInstance.mode = mode;
                        collapsibleHandler.setInitialOpenState($collapsible);       // Sets up initial open state
                        PreferenceHandler.write($collapsible)                       // Writes the new collapsible mode to associated preference
                    }
                } else {
                    console.debug("The collapsible hasn't been initialized or lost its state")
                }
            } else {
                console.error("Couldn't process event. No collapsible can be found by passed through event object", event);
            }
        }

        /**
         * Executed on the end of the collapsible opening process. This function is bound to each collapsible by its
         * configuration object.
         *
         * @param listElement Clicked li element of the collapsible
         * @private
         */
        function _onOpenEnd(listElement) {
            _alterActiveTabs(listElement, true);

            $("textarea.autoresize:visible").each(function(_index, textAreaElement) {
                M.textareaAutoResize(textAreaElement);
            });

            materializetool.delayedUpdateResponsiveTables(1000);

            PreferenceHandler.write($(listElement).parent("ul"));
        }

        /**
         * Executed on the end of the collapsible closing process. This function is bound to each collapsible by its
         * configuration object.
         *
         * @param listElement Clicked li element of the collapsible
         */
        function _onCloseEnd(listElement) {
            _alterActiveTabs(listElement, false);

            PreferenceHandler.write($(listElement).parent("ul"));
        }

        // --------------------------------------------------------------------
        // convenience function(s)

        /**
         * Checks if a location hash is set.
         *
         * @returns {""|number}
         */
        function hasLocationHash() {
            return window.location.hash && window.location.hash.replace(/[#!]/g, "").trim().length;
        }

        /**
         * Checks if the passed collapsible has a associated storage object.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @returns {*}
         */
        function hasCollapsibleStorage($collapsible) {
            return $collapsible.length && collapsibleHandler.getCollapsibleByElement($collapsible);
        }

        /**
         * Checks if any errors occurred in one of the collapsible children (li dom elements)
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @returns {*}
         */
        function hasErrorCollapsibles($collapsible) {
            return $collapsible.find("li.has-error").length;
        }

        /**
         * Checks if the element has a default collapsible.
         *
         * @param $collapsible jQuery object
         * @returns {*}
         */
        function hasDefaultCollapsible($collapsible) {
            return $collapsible.length && $collapsible.children("li.default-collapsible").length;
        }

        /**
         * Checks if the passed collapsible has the horizontal mode activated.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @returns {*}
         */
        function isHorizontalMode($collapsible) {
            return $collapsible.length && $collapsible.hasClass(CHECKERS.IS_HORIZONTAL_MODE);
        }

        /**
         * Checks if the collapsible element has been initialized.
         *
         * @see TS_MATERIALIZED_ATTR_INITIALIZED
         * @param $collapsible
         * @returns {*}
         */
        function isInitialized($collapsible) {
            return $collapsible.length
                && M.Collapsible.getInstance($collapsible)
                && $collapsible.attr(TS_MATERIALIZED_ATTR_INITIALIZED);
        }

        /**
         * Checks if the collapsible element is active.
         *
         * This is not the case if the collapsible element has the class 'non-active'.
         *
         * @see CHECKERS.INACTIVE
         * @param $collapsible jQuery object of the collapsible header (ul dom element)
         * @returns {boolean}
         */
        function isActive($collapsible) {
            return $collapsible.length && !$collapsible.hasClass(CHECKERS.INACTIVE);
        }

        /**
         * Checks if the passed list element is selectable
         *
         * @param $listElement jQuery object (li dom element as jQuery object)
         * @returns {boolean}
         */
        function isSelectable($listElement) {
            return $listElement.length && !$listElement.hasClass(CHECKERS.NOT_SELECTABLE);
        }

        /**
         * Checks if the passed collapsible is supported by the handler.
         *
         * If the collapsible is not supported, it will only be initialized via materialize.
         *
         * @param $collapsible jQuery object (li dom element as jQuery object)
         * @returns {*}
         */
        function isSupported($collapsible) {
            return $collapsible
                && $collapsible.hasClass(CHECKERS.API_ACTIVE);
        }

        /**
         * Deactivates all children of the passed collapsible. This function is used to synchronize the state of the children dom elements
         * with the held information by materialize.
         *
         * The class active will be removed from each child element.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @private
         */
        function _deactivateChildren($collapsible) {
            let $listElements = $collapsible.children("li");

            if ($listElements.length) {
                $listElements.toArray().forEach(listElement => {
                    $(listElement).removeClass("active");
                })
            }
        }

        /**
         * Gets the index of the list element / collapsible header.
         *
         * @param $listElement jQuery object
         * @returns {number} index
         * @private
         */
        function _getIndexOfHeader($listElement) {
            let index = -1;
            let $siblingElements = $listElement.parent(".{0}".format(SELECTOR.COLLAPSIBLE_CONTAINER)).children("li");

            if ($siblingElements.length) {
                for (let i = 0; i < $siblingElements.length; i++) {
                    if ($listElement[0] === $siblingElements[i]) {
                        index = i;
                        break;
                    }
                }
            }

            return index;
        }

        /**
         * Adds toggle element to the passed collapsible if it has the class "collapsible-tabs-can-toggle" assigned
         * to it.
         *
         * @param $collapsible
         * @private
         */
        function _addToggleElement($collapsible) {
            let canToggle = $collapsible.hasClass(CHECKERS.CAN_TOGGLE);
            let $toggleElement = $collapsible.children(".{0}".format(SELECTOR.COLLAPSIBLE_TOGGLE));

            if (canToggle) {
                if (!$toggleElement.length) {
                    $('<a data-position="bottom" data-tooltip="' + tsMsg('de.techspring.dialog.collapsible.toggle.tooltip') + '" class="tooltipped waves-effect waves-light btn collapsible-toggle-icon">' +
                        '  <i class="material-icons">tab_unselected</i>' +
                        '</a>').prependTo($collapsible);
                }
            } else {
                $toggleElement.remove();
            }
        }

        /**
         * Enhances the default collapsible object.
         *
         * @param $collapsible jQuery object (ul dom element as jQuery object)
         * @private
         */
        function _enhanceDefaultOption($collapsible) {
            let enhancement = {};
            let collapsibleInstance = collapsibleHandler.getCollapsibleByElement($collapsible);

            if (collapsibleInstance && !jQuery.isEmptyObject(collapsibleInstance)) {

                // If the collapsible is in horizontal mode, only one list element can be active at once
                enhancement.accordion = collapsibleInstance.mode === COLLAPSIBLE_MODE.HORIZONTAL
                    || !$collapsible.hasClass(CHECKERS.IS_EXPANDABLE);
            } else {
                enhancement.accordion = isHorizontalMode($collapsible)
                    || !$collapsible.hasClass(CHECKERS.IS_EXPANDABLE);
            }

            return Object.assign(CollapsibleDefaultOption, enhancement);
        }

        return CollapsibleHandler;
    }(jQuery);

    collapsibleHandler.init();
})();