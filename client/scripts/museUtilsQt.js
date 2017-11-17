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
        MuseUtils.NUMBRO,
        MuseUtils.EXCEPTION,
        MuseUtils.JSPOLYFILL
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
                pLineEdit.setFormattedText(pLineEdit.getNumericValue());
            };

            pLineEdit.alignment = Qt.AlignRight;

            pLineEdit.getNumericValue = function() {
                // Parse the line with numbro and convert to a number.
                var vReturnValue = numbro().unformat(
                    numbro(this.text).format(vNumericFormat)
                );

                // See if we have a number.  If so, return it.  If not, return
                // 0. NOTE:  This may need to be abstracted away to a
                // "getSaFeNumericValue" function.  Undefined in the case of no
                // number is more accurate, but inconvenient in that you're
                // always testing for it.
                if (MuseUtils.isNumber(vReturnValue)) {
                    return vReturnValue;
                } else {
                    return 0;
                }
            };

            pLineEdit.setFormattedText = function(pValue) {
                if (!MuseUtils.isNumber(numbro().unformat(pValue))) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "This line edit widget requires a number value.",
                        "MuseUtils.numericLineEdit.setFormattedText",
                        {
                            params: { pValue: pValue }
                        }
                    );
                }

                this.text = numbro(pValue).format(vTextFormat);
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

        var initSaveHookFramework = function(pNativeSaveFunc, pParent) {
            return (function(pNativeSaveFunc, pParent) {
                // Internal State for Save Event Hook Framework
                var nativeSaveFunction = pNativeSaveFunc;
                var saveHookParentWidget = pParent;
                var preSaveEventFuncs = [];
                var postSaveEventFuncs = [];

                var addPreSaveHookFunc = function(pFunc) {
                    preSaveEventFuncs.push(pFunc);
                };

                var removePreSaveHookFunc = function(pFunc) {
                    preSaveEventFuncs = preSaveEventFuncs.filter(function(
                        targFunc
                    ) {
                        return targFunc != pFunc;
                    });
                };

                var addPostSaveHookFunc = function(pFunc) {
                    postSaveEventFuncs.push(pFunc);
                };

                var removePostSaveHookFunc = function(pFunc) {
                    postSaveEventFuncs = postSaveEventFuncs.filter(function(
                        targFunc
                    ) {
                        return targFunc != pFunc;
                    });
                };

                var runSaveHookFunctions = function() {
                    // Execute the pre-save hook functions.  If we fail a pre-save hook,
                    for (var i1 = 0; i1 < preSaveEventFuncs.length; i1++) {
                        try {
                            preSaveEventFuncs[i1]();
                        } catch (e) {
                            // Roll everything back if possible
                            toolbox.executeRollback();

                            // If we have pre-save exceptions, we abort the save process.
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We found an error while executing a 'pre-save' hook function.  We will abort the save that you requested.",
                                "MuseUtils.initSaveHookFramework.runSaveHookFunctions",
                                { thrownError: e }
                            );
                        }
                    }

                    // Run the native function.
                    try {
                        nativeSaveFunction();
                    } catch (e) {
                        throw new MuseUtils.ApiException(
                            "musextputils",
                            "We caught an error trying trying to run the native form's save function.  We abort here as our state is indeterminate.",
                            "MuseUtils.initSaveHookFramework.runSaveHookFunctions",
                            { thrownError: e }
                        );
                    }

                    // Run the post save hooks.  For these we only display and log the message
                    // since we expect that the native save function executed correctly.
                    for (var i2 = 0; i2 < postSaveEventFuncs.length; i2++) {
                        try {
                            postSaveEventFuncs[i2]();
                        } catch (e) {
                            // If we have pre-save exceptions, we abort the save process.
                            var myError = new MuseUtils.ApiException(
                                "musextputils",
                                "We found an error while executing a 'post-save' hook function.  The record you are saving has been saved, though there may be problems, especially with any custom module that also must save information.  Please be sure to double check the record you just saved for accurracy.",
                                "MuseUtils.initSaveHookFramework.runSaveHookFunctions",
                                {
                                    thrownError: myError,
                                    context: {
                                        preSaveEventFuncs: preSaveEventFuncs,
                                        postSaveEventFuncs: postSaveEventFuncs
                                    }
                                }
                            );

                            // A rare example of a display error in a utility function; we
                            // do this here since we want proper exception logging, but we
                            // don't want to raise a general exception which will blow up
                            // the process.
                            MuseUtils.displayError(
                                myError,
                                saveHookParentWidget
                            );
                        }
                    }
                };

                var setNativeSaveFunc = function(pFunc) {
                    nativeSaveFunction = pFunc;
                };

                return {
                    addPreSaveHookFunc: function(pFunc) {
                        // Capture function parameters for later exception references.
                        var funcParams = {
                            pFunc: pFunc
                        };

                        if (typeof pFunc !== "function") {
                            throw new MuseUtils.ParameterException(
                                "musextputils",
                                "We require a valid function to add to the pre-save event hook.",
                                "MuseUtils.initSaveHookFramework.public.addPreSaveHookFunc",
                                { params: funcParams }
                            );
                        }

                        try {
                            addPreSaveHookFunc(pFunc);
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We encountered an error trying to add a pre-save event hook function.",
                                "MuseUtils.initSaveHookFramework.public.addPreSaveHookFunc",
                                { params: funcParams, thrownError: e }
                            );
                        }
                    },
                    removePreSaveHookFunc: function(pFunc) {
                        // Capture function parameters for later exception references.
                        var funcParams = {
                            pFunc: pFunc
                        };

                        if (typeof pFunc !== "function") {
                            throw new MuseUtils.ParameterException(
                                "musextputils",
                                "We require a valid function to remove it from the pre-save event hook.",
                                "MuseUtils.initSaveHookFramework.public.removePreSaveHookFunc",
                                { params: funcParams }
                            );
                        }

                        try {
                            removePreSaveHookFunc(pFunc);
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We encountered an error trying to remove a pre-save event hook function.",
                                "MuseUtils.initSaveHookFramework.public.removePreSaveHookFunc",
                                { params: funcParams, thrownError: e }
                            );
                        }
                    },
                    addPostSaveHookFunc: function(pFunc) {
                        // Capture function parameters for later exception references.
                        var funcParams = {
                            pFunc: pFunc
                        };

                        if (typeof pFunc !== "function") {
                            throw new MuseUtils.ParameterException(
                                "musextputils",
                                "We require a valid function to add it to the post-save event hook.",
                                "MuseUtils.initSaveHookFramework.public.addPostSaveHookFunc.",
                                { params: funcParams }
                            );
                        }

                        try {
                            addPostSaveHookFunc(pFunc);
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We encountered an error trying to add post-save event hook function.",
                                "MuseUtils.initSaveHookFramework.public.addPostSaveHookFunc",
                                { params: funcParams, thrownError: e }
                            );
                        }
                    },
                    removePostSaveHookFunc: function(pFunc) {
                        // Capture function parameters for later exception references.
                        var funcParams = {
                            pFunc: pFunc
                        };

                        if (typeof pFunc !== "function") {
                            throw new MuseUtils.ParameterException(
                                "musextputils",
                                "We require a valid function to remove it from the post-save event hook.",
                                "MuseUtils.initSaveHookFramework.public.removePostSaveHookFunc",
                                { params: funcParams }
                            );
                        }

                        try {
                            removePostSaveHookFunc(pFunc);
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We encountered an error trying to remove a post-save event hook function.",
                                "MuseUtils.initSaveHookFramework.public.removePostSaveHookFunc",
                                { params: funcParams, thrownError: e }
                            );
                        }
                    },
                    sProcessSaveFramework: function() {
                        if (typeof nativeSaveFunction !== "function") {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "The save hook framework has not been initialized, please call the initSaveHookFramework function from this library before calling sProcessSaveFramework",
                                "MuseUtils.initSaveHookFramework.public.addPostSaveHookFunc",
                                {}
                            );
                        }

                        try {
                            runSaveHookFunctions();
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "There was a non-recoverable error while trying to save a record.  We will abort the save process here.",
                                "MuseUtils.initSaveHookFramework.public.sProcessSaveFramework",
                                { thrownError: e }
                            );
                        }
                    },
                    setNativeSaveFunc: function(pFunc) {
                        // Capture function parameters for later exception references.
                        var funcParams = {
                            pFunc: pFunc
                        };

                        if (typeof pFunc !== "function") {
                            throw new MuseUtils.ParameterException(
                                "musextputils",
                                "We require a valid function in order to set a new native save function.",
                                "MuseUtils.initSaveHookFramework.public.setNativeSaveFunc",
                                { params: funcParams }
                            );
                        }

                        try {
                            setNativeSaveFunc(pFunc);
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We encountered an error trying to set a new native function call.",
                                "MuseUtils.initSaveHookFramework.public.setNativeSaveFunc",
                                { params: funcParams, thrownError: e }
                            );
                        }
                    }
                };
            })(pNativeSaveFunc, pParent);
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

        pPublicApi.initSaveHookFramework = function(pNativeSaveFunc, pParent) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pNativeSaveFunc: pNativeSaveFunc,
                pParent: pParent
            };

            if (typeof pNativeSaveFunc !== "function") {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We require a valid reference to the native form's save function in order to initialize the save hook framework.",
                    "MuseUtils.pPublicApi.initSaveHookFramework",
                    { params: funcParams }
                );
            }

            if (MuseUtils.realNull(pParent) === null) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We require a valid reference to a suitable parent widget which will serve as the parent to any not-fatal exceptions that might be thrown.",
                    "MuseUtils.pPublicApi.initSaveHookFramework",
                    { params: funcParams }
                );
            }

            try {
                return initSaveHookFramework(pNativeSaveFunc, pParent);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We failed to initialize the save event hook framework.",
                    "MuseUtils.pPublicApi.initSaveHookFramework",
                    { params: funcParams, thrownError: e }
                );
            }
        };

        // Set a flag indicating that this library is loaded.
        pPublicApi.isMuseUtilsQtLoaded = true;
    })(MuseUtils);
} catch (e) {
    QMessageBox.critical(
        mainwindow,
        "Muse Systems xTuple Utilities",
        "We failed loading the exception utilities. \n\n" + e.message
    );
}
