// File:        museUtilsUser.js
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
    if (typeof MuseUtils === "undefined") {
        throw new Error(
            "Please do load utility modules directly.  See museUtils.js for the loading methodology."
        );
    }

    MuseUtils.loadMuseUtils([MuseUtils.MOD_EXCEPTION]);
} catch (e) {
    if (
        typeof MuseUtils !== "undefined" &&
        (MuseUtils.isMuseUtilsExceptionLoaded === true ? true : false)
    ) {
        var error = new MuseUtils.ScriptException(
            "MuseUtils",
            "We encountered a script level issue while processing MuseUtils Mod User.",
            "MuseUtils",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );

        MuseUtils.displayError(error, mainwindow);
    } else {
        QMessageBox.critical(
            mainwindow,
            "MuseUtils Script Error",
            "We encountered a script level issue while processing MuseUtils Mod User."
        );
    }
}

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi, pGlobal) {
    try {
        //--------------------------------------------------------------------
        //  Private Functional Logic
        //--------------------------------------------------------------------
        var getCurrentUserId = function() {
            // Let's find out who we are... we are someone aren't we?  We'll use
            // current_user rather than session_user in case we want to pretend
            // we're someone else.
            var userQuery = toolbox.executeQuery(
                "SELECT oid AS usr_id FROM pg_catalog.pg_roles WHERE rolname = current_user;"
            );

            if (userQuery.lastError().type != QSqlError.NoError) {
                throw new MuseUtils.DatabaseException(
                    "musextputils",
                    "We encountered a database problem determining the current user id.",
                    "MuseUtils.getCurrentUserId",
                    {
                        databaseError: userQuery.lastError()
                    },
                    MuseUtils.LOG_WARNING
                );
            } else if (userQuery.first()) {
                // We got something so lets return that.
                var usrId = userQuery.value("usr_id");
                return usrId;
            } else {
                // We didn't get something so lets error out.
                throw new MuseUtils.NotFoundException(
                    "musextputils",
                    "We encountered a problem determining the current user id.",
                    "MuseUtils.getCurrentUserId",
                    {
                        databaseError: userQuery.lastError()
                    },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        var getUserIdByUsername = function(pUsername) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pUsername: pUsername
            };

            var userQuery = toolbox.executeQuery(
                "SELECT oid AS usr_id FROM pg_catalog.pg_roles " +
                    'WHERE rolname = <? value("pUsername") ?>;',
                { pUsername: pUsername }
            );

            if (userQuery.lastError().type != QSqlError.NoError) {
                throw new MuseUtils.DatabaseException(
                    "musextputils",
                    "We encountered a database problem determining the current user id.",
                    "MuseUtils.getUserIdByUsername",
                    {
                        databaseError: userQuery.lastError()
                    },
                    MuseUtils.LOG_WARNING
                );
            } else if (userQuery.first()) {
                // We got something so lets return that.
                var usrId = userQuery.value("usr_id");
                return usrId;
            } else {
                // We didn't get something so lets error out.
                throw new MuseUtils.NotFoundException(
                    "musextputils",
                    "We encountered a problem determining the current user id.",
                    "MuseUtils.getUserIdByUsername",
                    {
                        databaseError: userQuery.lastError()
                    },
                    MuseUtils.LOG_WARNING
                );
            }
        };
        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------
        pPublicApi.getCurrentUserId = function() {
            try {
                return getCurrentUserId();
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.getCurrentUserId",
                    {
                        thrownError: e
                    },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        pPublicApi.getUserIdByUsername = function(pUsername) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pUsername: pUsername
            };

            // validate the input
            if (!pUsername) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We were asked to look up a user id, but weren't given anybody's name.  This is a problem.",
                    "MuseUtils.getUserIdByUsername",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            try {
                return getUserIdByUsername(pUsername);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.getUserIdByUsername",
                    {
                        thrownError: e,
                        params: funcParams
                    },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        // Set a flag indicating that this library is loaded.
        pPublicApi.isMuseUtilsUserLoaded = true;
    } catch (e) {
        var error = new MuseUtils.ModuleException(
            "MuseUtils",
            "We enountered a MuseUtils User module error that wasn't otherwise caught and handled.",
            "MuseUtils",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );
        MuseUtils.displayError(error, mainwindow);
    }
})(MuseUtils, this);
