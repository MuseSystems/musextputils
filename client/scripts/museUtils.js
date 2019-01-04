// File:        museUtils.js
// Location:    musextputils/client/scripts
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
    //  Namespace Definition & Initialization
    //////////////////////////////////////////////////////////////////////////

    MuseUtils = {};

    ////////////////////////////////////////////////////////////////////////
    //  Module Defintion
    ////////////////////////////////////////////////////////////////////////

    (function(pPublicApi, pGlobal) {
        //------------------------------------------------------------------
        //  Constants and State
        //------------------------------------------------------------------
        pPublicApi.isMuseUtilsJsPolyfillLoaded = false;
        pPublicApi.isMuseUtilsExceptionLoaded = false;
        pPublicApi.isMuseUtilsEventHooksLoaded = false;
        pPublicApi.isMuseUtilsConfigLoaded = false;
        pPublicApi.isMuseUtilsQtLoaded = false;
        pPublicApi.isMuseUtilsUserLoaded = false;
        pPublicApi.isMuseUtilsJsLoaded = false;
        pPublicApi.isMuseUtilsDbLoaded = false;

        // Module name constances
        pPublicApi.MOD_NUMBRO = "numbro";
        pPublicApi.MOD_SJCL = "sjcl";
        pPublicApi.MOD_JSPOLYFILL = "museUtilsJsPolyfill";
        pPublicApi.MOD_EXCEPTION = "museUtilsException";
        pPublicApi.MOD_EVENTHOOKS = "museUtilsEventHooks";
        pPublicApi.MOD_CONFIG = "museUtilsConfig";
        pPublicApi.MOD_QT = "museUtilsQt";
        pPublicApi.MOD_USER = "museUtilsUser";
        pPublicApi.MOD_JS = "museUtilsJs";
        pPublicApi.MOD_DB = "museUtilsDb";
        pPublicApi.MOD_ALL = [
            pPublicApi.MOD_NUMBRO,
            pPublicApi.MOD_SJCL,
            pPublicApi.MOD_JSPOLYFILL,
            pPublicApi.MOD_EXCEPTION,
            pPublicApi.MOD_EVENTHOOKS,
            pPublicApi.MOD_CONFIG,
            pPublicApi.MOD_QT,
            pPublicApi.MOD_USER,
            pPublicApi.MOD_JS,
            pPublicApi.MOD_DB
        ];

        // Severity Levels
        pPublicApi.LOG_DEBUG = false;
        pPublicApi.LOG_INFO = false;
        pPublicApi.LOG_WARNING = false;
        pPublicApi.LOG_CRITICAL = true;
        pPublicApi.LOG_FATAL = true;

        // User Approval Return Codes
        pPublicApi.AUTH_REJECTED = 0;
        pPublicApi.AUTH_SELF = 1;
        pPublicApi.AUTH_MANAGER = 2;

        //------------------------------------------------------------------
        //  Private Functional Logic
        //------------------------------------------------------------------
        var load = function(pModules) {
            for (var i = 0; i < pModules.length; i++) {
                // Check if we got something bogus
                if (pPublicApi.MOD_ALL.indexOf(pModules[i]) < 0) {
                    throw new Error(
                        "The MuseUtils loader asked to load something that is not a module (" +
                            pModules[i] +
                            ")"
                    );
                }

                if (
                    typeof numbro !== "function" &&
                    pModules[i] == pPublicApi.MOD_NUMBRO
                ) {
                    include("numbro");
                }

                if (
                    typeof sjcl !== "object" &&
                    pModules[i] == pPublicApi.MOD_SJCL
                ) {
                    include("sjcl");
                }

                if (
                    !pPublicApi.isMuseUtilsJsPolyfillLoaded &&
                    pModules[i] == pPublicApi.MOD_JSPOLYFILL
                ) {
                    include("museUtilsJsPolyfill");
                }

                if (
                    !pPublicApi.isMuseUtilsExceptionLoaded &&
                    pModules[i] == pPublicApi.MOD_EXCEPTION
                ) {
                    include("museUtilsException");
                }

                if (
                    !pPublicApi.isMuseUtilsEventHooksLoaded &&
                    pModules[i] == pPublicApi.MOD_EVENTHOOKS
                ) {
                    include("museUtilsEventHooks");
                }

                if (
                    !pPublicApi.isMuseUtilsConfigLoaded &&
                    pModules[i] == pPublicApi.MOD_CONFIG
                ) {
                    include("museUtilsConfig");
                }

                if (
                    !pPublicApi.isMuseUtilsQtLoaded &&
                    pModules[i] == pPublicApi.MOD_QT
                ) {
                    include("museUtilsQt");
                }

                if (
                    !pPublicApi.isMuseUtilsUserLoaded &&
                    pModules[i] == pPublicApi.MOD_USER
                ) {
                    include("museUtilsUser");
                }

                if (
                    !pPublicApi.isMuseUtilsJsLoaded &&
                    pModules[i] == pPublicApi.MOD_JS
                ) {
                    include("museUtilsJs");
                }

                if (
                    !pPublicApi.isMuseUtilsDbLoaded &&
                    pModules[i] == pPublicApi.MOD_DB
                ) {
                    include("museUtilsDb");
                }
            }
        };

        //------------------------------------------------------------------
        //  Public Interface -- Functions
        //------------------------------------------------------------------

        // All client packages should check if the MuseUtils object exists and,
        // if not, should:
        // 1) Load this script via include("museUtils")
        // 2) Call MuseUtils.loadMuseUtils(<array with required mods or MuseUtils.ALL>)
        pPublicApi.loadMuseUtils = function(pModules) {
            try {
                if (!pModules || pModules.length == 0) {
                    pModules = pPublicApi.MOD_ALL;
                }

                load(pModules);
            } catch (e) {
                QMessageBox.critical(
                    mainwindow,
                    "Muse Systems xTuple Utilities",
                    "We encountered an error trying to load utilities modules.\n\n" +
                        e
                );
            }
        };
    })(MuseUtils, this);
} catch (e) {
    QMessageBox.critical(
        mainwindow,
        "Muse Systems xTuple Utilities",
        "We encountered a critical, unrecoverable error while initializing the utilities package.  Please report this to your system support team.\n\n" +
            e
    );
}
