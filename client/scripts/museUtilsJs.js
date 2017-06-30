/*************************************************************************
 *************************************************************************
 **
 ** File:        museUtilsJs.js
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

if(!MuseUtils.isMuseUtilsJsPolyfillLoaded) {
    include("museJsPolyfill");
}

if(!MuseUtils.isMuseUtilsExceptionLoaded) {
    include("museUtilsException");
}

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi) {


    //--------------------------------------------------------------------
    //  "Private" Functional Logic
    //--------------------------------------------------------------------
    var isTrue = function(pBoolString) {
      if(pBoolString === undefined || pBoolString === null) {
        pBoolString = false;
      }

      return  ('t' == pBoolString.toString().toLowerCase().substring(0,1));
    }; 

    var realNull = function(pValue) {
        if(pValue === undefined || 
            pValue === null || 
            (typeof pValue === "string" && pValue === "")) {
            return null;
        } else {
            return pValue;
        }
    };

    var setJsDefault = function(pCurrentValue, pDefaultValue) {
        
        if(pCurrentValue === null || pCurrentValue === undefined) {
            return pDefaultValue;
        } else {
            return pCurrentValue;
        }

    };

    var isNumber = function(pCandidateValue) {
        return Number.isFinite(pCandidateValue) || 
                (Number.isFinite(Number(pCandidateValue)) && 
                    typeof pCandidateValue === 'string');
    };

    var coalesce = function(pArguments) {
        // Check to see if we got arguments.  Exit if we didn't.
        if(pArguments.length < 1) {
            return null;
        }

        // Now loop through the arguments and return the first one that is not
        // null.
        for(var i = 0; i < pArguments.length; i++) {
            if(realNull(pArguments[i]) !== null) {
                return pArguments[i];
            }
        }

        // If we get here, we are just null.  So return null.
        return null;
    };

    // Stricter parseInt related function for the purpose of changing strings
    // to integers or returning NaN if it isn't strictly and int.
    // Function taken from: 
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt
    // and is in the public domain per the licensing terms at:
    // https://developer.mozilla.org/en-US/docs/MDN/About#Copyrights_and_licenses
    var filterInt = function(value) {
        if (/^(\-|\+)?([0-9]+|Infinity)$/.test(value)) {
            return Number(value);
        } else {
            return NaN;
        }
    };

    var isValidId = function(pCandidateId) {
        var testVal = filterInt(pCandidateId);
        if(Number.isInteger(testVal) && testVal > 0) {
            return true;
        } else {
            return false;
        }
    };

    var getNormalizedString = function(pText) {
        return pText.replace(/'/g,'')
                    .replace(/[^\w]+/g,'_')
                    .replace(/^_|_$/,'')
                    .toLowerCase();
    };

    var parseParams = function(pParams) {
        if(realNull(pParams) === null) {
            return null;
        }

        return JSON.parse(
                JSON.stringify(pParams,
                    function(key, value) {
                        return value.valueOf();
                    }));
    };

    var getCleanTextLine = function(pText) {
        if(coalesce(pText,"") === "") {
            return null;
        }

        return pText.replace(/\r?\n|\r|\t/g," ")
                    .replace(/ +/g," ")
                    .replace(/^ +| +$/g,"");
    };

    //--------------------------------------------------------------------
    //  Public Interface -- Functions
    //--------------------------------------------------------------------

    pPublicApi.isTrue = function(pBoolString) {
        // Capture function parameters for later exception references.
        var funcParams = {
            pBoolString: pBoolString
        };

        try {
            return isTrue(pBoolString);
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during the execution of an API call.",
                "MuseUtils.pPublicApi.isTrue",
                {params: funcParams, thrownError: e});
        }
    };

    pPublicApi.realNull = realNull;

    pPublicApi.setJsDefault = function(pCurrentValue, pDefaultValue) {
        try {
            if(pDefaultValue === null || pDefaultValue === undefined) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We require a non-null/non-undefined value as a default.  If you require default or null, don't use this function.",
                    "MuseUtils.setJsDefault",
                    {
                        params: {
                            pCurrentValue: pCurrentValue,
                            pDefaultValue: pDefaultValue
                        }
                    });
            }
    
            return setJsDefault(pCurrentValue, pDefaultValue);
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during the execution of an API call.",
                "MuseUtils.pPublicApi.setJsDefault",
                {
                    params: {
                            pCurrentValue: pCurrentValue,
                            pDefaultValue: pDefaultValue
                        },
                    thrownError: e
                });
        }
    };

    pPublicApi.isNumber = function(pCandidateValue) {
        try {
            return isNumber(pCandidateValue);
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during the execution of an API call.",
                "MuseUtils.pPublicApi.isNumber",
                {
                    params: {
                            pCandidateValue: pCandidateValue
                        },
                    thrownError: e
                });
        }
    };

    pPublicApi.coalesce = function() {
        try {
            return coalesce(arguments);        
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during the execution of an API call.",
                "MuseUtils.pPublicApi.coalesce",
                {
                    params: {
                            arguments: arguments
                        },
                    thrownError: e
                });
        }
    };

    pPublicApi.isValidId = function(pCandidateId) {
        try {
            return isValidId(pCandidateId);
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during the execution of an API call.",
                "MuseUtils.pPublicApi.isValidId",
                {
                    params: {
                            pCandidateId: pCandidateId
                        },
                    thrownError: e
                });
        }
    };

    pPublicApi.getNormalizedString = function(pText) {
        // Capture function parameters for later exception references.
        var funcParams = {
            pText: pText
        };
        
        try {
            if(pText == "undefined" || pText === null) {
                // We don't assume to know that a meaningless value is right or
                // wrong so we won't intentially blow up here... we'll take
                // measures to ensure that we don't unintentially blow up,
                // however.
                return getNormalizedString("");
            } else {
                return getNormalizedString(pText);
            }
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during the execution of an API call.",
                "MuseUtils.pPublicApi.getNormalizedString",
                {params: funcParams, thrownError: e});
        }
    };

    pPublicApi.parseParams = function(pParams) {
        // Capture function parameters for later exception references.
        var funcParams = {
            pParams: pParams
        };
        
        try {
            return parseParams(pParams);
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during the execution of an API call.",
                "MuseUtils.pPublicApi.parseParams",
                {params: funcParams, thrownError: e});
        }
    };

    pPublicApi.getCleanTextLine = function(pText) {
        // Capture function parameters for later exception references.
        var funcParams = {
            pText: pText
        };
        
        try {
            return getCleanTextLine(pText);
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during the execution of an API call.",
                "MuseUtils.pPublicApi.getCleanTextLine",
                {params: funcParams, thrownError: e});
        }
    };

    // Set a flag indicating that this library is loaded.
    pPublicApi.isMuseUtilsJsLoaded = true;

})(MuseUtils);

