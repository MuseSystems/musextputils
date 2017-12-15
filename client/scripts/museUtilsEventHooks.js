/*************************************************************************
 *************************************************************************
 **
 ** File:        museUtilsEventHooks.js
 ** Project:     Muse Systems xTuple ERP Utilities
 ** Author:      Steven C. Buttgereit
 **
 ** (C) 2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
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
    //  Namespace Definition & Imports
    //////////////////////////////////////////////////////////////////////////

    if (typeof MuseUtils === "undefined") {
        throw new Error(
            "Please do load utility modules directly.  See museUtils.js for the loading methodology."
        );
    }

    MuseUtils.loadMuseUtils([MuseUtils.MOD_EXCEPTION, MuseUtils.MOD_JS]);
} catch (e) {
    if (
        typeof MuseUtils !== "undefined" &&
        (MuseUtils.isMuseUtilsExceptionLoaded === true ? true : false)
    ) {
        var error = new MuseUtils.ScriptException(
            "musextputils",
            "We encountered a script level issue while processing MuseUtils.",
            "MuseUtils",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );

        MuseUtils.displayError(error, mainwindow);
    } else {
        QMessageBox.critical(
            mainwindow,
            "MuseUtils Script Error",
            "We encountered a script level issue while processing MuseUtils."
        );
    }
}

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi, pGlobal) {
    try {
        //--------------------------------------------------------------------
        //  Constants
        //--------------------------------------------------------------------

        //--------------------------------------------------------------------
        //  Private Functional Logic
        //--------------------------------------------------------------------
        var initSaveHookFramework = function(pNativeSaveFunc, pParent) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pNativeSaveFunc: pNativeSaveFunc,
                pParent: pParent
            };

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
                                { thrownError: e },
                                MuseUtils.LOG_WARNING
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
                            { thrownError: e },
                            MuseUtils.LOG_WARNING
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
                                },
                                MuseUtils.LOG_CRITICAL
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
                                { params: funcParams },
                                MuseUtils.LOG_WARNING
                            );
                        }

                        try {
                            addPreSaveHookFunc(pFunc);
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We encountered an error trying to add a pre-save event hook function.",
                                "MuseUtils.initSaveHookFramework.public.addPreSaveHookFunc",
                                { params: funcParams, thrownError: e },
                                MuseUtils.LOG_WARNING
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
                                { params: funcParams },
                                MuseUtils.LOG_WARNING
                            );
                        }

                        try {
                            removePreSaveHookFunc(pFunc);
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We encountered an error trying to remove a pre-save event hook function.",
                                "MuseUtils.initSaveHookFramework.public.removePreSaveHookFunc",
                                { params: funcParams, thrownError: e },
                                MuseUtils.LOG_WARNING
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
                                { params: funcParams },
                                MuseUtils.LOG_WARNING
                            );
                        }

                        try {
                            addPostSaveHookFunc(pFunc);
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We encountered an error trying to add post-save event hook function.",
                                "MuseUtils.initSaveHookFramework.public.addPostSaveHookFunc",
                                { params: funcParams, thrownError: e },
                                MuseUtils.LOG_WARNING
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
                                { params: funcParams },
                                MuseUtils.LOG_WARNING
                            );
                        }

                        try {
                            removePostSaveHookFunc(pFunc);
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We encountered an error trying to remove a post-save event hook function.",
                                "MuseUtils.initSaveHookFramework.public.removePostSaveHookFunc",
                                { params: funcParams, thrownError: e },
                                MuseUtils.LOG_WARNING
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
                                { thrownError: e },
                                MuseUtils.LOG_WARNING
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
                                { params: funcParams },
                                MuseUtils.LOG_WARNING
                            );
                        }

                        try {
                            setNativeSaveFunc(pFunc);
                        } catch (e) {
                            throw new MuseUtils.ApiException(
                                "musextputils",
                                "We encountered an error trying to set a new native function call.",
                                "MuseUtils.initSaveHookFramework.public.setNativeSaveFunc",
                                { params: funcParams, thrownError: e },
                                MuseUtils.LOG_WARNING
                            );
                        }
                    }
                };
            })(pNativeSaveFunc, pParent);
        };

        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------
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
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (MuseUtils.realNull(pParent) === null) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We require a valid reference to a suitable parent widget which will serve as the parent to any not-fatal exceptions that might be thrown.",
                    "MuseUtils.pPublicApi.initSaveHookFramework",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            try {
                return initSaveHookFramework(pNativeSaveFunc, pParent);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We failed to initialize the save event hook framework.",
                    "MuseUtils.pPublicApi.initSaveHookFramework",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        // Set a flag indicating that this library is loaded.
        pPublicApi.isMuseUtilsEventHooksLoaded = true;
    } catch (e) {
        var error = new MuseUtils.ModuleException(
            "musextputils",
            "We enountered a  MuseUtils module error that wasn't otherwise caught and handled.",
            "MuseUtils",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );
        MuseUtils.displayError(error, mainwindow);
    }
})(MuseUtils, this);
