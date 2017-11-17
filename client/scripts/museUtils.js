/*************************************************************************
 *************************************************************************
 **
 ** File:        museUtils.js
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
        pPublicApi.isMuseUtilsConfigLoaded = false;
        pPublicApi.isMuseUtilsQtLoaded = false;
        pPublicApi.isMuseUtilsUserLoaded = false;
        pPublicApi.isMuseUtilsJsLoaded = false;
        pPublicApi.isMuseUtilsDbLoaded = false;

        // Module name constances
        pPublicApi.NUMBRO = "numbro";
        pPublicApi.JSPOLYFILL = "museUtilsJsPolyfill";
        pPublicApi.EXCEPTION = "museUtilsException";
        pPublicApi.CONFIG = "museUtilsConfig";
        pPublicApi.QT = "museUtilsQt";
        pPublicApi.USER = "museUtilsUser";
        pPublicApi.JS = "museUtilsJs";
        pPublicApi.DB = "museUtilsDb";
        pPublicApi.ALL = "***ALL UTILS***";

        //------------------------------------------------------------------
        //  Private Functional Logic
        //------------------------------------------------------------------
        var load = function(pModules) {
            for (var i = 0; i < pModules.length; i++) {
                if (
                    typeof numbro !== "function" &&
                    (pModules[i] == pPublicApi.NUMBRO ||
                        pModules[i] == pPublicApi.ALL)
                ) {
                    include("numbro");
                }

                if (
                    !pPublicApi.isMuseUtilsJsPolyfillLoaded &&
                    (pModules[i] == pPublicApi.JSPOLYFILL ||
                        pModules[i] == pPublicApi.ALL)
                ) {
                    include("museUtilsJsPolyfill");
                }

                if (
                    !pPublicApi.isMuseUtilsExceptionLoaded &&
                    (pModules[i] == pPublicApi.EXCEPTION ||
                        pModules[i] == pPublicApi.ALL)
                ) {
                    include("museUtilsException");
                }

                if (
                    !pPublicApi.isMuseUtilsConfigLoaded &&
                    (pModules[i] == pPublicApi.CONFIG ||
                        pModules[i] == pPublicApi.ALL)
                ) {
                    include("museUtilsConfig");
                }

                if (
                    !pPublicApi.isMuseUtilsQtLoaded &&
                    (pModules[i] == pPublicApi.QT ||
                        pModules[i] == pPublicApi.ALL)
                ) {
                    include("museUtilsQt");
                }

                if (
                    !pPublicApi.isMuseUtilsUserLoaded &&
                    (pModules[i] == pPublicApi.USER ||
                        pModules[i] == pPublicApi.ALL)
                ) {
                    include("museUtilsUser");
                }

                if (
                    !pPublicApi.isMuseUtilsJsLoaded &&
                    (pModules[i] == pPublicApi.JS ||
                        pModules[i] == pPublicApi.ALL)
                ) {
                    include("museUtilsJs");
                }

                if (
                    !pPublicApi.isMuseUtilsDbLoaded &&
                    (pModules[i] == pPublicApi.DB ||
                        pModules[i] == pPublicApi.ALL)
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
        // 2) Call MuseUtils.loadMuseUtils(<array with required mods>)
        pPublicApi.loadMuseUtils = function(pModules) {
            try {
                if (!pModules || pModules.length == 0) {
                    pModules = [pPublicApi.ALL];
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
