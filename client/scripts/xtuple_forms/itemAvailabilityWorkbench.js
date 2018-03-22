/*************************************************************************
 *************************************************************************
 **
 ** File:        itemAvailabilityWorkbench.js
 ** Project:     Muse Systems xTuple Utilities
 ** Author:      Steven C. Buttgereit
 **
 ** (C) 2018 Lima Buttgereit Holdings LLC d/b/a Muse Systems
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
        MuseUtils = {};
    }

    if (typeof MuseUtils.ItemAvailability === "undefined") {
        MuseUtils.ItemAvailability = {};
    }

    //////////////////////////////////////////////////////////////////////////
    //  Imports
    //////////////////////////////////////////////////////////////////////////

    include("museUtils");
} catch (e) {
    if (
        typeof MuseUtils !== "undefined" &&
        (MuseUtils.isMuseUtilsExceptionLoaded === true ? true : false)
    ) {
        var error = new MuseUtils.UnknownException(
            "musextputils",
            "We encountered a script level issue while processing MuseUtils.ItemAvailability.",
            "MuseUtils.ItemAvailability",
            { thrownError: e }
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
        // Somehow newId on _item gets called twice and the second time we
        // don't get a referenc to itemMaster... ensure we only run once.  It's
        // a hack... but isn't it all?
        var lastSeenItemId = -1;

        //--------------------------------------------------------------------
        //  Get Object References From Screen Definitions
        //--------------------------------------------------------------------
        var _item = mywindow.findChild("_item");
        var itemMaster = mywindow.findChild("item");
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
                // Call the native populate function since we want to always
                // run it and run after it.
                mywindow.populate();

                // Force the loading and initialization of the embedded Item
                // Master form which is otherwise lazily loaded and never
                // initialized in the normal way.
                if (
                    MuseUtils.isValidId(pItemId) &&
                    pItemId != lastSeenItemId &&
                    MuseUtils.realNull(itemMaster) !== null
                ) {
                    // Call the embedded Item Master's set function in view mode
                    // as that is the default that is in effect in core xTuple
                    // when called from Item Availability Workbench.
                    itemMaster.set({ item_id: pItemId, mode: "view" });

                    lastSeenItemId = pItemId;
                }
            } catch (e) {
                var error = new MuseUtils.ApiException(
                    "musextputils",
                    "We had problems responding and handling a new Item selection.",
                    "MuseUtils.ItemAvailability.pPublicApi.sHandleNewId",
                    { params: funcParams, thrownError: e }
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
        toolbox.coreDisconnect(_item, "newId(int)", mywindow, "populate()");
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
                var error = new MuseUtils.UnknownException(
                    "musextputils",
                    "We enountered an error while initializing the form.",
                    "global.set",
                    {
                        params: funcParams,
                        thrownError: e,
                        context: {
                            parsedParams: myParams
                        }
                    }
                );
                MuseUtils.displayError(error, mywindow);
                mywindow.close();
            }
        };
    } catch (e) {
        var error = new MuseUtils.UnknownException(
            "musextputils",
            "We enountered a MuseUtils.ItemAvailability module error that wasn't otherwise caught and handled.",
            "MuseUtils.ItemAvailability",
            { thrownError: e }
        );
        MuseUtils.displayError(error, mainwindow);
    }
})(MuseUtils.ItemAvailability, this);
