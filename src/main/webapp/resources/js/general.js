/**
 * Name: general.js
 *
 * Creator: Mirko Listemann (MLI)
 *
 * Date: 2015-03-30 ff.
 *
 * Description: Sammlung von allgemeinen Javascript-Funktionen.
 *
 * Copyright (c) 2015 The TechSpring GmbH. All rights reserved.
 *
 * $Author: Michael Heyer <michael.heyer@techspring.de> $
 * $Revision: 5a8ae0c9de2e3a08638b5fe71470d62ad6d93b13 $
 * $Date:   Thu Oct 12 13:41:50 2017 +0200 $
 * $Id: general.js | Thu Oct 12 13:41:50 2017 +0200 | Michael Heyer  $
 */

var globalEnterHotkeyId;
var globalCancelHotkeyId;
var winX;
var winY;

function doGetXY() {

    // all except Explorer
    if (self.innerHeight)
    {
        winX = self.innerWidth;
        winY = self.innerHeight;
    }

    // Explorer 6 Strict Mode
    else if (document.documentElement
          && document.documentElement.clientHeight) {
        winX = document.documentElement.clientWidth;
        winY = document.documentElement.clientHeight;
    }

    // other Explorers
    else if (document.body)
    {
        // not allowed IE 5.5
        if (document.body.clientWidth) {
            winX = document.body.clientWidth;
            winY = document.body.clientHeight;
        }
        else {
            winX = document.body.offsetWidth;
            winY = document.body.offsetHeight;
        }
    }
}

function getWinX() {
    doGetXY();
    return winX;
}

function getWinY() {
    doGetXY();
    return winY;
}

function getElementX(theElement) {

    var elementX = 0;

    // handover object
    if (theElement) {

        // all except Explorer
        if (theElement.innerWidth) {
            elementX = theElement.innerWidth;
        }

        // Explorer 6 Strict Mode
        else if (theElement.clientWidth) {
            elementX = theElement.clientWidth;
        }

        // other Explorers
        else if (theElement.offsetWidth) {
            elementX = theElement.offsetWidth;
        }
    }
    return elementX;
}

function getElementY(theElement) {

    var elementY = 0;

    // handover object
    if (theElement) {

        // all except Explorer
        if (theElement.innerHeight) {
            elementY = theElement.innerHeight;
        }

        // Explorer 6 Strict Mode
        else if (theElement.clientHeight) {
            elementY = theElement.clientHeight;
        }

        // other Explorers
        else if (theElement.offsetHeight) {
            elementY = theElement.offsetHeight;
        }
    }
    return elementY;
}

function getRunIntoIframe() {
    return window.frames.length != parent.frames.length;
}

function bindHotkey(enterHotkeyId, cancelHotkeyId) {
    jQuery(document).bind('keydown', clickControlOnKeydown);
    globalEnterHotkeyId = enterHotkeyId;
    globalCancelHotkeyId = cancelHotkeyId;
    return true;
}

function unbindHotkey() {
    jQuery(document).unbind('keydown', clickControlOnKeydown);
    return true;
}

function bindHotkeyInput(enterHotkeyId, cancelHotkeyId) {
//    console.log('bind hotkeys ' + baseName);
    globalEnterHotkeyId = enterHotkeyId;
    globalCancelHotkeyId = cancelHotkeyId;
    jQuery(document).bind('keypress', clickControlOnKeydownInput);
    return true;
}

function unbindHotkeyInput() {
//    console.log('unbind hotkeys');
    jQuery(document).unbind('keypress', clickControlOnKeydownInput);
    return true;
}

function bindHotkeyFunc(enterHotkeyFunc, cancelHotkeyFunc) {
//    console.log('bind hotkeys ' + baseName);
    jQuery(document).bind('keydown', clickControlOnKeydownFunc);
    globalEnterHotkeyId = enterHotkeyFunc;
    globalCancelHotkeyId = cancelHotkeyFunc;
    return true;
}

function unbindHotkeyFunc() {
//    console.log('unbind hotkeys');
    jQuery(document).unbind('keydown', clickControlOnKeydownFunc);
    return true;
}

