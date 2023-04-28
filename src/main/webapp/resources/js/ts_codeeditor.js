/**
 * Name: ts_codeeditor.js
 *
 * Creator: Michael Heyer (mhy)
 *
 * Date: 2022-10-9 ff.
 *
 * Description: Javascript ts_^codeeditor.js implementation.
 *
 * Copyright (c) 2022 The TechSpring GmbH. All rights reserved.
 *
 * $Author$
 * $Revision$
 * $Date$
 * $Id$
 */

(function () {
    if (!window.codeeditortool) window.codeeditortool = function ($) {
        let CodeEditorTool = {
            editors: [],

            initCodeEditors: function(selector) {
                if (typeof(CodeMirror) === 'undefined') {
                    return;
                }

                if (selector == null) {
                    selector = ".ts-codeeditor";
                }

                let $codeMirrors = $(selector);
                $codeMirrors.each(function(index, codeMirrorElement) {
                    let $codeMirror = $(codeMirrorElement);
                    if (materializetool.debug) console.log("init codemirror " + materializetool.createXPathFromElement(codeMirrorElement));

                    codeeditortool.initCodeEditor($codeMirror);
                });
            },

            initCodeEditor: function(selector) {
                if (typeof(CodeMirror) === 'undefined') {
                    return;
                }

                if (materializetool.debug) console.log("init codeeditor ", selector);

                const $codeEditor = $(selector);
                if ($codeEditor.attr(TS_MATERIALIZED_ATTR_INITIALIZED)) {
                    return;
                }

                $codeEditor.attr(TS_MATERIALIZED_ATTR_INITIALIZED, "true");

                const disabled = $codeEditor.is(":disabled");

                const defaultOptions = {
                    indentUnit: 4,
                    indentWithTabs: true,
                    smartIndent: true,
                    lineWrapping: true,
                    matchBrackets: false,
                    cursorBlinkRate: (disabled ? -1 : 530),
                    gutters: ["CodeMirror-lint-markers"],
                    lint: {
                        "async" : true,
                        "tooltips" : true
                    },
                    autofocus: true,
                    readOnly: disabled,
                    lineNumbers: true,
                    scrollbarStyle: "simple"
                };

                const customOptionsStr = $codeEditor.attr("codeeditor-custom-options");
                const customOptions = materializetool.parseCustomOptions(customOptionsStr);

                let options = $.extend(true, {},
                    defaultOptions,
                    customOptions
                );

                let editor = CodeMirror.fromTextArea($codeEditor.get(0), options);
                editor.on("blur", function(editor) {
                    if (editor != null) {
                        editor.save();
                    }
                });

                // refresh editor
                setTimeout(function() {
                    editor.refresh();
                }, 500);

                let codeEditorSelector = $codeEditor.attr("codeeditor-selector");
                if (codeEditorSelector != null) {
                    codeeditortool.editors[codeEditorSelector] = editor;
                }
            },
        };

        return CodeEditorTool;
    }(jQuery);
})();
