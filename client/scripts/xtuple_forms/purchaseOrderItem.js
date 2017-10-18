/*************************************************************************
 *************************************************************************
 **
 ** File:        purchaseOrderItem.js
 ** Project:     Muse Systems xTuple Utilities
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

// NOTE:  We want this script to run early and be available to all other
// scripts which might need to make use of its services.  As such we'll
// run at grade 0.

//////////////////////////////////////////////////////////////////////////
//  Namespace Definition
//////////////////////////////////////////////////////////////////////////

if (typeof MuseUtils === "undefined") {
    MuseUtils = {};
}

if (typeof MuseUtils.PurchaseOrderItem === "undefined") {
    MuseUtils.PurchaseOrderItem = {};
}

//////////////////////////////////////////////////////////////////////////
//  Imports
//////////////////////////////////////////////////////////////////////////
include("museUtils");

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi, pGlobal) {
    var saveHookFramework = MuseUtils.initSaveHookFramework(
        mywindow.sSave,
        mywindow
    );

    //--------------------------------------------------------------------
    //  Get Object References From Screen Definitions
    //--------------------------------------------------------------------
    _save = mywindow.findChild("_save");

    //--------------------------------------------------------------------
    //  Custom Screen Objects and Starting GUI Manipulation
    //--------------------------------------------------------------------

    // Disconnect the native function and connect the framework.  Earlier
    // the better.
    toolbox.coreDisconnect(_save, "clicked()", mywindow, "sSave()");
    _save.clicked.connect(saveHookFramework.sProcessSaveFramework);

    //--------------------------------------------------------------------
    //  "Private" Functional Logic
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
        try {
            saveHookFramework.addPreSaveHookFunc(pFunc);
        } catch (e) {
            MuseUtils.displayError(e, mywindow);
            mywindow.close();
        }
    };

    pPublicApi.removePreSaveHookFunc = function(pFunc) {
        try {
            saveHookFramework.removePreSaveHookFunc(pFunc);
        } catch (e) {
            MuseUtils.displayError(e, mywindow);
            mywindow.close();
        }
    };

    pPublicApi.addPostSaveHookFunc = function(pFunc) {
        try {
            saveHookFramework.addPostSaveHookFunc(pFunc);
        } catch (e) {
            MuseUtils.displayError(e, mywindow);
            mywindow.close();
        }
    };

    pPublicApi.removePostSaveHookFunc = function(pFunc) {
        try {
            saveHookFramework.removePostSaveHookFunc(pFunc);
        } catch (e) {
            MuseUtils.displayError(e, mywindow);
            mywindow.close();
        }
    };

    pPublicApi.setNativeSaveFunc = function(pFunc) {
        try {
            saveHookFramework.setNativeSaveFunc(pFunc);
        } catch (e) {
            MuseUtils.displayError(e, mywindow);
            mywindow.close();
        }
    };

    /**
     * Form startup initialization.  Standard part of the xTuple ERP
     * startup process.
     * @param {Object} pParams An associative array of values passed from
     *                         the xTuple C++ forms which contain context
     *                         setting information.
     */
    pPublicApi.set = function(pParams) {};

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
            MuseUtils.displayError(e, mywindow);
            mywindow.close();
        }
    };
})(MuseUtils.PurchaseOrderItem, this);