function clickControlOnKeydown(event) {
    var elm;
    var keyCode = (event.keyCode ? event.keyCode : event.which);

    if (keyCode == 13) {
//        console.log('hotkey enter');
        if (event.target && (event.target.tagName.toUpperCase() == "TEXTAREA"
                          || (event.target.tagName.toUpperCase() == "INPUT" && event.target.type.toUpperCase() == "TEXT"))) {
            // no 'enter' hotkey in text input fields
            return true;
        }
        elm = jQuery("[id$=\"" + globalEnterHotkeyId + "\"]");
        if (elm.length > 0) {
            elm.click();
        }
        event.stopPropagation();
        unbindHotkey();
        return false;
    } else if (keyCode == 27) {
//        console.log('hotkey esc');
        elm = jQuery("[id$=\"" + globalCancelHotkeyId + "\"]");
        if (elm.length > 0) {
            elm.click();
        }
        event.stopPropagation();
        unbindHotkey();
        return false;
    } else {
//        console.log('hotkey ' + event.which);
    }
    return true;
}

function clickControlOnKeydownInput(event) {
    var elm;
    var keyCode = (event.keyCode ? event.keyCode : event.which);

    if (keyCode == 13) {
//        console.log('hotkey enter + ' + globalEnterHotkeyId);
        elm = jQuery("[id$=\"" + globalEnterHotkeyId + "\"]");
        if (elm.length > 0) {
            elm.get(0).click();
        }
        event.stopPropagation();
        unbindHotkeyInput();
        return false;
    } else if (keyCode == 27) {
//        console.log('hotkey esc');
        elm = jQuery("[id$=\"" + globalCancelHotkeyId + "\"]");
        if (elm.length > 0) {
            elm.get(0).click();
        }
        event.stopPropagation();
        unbindHotkeyInput();
        return false;
    } else {
//        console.log('hotkey ' + event.which);
    }
    return true;
}

function clickControlOnKeydownFunc(event) {
    var keyCode = (event.keyCode ? event.keyCode : event.which);
    if (keyCode == 13) {
//        console.log('hotkey enter + ' + globalEnterHotkeyId);
        if (typeof(globalEnterHotkeyId) == 'function') {
            globalEnterHotkeyId();
        }
        event.stopPropagation();
        unbindHotkeyFunc();
        return false;
    } else if (keyCode == 27) {
//        console.log('hotkey esc');
        if (typeof(globalCancelHotkeyId) == 'function') {
            globalCancelHotkeyId();
        }
        event.stopPropagation();
        unbindHotkeyFunc();
        return false;
    } else {
//        console.log('hotkey ' + event.which);
    }
    return true;
}

function autofocusInput(containerId) {
    if (containerId && containerId.length > 0) {
        var filterValue = 'input[id*=' + containerId + '],textarea[id*=' + containerId + ']:visible:first';
        var element = jQuery(filterValue);
        if (element) {
            element.focus();
        }
    }
}

function iconMouseOver(that) {
    that.style.cursor = 'default';
    if (that.src) {
        let old = that.src;
        that.src = old.replace(/_(normal|error|disabled|valid|invalid).png$/g, "_selected.png");
    }
    window.status = '';
    return true;
}

function buttonMouseOver(that) {
    if (that) {
        that.style.cursor = 'pointer';
        if (that.src) {
            let old = that.src;
            if (old) {
                that.src = old.replace(/_(normal|default|error|disabled).png$/g, "_selected.png");
            }
        }
    }
    window.status = '';
    return true;
}

function buttonMouseOut(that, type) {
    if (that) {
        that.style.cursor = 'auto';
        var old = that.src;
        if (old) {
            if (!type || type.length == 0) {
                type = "default";
            }
            that.src = old.replace(/_selected.png$/g, "_" + type + ".png");
        }
    }
    window.status = '';
    return true;
}

function checkInputTextLengthEvent(event, inputElem, maxLength) {
    if (!inputElem || (event && event.which == 13)) {
        return true;
    }
    checkInputTextLength(inputElem, maxLength)
}

