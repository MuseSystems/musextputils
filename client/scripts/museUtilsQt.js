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

    //////////////////////////////////////////////////////////////////////////
    //  Imports
    //////////////////////////////////////////////////////////////////////////

    MuseUtils.loadMuseUtils([
        MuseUtils.MOD_NUMBRO,
        MuseUtils.MOD_EXCEPTION,
        MuseUtils.MOD_JSPOLYFILL
    ]);

    //////////////////////////////////////////////////////////////////////////
    //  Module Defintion
    //////////////////////////////////////////////////////////////////////////

    (function(pPublicApi) {
        //--------------------------------------------------------------------
        //  "Private" Functional Logic
        //--------------------------------------------------------------------
        var numericLineEdit = function(pLineEdit, pDecimalPlaces) {
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
                    { params: funcParams, thrownError: e }
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
                        {
                            params: {
                                pLineEdit: pLineEdit,
                                pDecimalPlaces: pDecimalPlaces
                            }
                        }
                    );
                }

                return numericLineEdit(pLineEdit, pDecimalPlaces);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.numericLineEdit",
                    {
                        params: {
                            pLineEdit: pLineEdit,
                            pDecimalPlaces: pDecimalPlaces
                        },
                        thrownError: e
                    }
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
                    { params: funcParams }
                );
            }

            try {
                return createNumericLineEdit(pObjName, pParent, pDecimalPlaces);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We failed to properly create a numeric XLineEdit widget as requested.",
                    "MuseUtils.pPublicApi.createNumericLineEdit",
                    { params: funcParams, thrownError: e }
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
                    { params: funcParams }
                );
            }

            return getModeFromXtpEnumId(pEnumId);
        };

        // Set a flag indicating that this library is loaded.
        pPublicApi.isMuseUtilsQtLoaded = true;
    })(MuseUtils);
} catch (e) {
    QMessageBox.critical(
        mainwindow,
        "Muse Systems xTuple Utilities",
        "We failed loading the Qt utilities. \n\n" + e.message
    );
}
