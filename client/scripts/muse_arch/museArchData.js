/*************************************************************************
 *************************************************************************
 **
 ** File:        museArchData.js
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

    if (typeof MuseArch === "undefined") {
        MuseArch = {};
    }

    if (typeof MuseArch.Data === "undefined") {
        MuseArch.Data = {};
    }

    //////////////////////////////////////////////////////////////////////////
    //  Imports
    //////////////////////////////////////////////////////////////////////////

    if (typeof MuseUtils === "undefined") {
        include("museUtils");
    }

    MuseUtils.loadMuseUtils([
        MuseUtils.MOD_EXCEPTION,
        MuseUtils.MOD_DB,
        MuseUtils.MOD_JS,
        MuseUtils.MOD_JSPOLYFILL,
        MuseUtils.MOD_CONFIG
    ]);
} catch (e) {
    if (
        typeof MuseUtils !== "undefined" &&
        (MuseUtils.isMuseUtilsExceptionLoaded === true ? true : false)
    ) {
        var error = new MuseUtils.ScriptException(
            "musesuperchar",
            "We encountered a script level issue while processing MuseArch.Data.",
            "MuseArch.Data",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );

        MuseUtils.displayError(error, mainwindow);
    } else {
        QMessageBox.critical(
            mainwindow,
            "MuseArch.Data Script Error",
            "We encountered a script level issue while processing MuseArch.Data."
        );
    }
}

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi) {
    try {
        //--------------------------------------------------------------------
        //  "Private" Constants & Data Structures
        //--------------------------------------------------------------------
        // Constants
        var DATA_STRUCT = {};
        var PREFIX = "";
        var ENTITY_SCHEMA = "";
        var ENTITY_TABLE = "";
        var ENTITY_DISPLAY_NAME = "";
        var ENTITY_OBJECT_NAME = "";
        var SC_DATA_TABLE = "";
        var SC_DATA_TABLE_PK = SC_DATA_TABLE + "_id";
        var METASQL_INSERT = PREFIX + "_" + SC_DATA_TABLE + "_insert";
        var METASQL_UPDATE = PREFIX + "_" + SC_DATA_TABLE + "_update";
        var METASQL_DELETE = PREFIX + "_" + SC_DATA_TABLE + "_delete";
        var METASQL_SELECT = PREFIX + "_" + SC_DATA_TABLE + "_select";

        // Mutable Data
        var data = {};
        var lovOverrides = {};

        // Hook Function Containers
        var onNewFuncs = [];
        var onLoadFuncs = [];
        var beforeSetFuncs = {};
        var afterSetFuncs = {};
        var beforeSaveFuncs = [];
        var afterSaveFuncs = [];

        //--------------------------------------------------------------------
        //  "Private" Functional Logic
        //--------------------------------------------------------------------

        var addOnNewHookFunc = function(pFunc) {
            onNewFuncs.push(pFunc);
        };

        var addOnLoadHookFunc = function(pFunc) {
            onLoadFuncs.push(pFunc);
        };

        var addBeforeSetHookFunc = function(pScIntName, pFunc) {
            beforeSetFuncs[pScIntName].push(pFunc);
        };

        var addAfterSetHookFunc = function(pScIntName, pFunc) {
            afterSetFuncs[pScIntName].push(pFunc);
        };

        var addBeforeSaveHookFunc = function(pFunc) {
            beforeSaveFuncs.push(pFunc);
        };

        var addAfterSaveHookFunc = function(pFunc) {
            afterSaveFuncs.push(pFunc);
        };

        var hookRunner = function(pHookFuncArray, pDataRecId, pNewValue) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pHookFuncArray: pHookFuncArray,
                pDataRecId: pDataRecId,
                pNewValue: pNewValue
            };

            var wrkObjCopy = {};
            Object.assign(
                wrkObjCopy,
                data[SC_DATA_TABLE + "_" + pDataRecId].working
            );
            var returnText = "";

            for (var i = 0; i < pHookFuncArray.length; i++) {
                var hookReturn = "";

                if (typeof pHookFuncArray[i] === "function") {
                    try {
                        hookReturn = pHookFuncArray[i](wrkObjCopy, pNewValue);
                    } catch (e) {
                        throw new MuseUtils.ApiException(
                            "musesuperchar",
                            "We encountered a problem while running a 'hook' function.",
                            "MuseArch.Data." +
                                ENTITY_OBJECT_NAME +
                                ".hookRunner",
                            { params: funcParams, thrownError: e },
                            MuseUtils.LOG_WARNING
                        );
                    }
                }

                if (MuseUtils.realNull(hookReturn) !== null) {
                    returnText += hookReturn + "\n\n";
                }
            }

            return MuseUtils.realNull(returnText);
        };

        var sendLovOverrideSignal = function(pScIntName, pDataRecId) {
            try {
                mainwindow.sEmitSignal(
                    "_@" +
                        PREFIX +
                        "@@" +
                        ENTITY_OBJECT_NAME +
                        "@@" +
                        pDataRecId +
                        "@@" +
                        pScIntName +
                        "@_",
                    "lov_override"
                );
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We received errors while signalling that we set a value.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".sendLovOverrideSignal",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        var setLovQuery = function(pScIntName, pDataRecId, pXSqlQuery) {
            var funcParams = {
                pScIntName: pScIntName,
                pDataRecId: pDataRecId,
                pXSqlQuery: pXSqlQuery
            };

            lovOverrides[SC_DATA_TABLE + "_" + pDataRecId][
                pScIntName
            ] = pXSqlQuery;

            sendLovOverrideSignal(pScIntName, pDataRecId);
        };

        var getLovQuery = function(pScIntName, pDataRecId) {
            var funcParams = {
                pScIntName: pScIntName,
                pDataRecId: pDataRecId
            };

            return lovOverrides[SC_DATA_TABLE + "_" + pDataRecId][pScIntName];
        };

        var sendUpdateAllSignal = function(pDataRecId) {
            try {
                mainwindow.sEmitSignal(
                    "_@" +
                        PREFIX +
                        "@@" +
                        ENTITY_OBJECT_NAME +
                        "@@" +
                        pDataRecId +
                        "@_",
                    "update_all"
                );
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We received errors while signalling that we loaded data.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".sendUpdateAllSignal",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        var loadFormData = function(pDataRecId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pDataRecId: pDataRecId
            };

            var recObjName = SC_DATA_TABLE + "_" + pDataRecId;

            try {
                var qryParams = Object.keys(DATA_STRUCT).reduce(function(
                    acc,
                    val
                ) {
                    acc["select_" + val] = true;
                    return acc;
                },
                {});

                qryParams["where_" + SC_DATA_TABLE + "_id"] = pDataRecId;

                var entQry = MuseUtils.executeDbQuery(
                    "musesuperchar",
                    METASQL_SELECT,
                    qryParams
                );

                if (entQry.first()) {
                    data[SC_DATA_TABLE + "_" + pDataRecId] = {
                        database: {},
                        working: {}
                    };

                    lovOverrides[SC_DATA_TABLE + "_" + pDataRecId] = {};

                    data[recObjName].database = entQry.firstJson();
                    Object.assign(
                        data[recObjName].working,
                        data[recObjName].database
                    );
                } else {
                    throw new MuseUtils.NotFoundException(
                        "musesuperchar",
                        "We failed to find the requested " +
                            ENTITY_DISPLAY_NAME +
                            " Super Characteristic data record.",
                        "MuseArch.Data." + ENTITY_OBJECT_NAME + ".loadFormData",
                        { params: funcParams },
                        MuseUtils.LOG_WARNING
                    );
                }
            } catch (e) {
                throw new MuseUtils.DatabaseException(
                    "musesuperchar",
                    "We encountered a problem loading " +
                        ENTITY_DISPLAY_NAME +
                        " form data.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".loadFormData",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }

            try {
                // Run our On Load Hooks.  If we get a non-null result, we display
                // the message to the user.
                var onLoadResultMsg = hookRunner(onLoadFuncs, pDataRecId);

                if (onLoadResultMsg !== null) {
                    QMessageBox.information(
                        mywindow,
                        "On " + ENTITY_DISPLAY_NAME + " Load Notices",
                        onLoadResultMsg
                    );
                }
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We received errors from on load hook function execution.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".loadFormData",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }

            sendUpdateAllSignal(pDataRecId);
        };

        var insertEntityData = function(pDataRecId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pDataRecId: pDataRecId
            };

            var recObjName = SC_DATA_TABLE + "_" + pDataRecId;

            if (!data.hasOwnProperty(recObjName)) {
                throw new MuseUtils.NotFoundException(
                    "musesuperchar",
                    "The Super Characteristic Entity record you are trying to save has not been initialized.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".insertEntityData",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            var insertParams = {};
            var fields = Object.keys(DATA_STRUCT);

            for (var ins = 0; ins < fields.length; ins++) {
                if (
                    data[recObjName].database[fields[ins]] !=
                    data[recObjName].working[fields[ins]]
                ) {
                    insertParams[fields[ins]] =
                        data[recObjName].working[fields[ins]];
                }
            }

            try {
                var entQry = MuseUtils.executeDbQuery(
                    "musesuperchar",
                    METASQL_INSERT,
                    insertParams
                );

                if (
                    !entQry.first() ||
                    !MuseUtils.isValidId(entQry.value(SC_DATA_TABLE_PK))
                ) {
                    throw new MuseUtils.NotFoundException(
                        "musesuperchar",
                        "We failed to verify that we created entity data record " +
                            recObjName,
                        "MuseArch.Data." +
                            ENTITY_OBJECT_NAME +
                            ".insertEntityData",
                        {
                            params: funcParams,
                            context: { insertParams: insertParams }
                        },
                        MuseUtils.LOG_WARNING
                    );
                }

                delete data[recObjName];
                return entQry.value(SC_DATA_TABLE_PK);
            } catch (e) {
                throw new MuseUtils.DatabaseException(
                    "musesuperchar",
                    "We encountered a database problem trying to save " +
                        recObjName,
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".insertEntityData",
                    {
                        params: funcParams,
                        thrownError: e,
                        context: { data: data }
                    },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        var updateEntityData = function(pDataRecId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pDataRecId: pDataRecId
            };

            var recObjName = SC_DATA_TABLE + "_" + pDataRecId;

            if (!data.hasOwnProperty(recObjName)) {
                throw new MuseUtils.NotFoundException(
                    "musesuperchar",
                    "The Super Characteristic Entity record you are trying to save has not been initialized.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".updateEntityData",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (
                !MuseUtils.isValidId(data[recObjName].working[SC_DATA_TABLE_PK])
            ) {
                throw new MuseUtils.NotFoundException(
                    "musesuperchar",
                    "An updated Super Characteristic Entity record must have a " +
                        " valid " +
                        SC_DATA_TABLE_PK +
                        " value set in order to save it.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".updateEntityData",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            var updateParams = {};
            updateParams["where_" + SC_DATA_TABLE_PK] =
                data[recObjName].working[SC_DATA_TABLE_PK];
            fields = Object.keys(DATA_STRUCT);
            for (var ups = 0; ups < fields.length; ups++) {
                if (
                    data[recObjName].database[fields[ups]] !=
                    data[recObjName].working[fields[ups]]
                ) {
                    updateParams["update_" + fields[ups]] =
                        data[recObjName].working[fields[ups]];
                }
            }

            try {
                entQry = MuseUtils.executeDbQuery(
                    "musesuperchar",
                    METASQL_UPDATE,
                    updateParams
                );
                if (
                    !entQry.first() ||
                    !MuseUtils.isValidId(entQry.value(SC_DATA_TABLE_PK))
                ) {
                    throw new MuseUtils.NotFoundException(
                        "musesuperchar",
                        "We failed to verify that we updated entity data record " +
                            recObjName,
                        "MuseArch.Data." +
                            ENTITY_OBJECT_NAME +
                            ".updateEntityData",
                        {
                            params: funcParams,
                            context: { updateParams: updateParams }
                        },
                        MuseUtils.LOG_WARNING
                    );
                }

                return entQry.value(SC_DATA_TABLE_PK);
            } catch (e) {
                throw new MuseUtils.DatabaseException(
                    "musesuperchar",
                    "We encountered a database problem trying to save " +
                        recObjName,
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".updateEntityData",
                    {
                        params: funcParams,
                        thrownError: e,
                        context: { data: data }
                    },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        var saveFormData = function(pDataRecId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pDataRecId: pDataRecId
            };

            try {
                // Run our Before Save Hooks.  If we get a non-null result, we
                // display the message to the user and abort the save.
                var beforeSaveHookResultMsg = hookRunner(
                    beforeSaveFuncs,
                    pDataRecId
                );

                if (beforeSaveHookResultMsg !== null) {
                    QMessageBox.critical(
                        mywindow,
                        "Cannot Save " + ENTITY_DISPLAY_NAME + " Data",
                        beforeSaveHookResultMsg
                    );

                    return pDataRecId;
                }
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We encountered errors running 'Before Save' hook functions.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".saveFormData",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }

            var newDataRecId;
            var lovCache = Object.assign(
                lovOverrides[SC_DATA_TABLE + "_" + pDataRecId]
            );

            // If the pDataRecId parameter starts with "new" we insert,
            // otherwise it's an update.
            try {
                if (pDataRecId.toString().match(/^new/) !== null) {
                    newDataRecId = insertEntityData(pDataRecId);
                } else {
                    newDataRecId = updateEntityData(pDataRecId);
                }
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We failed to save entity record data.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".saveFormData",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }

            try {
                loadFormData(newDataRecId);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We failed to load Entity data record " +
                        SC_DATA_TABLE +
                        "_" +
                        newDataRecId +
                        "(" +
                        pDataRecId +
                        ") after saving.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".saveFormData",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }

            try {
                for (var currScLov in lovCache) {
                    pPublicApi.setLovQuery(
                        currScLov,
                        newDataRecId,
                        lovCache[currScLov]
                    );
                }
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We encountered errors restoring cached LOV overrides.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".saveFormData",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }

            try {
                // Run our After Save Hooks.  If we get a non-null result, we display
                // the message to the user.
                var afterSaveHookResultMsg = hookRunner(
                    afterSaveFuncs,
                    newDataRecId
                );

                if (afterSaveHookResultMsg !== null) {
                    QMessageBox.information(
                        mywindow,
                        "After Save " + ENTITY_DISPLAY_NAME + " Notices",
                        afterSaveHookResultMsg
                    );
                }
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We encountered errors running 'After Save' hook functions.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".saveFormData",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }

            return newDataRecId;
        };

        var initFormData = function(pDataRecId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pDataRecId: pDataRecId
            };

            // Create setValue hook objects
            var keys = Object.keys(DATA_STRUCT);
            for (var i = 0; i < keys.length; i++) {
                beforeSetFuncs[keys[i]] = [];
                afterSetFuncs[keys[i]] = [];
            }

            if (MuseUtils.realNull(pDataRecId) === null) {
                var newRecHandle = "new" + Date.now();

                data[SC_DATA_TABLE + "_" + newRecHandle] = {
                    database: Object.assign({}, DATA_STRUCT),
                    working: Object.assign({}, DATA_STRUCT)
                };

                lovOverrides[SC_DATA_TABLE + "_" + newRecHandle] = {};

                try {
                    // Run our On New Hooks.  If we get a non-null result, we
                    // display the message to the user.
                    var onNewHookMsg = hookRunner(onNewFuncs, newRecHandle);

                    if (onNewHookMsg !== null) {
                        QMessageBox.information(
                            mywindow,
                            "New " + ENTITY_DISPLAY_NAME + " Notices",
                            onNewHookMsg
                        );
                    }
                } catch (e) {
                    throw new MuseUtils.ApiException(
                        "musesuperchar",
                        "We encountered errors running 'On New' hook functions.",
                        "MuseArch.Data." + ENTITY_OBJECT_NAME + ".initFormData",
                        { params: funcParams, thrownError: e },
                        MuseUtils.LOG_WARNING
                    );
                }

                return newRecHandle;
            } else {
                try {
                    loadFormData(pDataRecId);
                } catch (e) {
                    throw new MuseUtils.ApiException(
                        "musesuperchar",
                        "We failed to initialize an existing Super Characteristic data record.",
                        "MuseArch.Data." + ENTITY_OBJECT_NAME + ".initFormData",
                        { params: funcParams, thrownError: e },
                        MuseUtils.LOG_WARNING
                    );
                }

                return pDataRecId;
            }
        };

        var getValue = function(pScIntName, pDataRecId) {
            return data[SC_DATA_TABLE + "_" + pDataRecId].working[pScIntName];
        };

        var sendUpdateSignal = function(pScIntName, pDataRecId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pScIntName: pScIntName,
                pDataRecId: pDataRecId
            };

            try {
                mainwindow.sEmitSignal(
                    "_@" +
                        PREFIX +
                        "@@" +
                        ENTITY_OBJECT_NAME +
                        "@@" +
                        pDataRecId +
                        "@@" +
                        pScIntName +
                        "@_",
                    "update"
                );
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We received errors while signalling that we set a value.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".sendUpdateSignal",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        var setValue = function(pScIntName, pDataRecId, pValue) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pScIntName: pScIntName,
                pDataRecId: pDataRecId,
                pValue: pValue
            };

            if (
                data[SC_DATA_TABLE + "_" + pDataRecId].working[pScIntName] ==
                pValue
            ) {
                // Nothing changed. Don't do anything else.  We need this to help
                // stop recursive set/signal loops, especially with XTextEdit.
                return;
            }

            try {
                // Run our Before Set Hooks.  If we get a non-null result, we
                // display the message to the user and abort the save.
                var beforeSetValueHookMsg = hookRunner(
                    beforeSetFuncs[pScIntName],
                    pDataRecId,
                    pValue
                );

                if (beforeSetValueHookMsg !== null) {
                    QMessageBox.critical(
                        mywindow,
                        "Value Not Set",
                        beforeSetValueHookMsg
                    );

                    sendUpdateSignal(pScIntName, pDataRecId);
                    return;
                }
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We encountered errors running 'Before Set Value' hook functions.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".setValue",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }

            data[SC_DATA_TABLE + "_" + pDataRecId].working[pScIntName] = pValue;

            try {
                // Run our After Set Hooks.  If we get a non-null result, we display
                // the message to the user.
                var afterSetValueHookMsg = hookRunner(
                    afterSetFuncs[pScIntName],
                    pDataRecId,
                    pValue
                );

                if (afterSetValueHookMsg !== null) {
                    QMessageBox.information(
                        mywindow,
                        "After Set Value Notices",
                        afterSetValueHookMsg
                    );
                }
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musesuperchar",
                    "We encountered errors running 'After Set Value' hook functions.",
                    "MuseArch.Data." + ENTITY_OBJECT_NAME + ".setValue",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }

            sendUpdateSignal(pScIntName, pDataRecId);
        };

        var getDataStructure = function() {
            var returnDataObj = {};
            Object.assign(returnDataObj, DATA_STRUCT);
            return returnDataObj;
        };

        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------
        pPublicApi.getEntitySchemaName = function() {
            return ENTITY_SCHEMA;
        };

        pPublicApi.getEntityTableName = function() {
            return ENTITY_TABLE;
        };

        pPublicApi.getEntityDisplayName = function() {
            return ENTITY_DISPLAY_NAME;
        };

        pPublicApi.getEntityDataTableName = function() {
            return SC_DATA_TABLE;
        };

        pPublicApi.getEntityDataTablePkName = function() {
            return SC_DATA_TABLE_PK;
        };

        pPublicApi.getValue = function(pScIntName, pDataRecId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pScIntName: pScIntName,
                pDataRecId: pDataRecId
            };

            if (!DATA_STRUCT.hasOwnProperty(pScIntName)) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not understand for which Super Characteristic we should retrieve a value.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.getValue",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (
                MuseUtils.realNull(pDataRecId) === null ||
                (!MuseUtils.isValidId(pDataRecId) &&
                    pDataRecId.toString().match(/^new/) === null)
            ) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We must have a valid entity data record identifier.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.getValue",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (!data.hasOwnProperty(SC_DATA_TABLE + "_" + pDataRecId)) {
                throw new MuseUtils.NotFoundException(
                    "musesuperchar",
                    "The requested entity data record is not currently initialized.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.getValue",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            return getValue(pScIntName, pDataRecId);
        };

        pPublicApi.setValue = function(pScIntName, pDataRecId, pValue) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pScIntName: pScIntName,
                pDataRecId: pDataRecId,
                pValue: pValue
            };

            if (!DATA_STRUCT.hasOwnProperty(pScIntName)) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not understand for which Super Characteristic you wished to set a value.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.setValue",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (
                MuseUtils.realNull(pDataRecId) === null ||
                (!MuseUtils.isValidId(pDataRecId) &&
                    pDataRecId.toString().match(/^new/) === null)
            ) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We must have a valid entity data record identifier.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.setValue",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (!data.hasOwnProperty(SC_DATA_TABLE + "_" + pDataRecId)) {
                throw new MuseUtils.NotFoundException(
                    "musesuperchar",
                    "The requested entity data record is not currently initialized.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.setValue",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            return setValue(pScIntName, pDataRecId, pValue);
        };

        pPublicApi.getDataStructure = function() {
            return getDataStructure();
        };

        pPublicApi.initFormData = function(pDataRecId) {
            return initFormData(pDataRecId);
        };

        pPublicApi.saveFormData = function(pDataRecId) {
            var funcParams = {
                pDataRecId: pDataRecId
            };

            if (
                MuseUtils.realNull(pDataRecId) === null ||
                (!MuseUtils.isValidId(pDataRecId) &&
                    pDataRecId.toString().match(/^new/) === null)
            ) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We must have a valid entity data record identifier.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.saveFormData",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            return saveFormData(pDataRecId);
        };

        pPublicApi.loadFormData = function(pDataRecId) {
            var funcParams = {
                pDataRecId: pDataRecId
            };

            if (
                MuseUtils.realNull(pDataRecId) === null ||
                (!MuseUtils.isValidId(pDataRecId) &&
                    pDataRecId.toString().match(/^new/) === null)
            ) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We must have a valid entity data record identifier.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.saveFormData",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            return loadFormData(pDataRecId);
        };

        pPublicApi.addOnNewHookFunc = function(pFunc) {
            var funcParams = {
                pFunc: pFunc
            };

            if (typeof pFunc !== "function") {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not find a function to add to the event processing sequence.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.addOnNewHookFunc",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            addOnNewHookFunc(pFunc);
        };

        pPublicApi.addOnLoadHookFunc = function(pFunc) {
            var funcParams = {
                pFunc: pFunc
            };

            if (typeof pFunc !== "function") {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not find a function to add to the event processing sequence.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.addOnLoadHookFunc",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            addOnLoadHookFunc(pFunc);
        };

        pPublicApi.addBeforeSetHookFunc = function(pScIntName, pFunc) {
            var funcParams = {
                pScIntName: pScIntName,
                pFunc: pFunc
            };

            if (!DATA_STRUCT.hasOwnProperty(pScIntName)) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not understand to which Super Characteristic you wished to apply a function.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.addBeforeSetHookFunc",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (typeof pFunc !== "function") {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not find a function to add to the event processing sequence.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.addBeforeSetHookFunc",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            addBeforeSetHookFunc(pScIntName, pFunc);
        };

        pPublicApi.addAfterSetHookFunc = function(pScIntName, pFunc) {
            var funcParams = {
                pScIntName: pScIntName,
                pFunc: pFunc
            };

            if (!DATA_STRUCT.hasOwnProperty(pScIntName)) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not understand to which Super Characteristic you wished to apply a function.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.addAfterSetHookFunc",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (typeof pFunc !== "function") {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not find a function to add to the event processing sequence.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.addAfterSetHookFunc",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            addAfterSetHookFunc(pScIntName, pFunc);
        };

        pPublicApi.addBeforeSaveHookFunc = function(pFunc) {
            var funcParams = {
                pFunc: pFunc
            };

            if (typeof pFunc !== "function") {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not find a function to add to the event processing sequence.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.addBeforeSaveHookFunc",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            addBeforeSaveHookFunc(pFunc);
        };

        pPublicApi.addAfterSaveHookFunc = function(pFunc) {
            var funcParams = {
                pFunc: pFunc
            };

            if (typeof pFunc !== "function") {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not find a function to add to the event processing sequence.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.addAfterSaveHookFunc",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            addAfterSaveHookFunc(pFunc);
        };

        pPublicApi.setLovQuery = function(pScIntName, pDataRecId, pXSqlQuery) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pScIntName: pScIntName,
                pDataRecId: pDataRecId,
                pXSqlQuery: pXSqlQuery
            };

            if (!DATA_STRUCT.hasOwnProperty(pScIntName)) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not understand for which Super Characteristic you wished to provide an pXSqlQuery.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.setLovQuery",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (
                MuseUtils.realNull(pDataRecId) === null ||
                (!MuseUtils.isValidId(pDataRecId) &&
                    pDataRecId.toString().match(/^new/) === null)
            ) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We must have a valid entity data record identifier.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.setLovQuery",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (
                !lovOverrides.hasOwnProperty(SC_DATA_TABLE + "_" + pDataRecId)
            ) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "The requested entity data record is not currently initialized.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.setLovQuery",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (
                typeof pXSqlQuery.lastError !== "function" ||
                pXSqlQuery.lastError().type != QSqlError.NoError
            ) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "The query object passed to us does not seem to be a valid query object.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.setLovQuery",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            return setLovQuery(pScIntName, pDataRecId, pXSqlQuery);
        };

        pPublicApi.getLovQuery = function(pScIntName, pDataRecId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pScIntName: pScIntName,
                pDataRecId: pDataRecId
            };

            if (
                MuseUtils.realNull(pDataRecId) === null ||
                (!MuseUtils.isValidId(pDataRecId) &&
                    pDataRecId.toString().match(/^new/) === null)
            ) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We must have a valid entity data record identifier.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.getLovQuery",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (
                !lovOverrides.hasOwnProperty(SC_DATA_TABLE + "_" + pDataRecId)
            ) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "The requested entity data record is not currently initialized.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.getLovQuery",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            if (
                !lovOverrides[SC_DATA_TABLE + "_" + pDataRecId].hasOwnProperty(
                    pScIntName
                )
            ) {
                throw new MuseUtils.ParameterException(
                    "musesuperchar",
                    "We did not understand for which Super Characteristic we should retrieve an LOV query.",
                    "MuseArch.Data." +
                        ENTITY_OBJECT_NAME +
                        ".pPublicApi.getLovQuery",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }

            return getLovQuery(pScIntName, pDataRecId);
        };
    } catch (e) {
        var error = new MuseUtils.ModuleException(
            "musesuperchar",
            "We enountered a MuseArch.Data module error that wasn't otherwise caught and handled.",
            "MuseArch.Data",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );
        MuseUtils.displayError(error, mainwindow);
    }
})(this.MuseArch.Data);
