/*************************************************************************
 *************************************************************************
 **
 ** File:        museUtilsQt.js
 ** Project:     Muse Systems xTuple Utilities
 ** Author:      Steven C. Buttgereit
 **
 ** (C) 2016-2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 **
 ** License: MIT License. See LICENSE.md for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/
try {
    //////////////////////////////////////////////////////////////////////////
    //  Namespace Definition
    //////////////////////////////////////////////////////////////////////////

    if (typeof MuseUtils === "undefined") {
        throw new Error(
            "Please do load utility modules directly.  See museUtils.js for the loading methodology."
        );
    }

    MuseUtils.loadMuseUtils([
        MuseUtils.MOD_NUMBRO,
        MuseUtils.MOD_EXCEPTION,
        MuseUtils.MOD_JSPOLYFILL,
        MuseUtils.MOD_JS
    ]);
} catch (e) {
    if (
        typeof MuseUtils !== "undefined" &&
        (MuseUtils.isMuseUtilsExceptionLoaded === true ? true : false)
    ) {
        var error = new MuseUtils.ScriptException(
            "musextputils",
            "We encountered a script level issue while processing MuseUtils Mod Qt.",
            "MuseUtils",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );

        MuseUtils.displayError(error, mainwindow);
    } else {
        QMessageBox.critical(
            mainwindow,
            "MuseUtils Script Error",
            "We encountered a script level issue while processing MuseUtils Mod Qt."
        );
    }
}

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi, pGlobal) {
    try {
        //--------------------------------------------------------------------
        //  Private Functional Logic
        //--------------------------------------------------------------------
        var numericLineEdit = function(pLineEdit, pDecimalPlaces) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pLineEdit: pLineEdit,
                pDecimalPlaces: pDecimalPlaces
            };

            // Get format values of the correct length.
            var vNumericFormat;
            var vTextFormat;
            if (pDecimalPlaces === 0) {
                vNumericFormat = "0";
                vTextFormat = "0,0";
            } else {
                vNumericFormat = "0.";
                vTextFormat = "0,0.";
                for (var i = 0; i < pDecimalPlaces; i++) {
                    vNumericFormat = vNumericFormat + "0";
                    vTextFormat = vTextFormat + "0";
                }
            }

            var sEditingFinished = function() {
                pLineEdit.setFormattedText(pLineEdit.getNumericValue(true));
            };

            pLineEdit.alignment = Qt.AlignRight;

            pLineEdit.getNumericValue = function(pIsNullOnNonNumber) {
                // See if the caller is OK with null values, legacy is false
                // so any non-understood value will be treated as though we're
                // expecting the legacy.
                pIsNullOnNonNumber = pIsNullOnNonNumber === true ? true : false;

                // Parse the line with numbro and convert to a number.
                var vReturnValue = numbro().unformat(
                    numbro(this.text).format(vNumericFormat)
                );

                if (MuseUtils.isNumber(vReturnValue)) {
                    return vReturnValue;
                } else if (pIsNullOnNonNumber) {
                    return null;
                } else {
                    return 0;
                }
            };

            pLineEdit.setFormattedText = function(pValue) {
                if (!MuseUtils.isNumber(numbro().unformat(pValue))) {
                    if (typeof this.clear === "function") {
                        this.clear();
                    } else {
                        this.text = null;
                    }
                } else {
                    this.text = numbro(pValue).format(vTextFormat);
                }
            };

            if (pLineEdit.editingFinished !== undefined) {
                pLineEdit.editingFinished.connect(sEditingFinished);
            }
        };

        var createNumericLineEdit = function(
            pObjName,
            pParent,
            pDecimalPlaces
        ) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pObjName: pObjName,
                pParent: pParent,
                pDecimalPlaces: pDecimalPlaces
            };

            try {
                var targXLineEdit = toolbox.createWidget(
                    "XLineEdit",
                    pParent,
                    pObjName
                );

                numericLineEdit(targXLineEdit, pDecimalPlaces || 0);

                return targXLineEdit;
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We found errors while trying to create a new numeric XLineEdit widget.",
                    "MuseUtils.createNumericLineEdit",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        var getModeFromXtpEnumId = function(pEnumId) {
            var modes = [
                "unknown",
                "new",
                "edit",
                "view",
                "copy",
                "release",
                "post",
                "replace"
            ];

            if (pEnumId > 7 || pEnumId < 0) {
                return modes[0];
            } else {
                return modes[pEnumId];
            }
        };

        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------
        pPublicApi.numericLineEdit = function(pLineEdit, pDecimalPlaces) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pLineEdit: pLineEdit,
                pDecimalPlaces: pDecimalPlaces
            };

            try {
                // Validate our input
                if (
                    MuseUtils.realNull(pLineEdit) === null ||
                    !Number.isInteger(pDecimalPlaces)
                ) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We require both a LineEdit widget and a number of decimal places.",
                        "MuseUtils.numericLineEdit",
                        { params: funcParams },
                        MuseUtils.LOG_WARNING
                    );
                }

                return numericLineEdit(pLineEdit, pDecimalPlaces);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.numericLineEdit",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        pPublicApi.createNumericLineEdit = function(
            pObjName,
            pParent,
            pDecimalPlaces
        ) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pObjName: pObjName,
                pParent: pParent,
                pDecimalPlaces: pDecimalPlaces
            };

            if (!pObjName) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We require that you provide an object name for your new numeric XLineEdit widget.",
                    "MuseUtils.pPublicApi.createNumericLineEdit",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            try {
                return createNumericLineEdit(pObjName, pParent, pDecimalPlaces);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We failed to properly create a numeric XLineEdit widget as requested.",
                    "MuseUtils.pPublicApi.createNumericLineEdit",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        pPublicApi.getModeFromXtpEnumId = function(pEnumId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pEnumId: pEnumId
            };

            if (!Number.isInteger(pEnumId) || pEnumId < 0) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We require an integer parameter in order to resolve the mode string.",
                    "MuseUtils.pPublicApi.getModeFromXtpEnumId",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            return getModeFromXtpEnumId(pEnumId);
        };

        // Set a flag indicating that this library is loaded.
        pPublicApi.isMuseUtilsQtLoaded = true;
    } catch (e) {
        var error = new MuseUtils.ModuleException(
            "musextputils",
            "We enountered a MuseUtils Qt module error that wasn't otherwise caught and handled.",
            "MuseUtils",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );
        MuseUtils.displayError(error, mainwindow);
    }
})(MuseUtils, this);
