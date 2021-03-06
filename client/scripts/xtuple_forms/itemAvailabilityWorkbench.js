// File:        itemAvailabilityWorkbench.js
// Location:    musextputils/client/scripts/xtuple_forms
// Project:     Muse Systems xTuple ERP Utilities
//
// Licensed to Lima Buttgereit Holdings LLC (d/b/a Muse Systems) under one or
// more agreements.  Muse Systems licenses this file to you under the Apache
// License, Version 2.0.
//
// See the LICENSE file in the project root for license terms and conditions.
// See the NOTICE file in the project root for copyright ownership information.
//
// muse.information@musesystems.com  :: https://muse.systems

try {
    //////////////////////////////////////////////////////////////////////////
    //  Namespace Definition
    //////////////////////////////////////////////////////////////////////////

    if (typeof MuseUtils === "undefined") {
        include("museUtils");
    }

    MuseUtils.loadMuseUtils([MuseUtils.MOD_EXCEPTION, MuseUtils.MOD_JS]);

    if (typeof MuseUtils.ItemAvailability === "undefined") {
        MuseUtils.ItemAvailability = {};
    }
} catch (e) {
    if (
        typeof MuseUtils !== "undefined" &&
        (MuseUtils.isMuseUtilsExceptionLoaded === true ? true : false)
    ) {
        var error = new MuseUtils.ScriptException(
            "musextputils",
            "We encountered a script level issue while processing MuseUtils.ItemAvailability.",
            "MuseUtils.ItemAvailability",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );

        MuseUtils.displayError(error, mainwindow);
    } else {
        QMessageBox.critical(
            mainwindow,
            "MuseUtils.ItemAvailability Script Error",
            "We encountered a script level issue while processing MuseUtils.ItemAvailability."
        );
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
        var itemMaster = null;

        //--------------------------------------------------------------------
        //  Get Object References From Screen Definitions
        //--------------------------------------------------------------------
        var _item = mywindow.findChild("_item");

        //--------------------------------------------------------------------
        //  Custom Screen Objects and Starting GUI Manipulation
        //--------------------------------------------------------------------

        //--------------------------------------------------------------------
        //  Private Functional Logic
        //--------------------------------------------------------------------

        //--------------------------------------------------------------------
        //  Public Interface -- Slots
        //--------------------------------------------------------------------
        pPublicApi.sHandleNewId = function(pItemId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pItemId: pItemId
            };

            try {
                // Force the loading and initialization of the embedded Item
                // Master form which is otherwise lazily loaded and never
                // initialized in the normal way.
                if (MuseUtils.isValidId(pItemId) && itemMaster === null) {
                    itemMaster = mywindow.findChild("item");

                    // Call the embedded Item Master's set function in view mode
                    // as that is the default that is in effect in core xTuple
                    // when called from Item Availability Workbench.
                    itemMaster.set({ item_id: pItemId, mode: "view" });
                }
            } catch (e) {
                var error = new MuseUtils.ApiException(
                    "musextputils",
                    "We had problems responding and handling a new Item selection.",
                    "MuseUtils.ItemAvailability.pPublicApi.sHandleNewId",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_CRITICAL
                );

                MuseUtils.displayError(error, mywindow);
            }
        };

        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------

        pPublicApi.set = function(pParams) {
            //----------------------------------------------------------------
            //  Set Timed Connects/Disconnects
            //----------------------------------------------------------------
        };

        //--------------------------------------------------------------------
        //  Definition Timed Connects/Disconnects
        //--------------------------------------------------------------------
        _item["newId(int)"].connect(pPublicApi.sHandleNewId);

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
            var funcParams = { pParams: pParams };

            var myParams = MuseUtils.parseParams(pParams || {});

            try {
                foreignSetFunc(myParams);
                pPublicApi.set(myParams);
            } catch (e) {
                var error = new MuseUtils.ModuleException(
                    "musextputils",
                    "We enountered an error while initializing the form.",
                    "global.set",
                    {
                        params: funcParams,
                        thrownError: e,
                        context: {
                            parsedParams: myParams
                        }
                    },
                    MuseUtils.LOG_FATAL
                );
                MuseUtils.displayError(error, mywindow);
                mywindow.close();
            }
        };
    } catch (e) {
        var error = new MuseUtils.ModuleException(
            "musextputils",
            "We enountered a MuseUtils.ItemAvailability module error that wasn't otherwise caught and handled.",
            "MuseUtils.ItemAvailability",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );
        MuseUtils.displayError(error, mainwindow);
    }
})(MuseUtils.ItemAvailability, this);
