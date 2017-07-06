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

//////////////////////////////////////////////////////////////////////////
//  Namespace Definition
//////////////////////////////////////////////////////////////////////////

this.MuseUtils = this.MuseUtils || {};

//////////////////////////////////////////////////////////////////////////
//  Imports
//////////////////////////////////////////////////////////////////////////

if(!this.numbro) {
    include("numbro");
}

if(!MuseUtils.isMuseUtilsExceptionLoaded) {
    include("museUtilsException");
}

if(!MuseUtils.isMuseUtilsJsPolyfillLoaded) {
    include("museUtilsJsPolyfill");
}

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
        if(pDecimalPlaces === 0) {
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
            pLineEdit.setFormattedText(pLineEdit.getNumericValue());
        };

        pLineEdit.alignment = Qt.AlignRight;

        pLineEdit.getNumericValue = function() {
            // Parse the line with numbro and convert to a number.
            var vReturnValue = numbro()
                                .unformat(numbro(this.text)
                                            .format(vNumericFormat));

            // See if we have a number.  If so, return it.  If not, return
            // 0. NOTE:  This may need to be abstracted away to a
            // "getSaFeNumericValue" function.  Undefined in the case of no
            // number is more accurate, but inconvenient in that you're
            // always testing for it.
            if(MuseUtils.isNumber(vReturnValue)) {
                return  vReturnValue;
            } else {
                return 0;
            }
            
        };

        pLineEdit.setFormattedText = function(pValue) {
            if(!MuseUtils.isNumber(numbro().unformat(pValue))) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "This line edit widget requires a number value.",
                    "MuseUtils.numericLineEdit.setFormattedText",
                    {
                        params: {pValue: pValue}
                    });
            }

            this.text = numbro(pValue).format(vTextFormat);
        };

        if(pLineEdit.editingFinished !== undefined) {
            pLineEdit.editingFinished.connect(sEditingFinished);
        }
    };

    var createNumericLineEdit = function(pObjName, pParent, pDecimalPlaces) {
        // Capture function parameters for later exception references.
        var funcParams = {
            pObjName: pObjName,
            pParent: pParent,
            pDecimalPlaces: pDecimalPlaces
        };
        
        try {
            var targXLineEdit = toolbox.createWidget("XLineEdit",pParent, 
                pObjName);

            numericLineEdit(targXLineEdit, (pDecimalPlaces || 0));

            return targXLineEdit;
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "We found errors while trying to create a new numeric XLineEdit widget.",
                "MuseUtils.createNumericLineEdit",
                {params: funcParams, thrownError: e});
        }
    };

    var getModeFromXtpEnumId = function(pEnumId) {
        var modes = ["unknown","new","edit","view","copy","release","post",
        "replace"];
        
        if(pEnumId > 7 || pEnumId < 0) {
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
            if(MuseUtils.realNull(pLineEdit) === null ||
                !Number.isInteger(pDecimalPlaces)) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We require both a LineEdit widget and a number of decimal places.",
                    "MuseUtils.numericLineEdit",
                    {
                        params: {
                            pLineEdit: pLineEdit,
                            pDecimalPlaces: pDecimalPlaces
                        }
                    });
            }
    
            return numericLineEdit(pLineEdit, pDecimalPlaces);
        } catch(e) {
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
                });
        }
         
    };

    pPublicApi.createNumericLineEdit = function(pObjName, pParent, 
        pDecimalPlaces) {
        // Capture function parameters for later exception references.
        var funcParams = {
            pObjName: pObjName,
            pParent: pParent,
            pDecimalPlaces: pDecimalPlaces
        };

        if(!pObjName) {
            throw new MuseUtils.ParameterException(
                "musextputils",
                "We require that you provide an object name for your new numeric XLineEdit widget.",
                "MuseUtils.pPublicApi.createNumericLineEdit",
                {params: funcParams});
        }

        try {
            return createNumericLineEdit(pObjName, pParent, pDecimalPlaces);
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "We failed to properly create a numeric XLineEdit widget as requested.",
                "MuseUtils.pPublicApi.createNumericLineEdit",
                {params: funcParams, thrownError: e});
        }
    };

    pPublicApi.getModeFromXtpEnumId = function(pEnumId) {
        // Capture function parameters for later exception references.
        var funcParams = {
            pEnumId: pEnumId
        };
        
        if(!Number.isInteger(pEnumId) ||
            pEnumId < 0) {
            throw new MuseUtils.ParameterException(
                "musextputils",
                "We require an integer parameter in order to resolve the mode string.",
                "MuseUtils.pPublicApi.getModeFromXtpEnumId",
                {params: funcParams});
        }

        return getModeFromXtpEnumId(pEnumId);
    };

    // Set a flag indicating that this library is loaded.
    pPublicApi.isMuseUtilsQtLoaded = true;
    
})(MuseUtils);