function checkInputTextLength(inputElem, maxLength) {
    var outId = inputElem.id + "_ilc";
    var elems = jQuery("[id=\"" + outId + "\"]");
    if (inputElem && elems.length > 0) {
        var statusElem = elems.get(0);

        var statusMessage;
        var statusColor;
        var currLength = inputElem.value.length;
        if (currLength > 0) {
            currLength = maxLength - currLength;
            if (currLength > 0) {
                statusMessage = "...weitere " + currLength.toString() + " Eingabezeichen m\u00F6glich...";
                statusColor = "";
            } else if (currLength == 0) {
                statusMessage = "...max. m\u00F6gl. Eingabe von ";
                statusMessage += maxLength + " Zeichen erreicht...";
                statusColor = "#c25702";
            } else {
                statusMessage = "...max. m\u00F6gl. Eingabe von ";
                statusMessage += maxLength + " Zeichen \u00FCberschritten...";
                statusColor = "#b22222";
            }
            jQuery(statusElem).show();
        } else {
            statusMessage = "&nbsp;";
            statusColor = "";
            jQuery(statusElem).hide();
        }
        jQuery(statusElem).text(statusMessage);
        jQuery(statusElem).css({ 'color' : statusColor });
    }
    return true;
}

function hideInputTextLengthInfo(inputElem) {
    var outId = inputElem.id + "_ilc";
    var elems = jQuery("[id=\"" + outId + "\"]");
    if (inputElem && elems.length > 0) {
        var statusElem = elems.get(0);
        jQuery(statusElem).hide();
    }
    return true;
}

function hideAllInputTextLengthInfo() {
    var elements = jQuery("[id*='_ilc']");
    if (elements.length > 0) {
        jQuery(elements).hide();
    }
    return true;
}

var globalMouseX;
var globalMouseY;
var globalTTWidth;
var globalTTHeight;
var globalTTLeft;
var globalTTTop;
var globalOldMouseMove = null;
var globalTTShown = false;

function resizeTooltip(panelId, tableId) {
    if (globalTTShown) {
        return;
    }

    var panel = jQuery("[id$=\"" + panelId + "\"]");
    var table = jQuery("[id$=\"" + tableId + "\"]");
    var height = jQuery(window).height();
    height -= panel.offset().top + 20;
    if (height < 100) {
        height = 100;
    }
    if (height > (table.height() + 5)) {
        height = table.height() + 5;
        panel.width(table.width() + 5);
    }
    panel.height(height);

    globalTTHeight = panel.height();
    globalTTWidth = panel.width();
    globalTTLeft = panel.offset().left;
    globalTTTop = panel.offset().top;

    globalTTShown = true;
    globalOldMouseMove = document.onmousemove;
    jQuery(document).mousemove(function(e){
        globalMouseX = e.pageX;
        globalMouseY = e.pageY;
    });
}

function checkCloseTooltip(component) {
    if (globalTTShown) {
        if (globalMouseX >= globalTTLeft && globalMouseX < (globalTTLeft + globalTTWidth)
                && globalMouseY >= globalTTTop && globalMouseY < (globalTTTop + globalTTHeight)) {
            component.show();
        } else {
            document.onmousemove = globalOldMouseMove;
            globalTTShown = false;
        }
    }
}

function closeTooltip(component) {
    component.hide();
    if (globalTTShown) {
        document.onmousemove = globalOldMouseMove;
        globalTTShown = false;
    }
}

function insertLogicalOperation(comboId, op) {
    var elems = document.getElementsByTagName("input");

//    console.log("insertLogicalOperation " + comboId + " op " + op);
    enlargedFilterElem = null;

    if (elems) {
        for (var i = 0; i < elems.length; i++) {
            var elm = elems[i];
            var isinput = elm.name.match(comboId + "$");
            if (elm.type == 'text' && (elm.name.match(comboId + "comboboxField$") ||
                                       isinput)) {
                var txt = elm.value;
                if (txt.indexOf(op, txt.length - op.length) == -1) {
                    txt += op;
                }
                elm.value = txt;
                elm.focus();
                if (elm.setSelectionRange) {
                    elm.setSelectionRange(txt.length, txt.length);
                } else if (elm.createTextRange) {
                    var range = elm.createTextRange();
                    range.moveStart('character', txt.length);
                    range.select();
                }
                break;
            }
        }
    }
}