/**
 * Name: ts_chat.js
 *
 * Creator: Fabian Frank (ffr)
 *
 * Date: 16.04.2020 ff.
 *
 * Description: Javascript ts_chat.js implementation.
 *
 * Copyright (c) 2021 The TechSpring GmbH. All rights reserved.
 *
 * $Author$
 * $Revision$
 * $Date$
 * $Id$
 */

(function () {
    if (!window.chatTool) window.chatTool = function ($) {

        /**
         * Enumeration of chat specific selectors
         *
         */
        const selectors = {
            CHAT_ROOM_CONTAINER: ".chat-room-container",

            CHAT_CONTAINER: ".chat-container",                                                  // Container which holds chat specific elements
            CHAT_CONTAINER_MESSAGE_ACTION_BUTTONS: ".chat-container-message-action-buttons",    // Container which holds action buttons of the chat messages
            CHAT_MESSAGE_EDIT: ".chat-message-edit",                                            // Container which holds action buttons of the chat messages

            HEADER_TITLE: ".chat-room-header-title",                                            // Header container of the chat room
            CHAT_WINDOW: ".chat-view",                                                          // Container which holds the chat messages

            CHAT_INPUT_CONTAINER: ".chat-input-container",                                      // Container which holds the input elements of the chat room
            CHAT_INPUT_TEXTAREA: ".input-textarea",                                             // Chat input text area which is scrollable
            CHAT_SEND_BUTTON: ".send-button",                                                   // Send button. This element is included in the chat input container

            CHAT_INPUT_FIELD: ".message-input-field" ,                                          // Input field of the chat room
            CHAT_ACTION_BUTTONS_CONTAINER: ".chat-action-buttons"                               // Container which holds the action buttons of the chat room's input field
        }

        /**
         * @typedef {Object} ChatRoom
         * @property {Object} target - The scrollable target of the chat room
         * @property {number} scrollTo - Last saved scroll position
         */
        const chatRoomObject = {
            target: undefined,          // Holds the jQuery object of the scroll element
            scrollTo: undefined         // Defines the px to which will be scrolled. If it is negative, it will be scrolled to the end
        }

        const maxScrollPosition = 100000000000;

        /**
         * Attribute which is used to detect scrollable parents.
         *
         * This should be used if the scrollbar of the chat room is invisible. This might be caused because one of
         * its scrollable parents.
         */
        const scrollableAttribute = "scrollable-parent"

        /**
         * Attribute which is used to identify each chat room.
         * @type {string}
         */
        const chatRoomIdentifier = "chat-room-id";

        /**
         * Constants which hold existing event bound to the initialized chat rooms
         * @type {{edit: string, scroll: string}}
         */
        const chatRoomEvents = {
            "scroll": "scrollChat",
            "edit": "editChat"
        }

        /**
         * Help variable to hold the submitted chat room. This is maintained in the ajax functions.
         * @type {undefined}
         */
        let $submitChatRoom = undefined;

        /**
         * Holds all initialized chat room objects. The key is the chat room identifier and the value is the chat room
         * object
         *
         * @type {ChatRoom}
         */
        let activeChatRooms = {};

        const ChatTool = {

            /**
             * Initializes all existing chat rooms.
             */
            initializeChat : function() {
                let existingChatRooms = $(selectors.CHAT_ROOM_CONTAINER);

                if (existingChatRooms.length) {
                    existingChatRooms = existingChatRooms.toArray();

                    this.bindGlobalEvents()

                    this._evaluateScrollables(existingChatRooms)
                }
            },

            /**
             * Evaluates the scrollable element of each chat room.
             *
             * If the chat room html element has a valid attribute value of scrollable-parent, this will be used as
             * the scrollable element. If the element hasn't that attribute, it will be used instead.
             *
             * @private This function is called on initialization
             */
            _evaluateScrollables : function(chatRoomArray) {

                if (Array.isArray(chatRoomArray)) {
                    chatRoomArray.forEach((container) => {
                        let $container = $(container)

                        if ($container.length && !$container.hasClass("ts-initialized")) {
                            let $target;
                            let scrollableParentAttribute = $container.attr(scrollableAttribute)

                            if (scrollableParentAttribute) {
                                $target = $container.parents(scrollableParentAttribute)
                            } else {
                                $target = $container.find(selectors.CHAT_WINDOW)
                            }

                            if ($target.length) {
                                activeChatRooms[$container.attr(chatRoomIdentifier)] = {scrollTo: -1, target: $target}

                                $container.on(chatRoomEvents.scroll, {}, this._scrollToPosition)

                                $container.trigger(chatRoomEvents.scroll)
                                chatTool.focusChatTextarea($container);

                                $container.addClass("ts-initialized")
                            } else {
                                console.warn("No valid scrollable parent found of chat room ", $container)
                            }
                        }
                    })
                } else {
                    console.error("Couldn't evaluate scrollables because it is undefined/null or not of type array")
                }
            },

            /**
             * Binds global events to existing chat rooms
             */
            bindGlobalEvents : function() {
                const messageInputField = selectors.CHAT_ROOM_CONTAINER + " " + selectors.CHAT_INPUT_CONTAINER + " " + selectors.CHAT_INPUT_FIELD
                const editButton = selectors.CHAT_ROOM_CONTAINER + " " + selectors.CHAT_CONTAINER_MESSAGE_ACTION_BUTTONS + " " + selectors.CHAT_MESSAGE_EDIT

                const $document = $(document);

                $document.off(".chatEvents");

                $document.on({
                    'keydown.chatEvents': function(event) {
                        let originalEvent = event.originalEvent;

                        if(!originalEvent.shiftKey && originalEvent.which === 13) {
                            $(".send-button").click();
                            return false;
                        }

                        if (event.originalEvent.which === 8) {
                            event.stopImmediatePropagation();                               // Need to prevent bubbling up, because materialize recalculates the size (wrong outcome if the text has multiple lines)
                        }
                    }
                }, messageInputField)

                $document.on({
                    'keyup.chatEvents': function(event) {
                        let $textInputField = $(event.currentTarget);
                        let originalEvent = event.originalEvent;

                        if ($textInputField.length) {
                            if (originalEvent.which === 8) {
                                M.textareaAutoResize($textInputField)

                                event.stopImmediatePropagation();                               // Need to prevent bubbling up, because materialize recalculates the size (wrong outcome if the text has multiple lines)
                            } else if (originalEvent.shiftKey && originalEvent.which === 13 ||  // New line
                                       originalEvent.control && originalEvent.which === 86) {   // Copy
                                let $chatContainer = $textInputField.parents(selectors.CHAT_ROOM_CONTAINER);

                                if ($chatContainer.length) {
                                    chatTool.scrollToEnd($chatContainer);
                                }

                                let $scrollable = $textInputField.parents(selectors.CHAT_INPUT_TEXTAREA);

                                if ($scrollable.length) {
                                    $scrollable.scrollTop(maxScrollPosition)
                                }
                            }
                        }
                    }
                }, messageInputField)

                $document.on({
                    'click.chatEvents': chatTool._editChatMessage
                }, editButton)
            },

            /**
             * Is executed when the edit chat message event is triggered.
             *
             * @param e Event object propagated to this function
             * @private This function is automatically executed if the user edits a chat message
             */
            _editChatMessage : function(e) {
                if (e) {
                    let $eventTarget = $(e.currentTarget);

                    if ($eventTarget.length) {
                        let $chatMessageTarget = $eventTarget.parents(".chat-message")                          // Clicked chat message

                        if ($chatMessageTarget.length) {
                            let $chatContainer = $chatMessageTarget.parents(selectors.CHAT_ROOM_CONTAINER);

                            let $selectedChatMessage = $chatContainer.find(".chat-message.selected");           // Get already selected chat message(s)

                            if ($selectedChatMessage.length) {
                                if ($selectedChatMessage.length !== 1) {
                                    console.warn("More than one chat messages are selected")
                                } else if ($selectedChatMessage[0] !== $chatMessageTarget[0]) {
                                    $selectedChatMessage.removeClass("selected")
                                }
                            }

                            $chatMessageTarget.toggleClass("selected");

                            chatTool.saveCurrentScrollPosition($chatContainer);
                        }
                    }
                }
            },

            /**
             * Scrolls to the position. The required data is fetched via the jQuery .val() function. The chat room
             * has an object assigned to it which holds all necessary information to execute the function.
             *
             * @param e Event object, provided by the triggering point
             * @param resetScroll If true, the set scroll to value will be reset to the max possible scroll height
             * @private This function is automatically executed if the user submits a chat message
             */
            _scrollToPosition : function(e, resetScroll) {
                if (e) {
                    let $eventTarget = $(e.currentTarget);

                    if ($eventTarget.length) {
                        let chatRoom = chatTool.getChatRoom($eventTarget);

                        if (chatRoom && chatRoom.target) {
                            let $target = $(chatRoom.target);

                            if ($target.length) {
                                let scrollTo = chatRoom.scrollTo;

                                if (typeof scrollTo != "undefined") {
                                    if (scrollTo < 0) {
                                        $target.scrollTop(maxScrollPosition)         // Scrolls to the end
                                    } else {
                                        $target.scrollTop(scrollTo)
                                    }
                                } else {
                                    $target.scrollTop(maxScrollPosition)            // Scrolls to the end
                                }
                            }

                            if (typeof resetScroll !== "undefined" && resetScroll) {
                                chatRoom.scrollTo = -1
                            }
                        }
                    }
                }
            },

            /**
             * Is executed on edit ajax event. This function will be executed if the user edits a chat message
             *
             * @param event Event object passed by ajax
             */
            onEditAjaxEvent : function(event) {
                if (event.status === "success") {
                    let $chatContainer = $(event.source).parents(selectors.CHAT_ROOM_CONTAINER);

                    chatTool.focusChatTextarea($chatContainer)

                    if ($chatContainer.find(".chat-message.selected").length) {         // Nothing should happen on deselection
                        chatTool.scrollToEnd($chatContainer)
                    } else {
                        chatTool.setScrollTo($chatContainer, -1)                // Resets the set scroll position (will scroll to the end on submit)
                    }
                }
            },

            /**
             * Is executed on submit ajax event. This function will be executed if the user submits a chat message
             *
             * @param event Event object passed by ajax
             */
            onSubmitAjaxEvent : function(event) {
                if (event.status === "begin") {
                    $submitChatRoom = $(event.source).parents(selectors.CHAT_ROOM_CONTAINER);
                }

                if (event.status === "success") {

                    if (chatTool.validationFailed($submitChatRoom)) {
                        chatTool.scrollToEnd($submitChatRoom);
                    } else {
                        $submitChatRoom.trigger(chatRoomEvents.scroll, [true]);     // Triggers scroll event and resets the scroll position
                    }

                    chatTool.focusChatTextarea($submitChatRoom);
                }
            },

            /**
             * Focuses the input text of the chat room and set the selection range to the end of the input text.
             */
            focusChatTextarea : function($container) {
                if ($container instanceof jQuery) {
                    let $textArea = $container.find(selectors.CHAT_INPUT_FIELD);

                    if ($textArea.length) {
                        M.textareaAutoResize($textArea)

                        $textArea.focus();
                        $textArea[0].setSelectionRange($textArea.val().length, $textArea.val().length)

                        let $scrollableParent = $textArea.parents(selectors.CHAT_INPUT_TEXTAREA);

                        if ($scrollableParent.length) {
                            $scrollableParent.scrollTop(maxScrollPosition);
                        } else {
                            console.warn("focusChatTextarea: Couldn't scroll to the end because no scrollable " +
                                "parent was found for " + selectors.CHAT_INPUT_TEXTAREA)
                        }
                    }
                }
            },

            /**
             * Returns the associated chat object by the passed container.
             *
             * @param $chatRoomContainer Container of the chat room
             * @return {ChatRoom}
             */
            getChatRoom : function($chatRoomContainer) {
                let chatRoom = undefined;

                if ($chatRoomContainer instanceof jQuery) {
                    chatRoom = activeChatRooms[$chatRoomContainer.attr(chatRoomIdentifier)]
                }

                return chatRoom;
            },

            /**
             * Overwrites the save scroll to value of the passed chat room.
             *
             * @param $chatRoomContainer Container of the chat room
             * @param scrollTo New value which is used to overwrite
             */
            setScrollTo : function($chatRoomContainer, scrollTo) {
                if ($chatRoomContainer instanceof jQuery) {
                    let chatRoom = chatTool.getChatRoom($chatRoomContainer);

                    if (chatRoom) {
                        if (scrollTo >= 0) {
                            chatRoom.scrollTo = scrollTo;
                        } else if (chatRoom.target) {
                            chatRoom.scrollTo = maxScrollPosition;
                        }
                    }
                }
            },

            /**
             * Saves the current scroll position of the passed element's target.
             */
            saveCurrentScrollPosition : function($chatRoomContainer) {
                if ($chatRoomContainer instanceof jQuery) {
                    let chatRoom = chatTool.getChatRoom($chatRoomContainer)

                    if (chatRoom && chatRoom.target) {
                        let scrollPosition = chatRoom.target.scrollTop();

                        if (scrollPosition < 0) {
                            scrollPosition = maxScrollPosition;
                        }

                        chatTool.setScrollTo($chatRoomContainer, scrollPosition);
                    }
                }
            },

            /**
             * Scrolls to end of the passed element's target
             *
             * @param $chatRoomContainer Container element of the chat room
             */
            scrollToEnd : function($chatRoomContainer) {
               if ($chatRoomContainer instanceof jQuery) {
                   let chatRoom = chatTool.getChatRoom($chatRoomContainer)

                   if (chatRoom) {
                       if (chatRoom.target instanceof jQuery) {
                           chatRoom.target.scrollTop(maxScrollPosition)
                       }
                   }
               }
            },

            /**
             * Checks if the validation has failed
             *
             * @param $chatRoomContainer Container element of the chat room
             */
            validationFailed : function($chatRoomContainer) {
                let validationFailed = false;

                if ($chatRoomContainer instanceof jQuery) {
                    let $sendButton = $chatRoomContainer.find(selectors.CHAT_SEND_BUTTON);

                    if ($sendButton.length) {
                        validationFailed = $sendButton.attr("ts-validation-failed");
                    }
                }

                return validationFailed;
            }
        };

        return ChatTool;
    }(jQuery);
})();
