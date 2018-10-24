/*************************************************************************
 *************************************************************************
 **
 ** File:        transferOrderItem.js
 ** Project:     Muse Systems xTuple Utilities
 ** Author:      Steven C. Buttgereit
 **
 ** (C) 2017-2018 Lima Buttgereit Holdings LLC d/b/a Muse Systems
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
        include("museUtils");
    }

    MuseUtils.loadMuseUtils([MuseUtils.MOD_EVENTHOOKS]);

    if (typeof MuseUtils.TransferOrderItem === "undefined") {
        MuseUtils.TransferOrderItem = {};
    }
} catch (e) {
    if (
        typeof MuseUtils !== "undefined" &&
        (MuseUtils.isMuseUtilsExceptionLoaded === true ? true : false)
    ) {
        var error = new MuseUtils.ScriptException(
            "musextputils",
            "We encountered a script level issue while processing MuseUtils.TransferOrderItem.",
            "MuseUtils.TransferOrderItem",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );

        MuseUtils.displayError(error, mywindow);
        mydialog.reject();
    } else {
        QMessageBox.critical(
            mainwindow,
            "MuseUtils.TransferOrderItem Script Error",
            "We encountered a script level issue while processing MuseUtils.TransferOrderItem."
        );
        mydialog.reject();
    }
}

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi, pGlobal) {
    try {
        //--------------------------------------------------------------------
        //  Constants and Module State
        //--------------------------------------------------------------------
        var saveHookFramework = MuseUtils.initSaveHookFramework(
            mywindow.sSave,
            mywindow
        );

        var currParams = {};

        //--------------------------------------------------------------------
        //  Get Object References From Screen Definitions
        //--------------------------------------------------------------------
        _save = mywindow.findChild("_save");

        //--------------------------------------------------------------------
        //  Custom Screen Objects and Starting GUI Manipulation
        //--------------------------------------------------------------------

        //--------------------------------------------------------------------
        //  Private Functional Logic
        //--------------------------------------------------------------------

        //--------------------------------------------------------------------
        //  Public Interface -- Slots
        //--------------------------------------------------------------------

        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------

        // Here we just expose the public methods of the save event hook framework
        // instance to allow other scripts to make use of the facilities we're
        // providing.
        pPublicApi.addPreSaveHookFunc = function(pFunc) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pFunc: pFunc
            };

            try {
                saveHookFramework.addPreSaveHookFunc(pFunc);
            } catch (e) {
                var error = new MuseUtils.ApiException(
                    "musextputils",
                    "We had problems adding a pre-save hook event function.",
                    "MuseUtils.TransferOrderItem.pPublicApi.addPreSaveHookFunc",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_FATAL
                );
                MuseUtils.displayError(error, mywindow);
                mydialog.reject();
            }
        };

        pPublicApi.removePreSaveHookFunc = function(pFunc) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pFunc: pFunc
            };

            try {
                saveHookFramework.removePreSaveHookFunc(pFunc);
            } catch (e) {
                var error = new MuseUtils.ApiException(
                    "musextputils",
                    "We had problems removing a pre-save hook event function.",
                    "MuseUtils.TransferOrderItem.pPublicApi.removePreSaveHookFunc",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_FATAL
                );
                MuseUtils.displayError(error, mywindow);
                mydialog.reject();
            }
        };

        pPublicApi.addPostSaveHookFunc = function(pFunc) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pFunc: pFunc
            };

            try {
                saveHookFramework.addPostSaveHookFunc(pFunc);
            } catch (e) {
                var error = new MuseUtils.ApiException(
                    "musextputils",
                    "We had problems adding a post-save hook event function.",
                    "MuseUtils.TransferOrderItem.pPublicApi.addPostSaveHookFunc",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_FATAL
                );
                MuseUtils.displayError(error, mywindow);
                mydialog.reject();
            }
        };

        pPublicApi.removePostSaveHookFunc = function(pFunc) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pFunc: pFunc
            };

            try {
                saveHookFramework.removePostSaveHookFunc(pFunc);
            } catch (e) {
                var error = new MuseUtils.ApiException(
                    "musextputils",
                    "We had problems removing a post-save hook event function.",
                    "MuseUtils.TransferOrderItem.pPublicApi.removePostSaveHookFunc",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_FATAL
                );
                MuseUtils.displayError(error, mywindow);
                mydialog.reject();
            }
        };

        pPublicApi.setNativeSaveFunc = function(pFunc) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pFunc: pFunc
            };

            try {
                saveHookFramework.setNativeSaveFunc(pFunc);
            } catch (e) {
                var error = new MuseUtils.ApiException(
                    "musextputils",
                    "We had problems setting a native save function function.",
                    "MuseUtils.TransferOrderItem.pPublicApi.setNativeSaveFunc",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_FATAL
                );
                MuseUtils.displayError(error, mywindow);
                mydialog.reject();
            }
        };

        pPublicApi.id = function() {
            if (MuseUtils.isValidId(currParams.toitem_id)) {
                return currParams.toitem_id;
            } else {
                return null;
            }
        };

        pPublicApi.set = function(pParams) {
            currParams = pParams;
            //----------------------------------------------------------------
            //  Set Timed Connects/Disconnects
            //----------------------------------------------------------------
        };

        //--------------------------------------------------------------------
        //  Definition Timed Connects/Disconnects
        //--------------------------------------------------------------------
        toolbox.coreDisconnect(_save, "clicked()", mywindow, "sSave()");
        _save.clicked.connect(saveHookFramework.sProcessSaveFramework);

        //--------------------------------------------------------------------
        //  Foreign Script "Set" Handling
        //--------------------------------------------------------------------

        // "Set" handling base on suggestion of Gil Moskowitz/xTuple.
        var foreignSetFunc;

        // Lower graded scripts should be loaded prior to our call and as such we
        // should be able to intercept their set functions.
        if (typeof pGlobal.set === "function") {
            foreignSetFunc = pGlobal.set;
        } else {
            foreignSetFunc = function() {};
        }

        pGlobal.set = function(pParams) {
            try {
                foreignSetFunc(pParams);
                pPublicApi.set(pParams);
            } catch (e) {
                var error = new MuseUtils.ModuleException(
                    "musextputils",
                    "We enountered an error while initializing the form.",
                    "global.set",
                    { thrownError: e },
                    MuseUtils.LOG_FATAL
                );
                MuseUtils.displayError(error, mywindow);
                mydialog.reject();
            }
        };
    } catch (e) {
        var error = new MuseUtils.ModuleException(
            "musextputils",
            "We enountered a MuseUtils.TransferOrderItem module error that wasn't otherwise caught and handled.",
            "MuseUtils.TransferOrderItem",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );
        MuseUtils.displayError(error, mywindow);
        mydialog.reject();
    }
})(MuseUtils.TransferOrderItem, this);
