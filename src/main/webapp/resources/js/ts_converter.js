
$(document).ready(function() {

    const converters = {
        RAW_NUMBER: "ts-raw-number",
        RAW_TEXT: "ts-raw-text",
        RAW_FLOAT: "ts-raw-float"
    }

    console.log("Initialization JS-Events");

    activateConverters();       // Initialization of converters


    function activateConverters() {
        $("body").on("change", ".ts-converter", function(event) {
            let $originalTarget = $(event.currentTarget);

            if ($originalTarget.length) {
                let convertedText = null;

                if ($originalTarget.hasClass(converters.RAW_TEXT)) {
                    convertedText = rawText($originalTarget);
                } else if ($originalTarget.hasClass(converters.RAW_NUMBER)) {
                    convertedText = rawDigits($originalTarget);
                } else if ($originalTarget.hasClass(converters.RAW_FLOAT)) {
                    convertedText = rawFloat($originalTarget);
                }

                if (convertedText) {
                    $originalTarget.val(convertedText)
                }

            } else {
                console.error("activateConverters: Original target is undefined");
            }
        })
    }

    function rawText($element) {
        return $element.val().trim().replaceAll(/\d/g, "");
    }

    function rawDigits($element) {
        return $element.val().trim().replaceAll(/[^\d]/g, "");
    }

    function rawFloat($element) {
        return $element.val().trim().replaceAll(/[^.,\d]/g, "");
    }
})
