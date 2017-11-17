/*************************************************************************
 *************************************************************************
 **
 ** File:        museUtilsDb.js
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

    this.MuseUtils = this.MuseUtils || {};

    //////////////////////////////////////////////////////////////////////////
    //  Imports
    //////////////////////////////////////////////////////////////////////////

    if (!MuseUtils.isMuseUtilsExceptionLoaded) {
        include("museUtilsException");
    }

    if (!MuseUtils.isMuseUtilsJsLoaded) {
        include("museUtilsJs");
    }

    //////////////////////////////////////////////////////////////////////////
    //  Module Defintion
    //////////////////////////////////////////////////////////////////////////

    (function(pPublicApi) {
        //--------------------------------------------------------------------
        //  "Private" Functional Logic
        //--------------------------------------------------------------------
        var getQtSqlQueryStats = function(pSqlQuery) {
            var vReturnText =
                "toString: " +
                pSqlQuery.toString() +
                "\n" +
                "first: " +
                pSqlQuery.first() +
                "\n" +
                "isActive: " +
                pSqlQuery.isActive() +
                "\n" +
                "isValid: " +
                pSqlQuery.isValid() +
                "\n" +
                "isForwardOnly: " +
                pSqlQuery.isForwardOnly() +
                "\n" +
                "isSelect: " +
                pSqlQuery.isSelect() +
                "\n" +
                "size: " +
                pSqlQuery.size() +
                "\n" +
                "numRowsAffected: " +
                pSqlQuery.numRowsAffected() +
                "\n" +
                "lastError: " +
                JSON.stringify(pSqlQuery.lastError());

            return vReturnText;
        };

        var getJsonQueryResult = function(
            pQueryText,
            pMetaSqlGroup,
            pMetaSqlName,
            pParams
        ) {
            // Run the query and test if we had a query error.
            var queryResult;

            // Figure out which of the xTuple standard execute query functions
            // we need to call and call the correct version of that.  Start with
            // being either query text or metasql based and then look if we have
            // params or not.  If we're given both query types... metasql wins.
            if (
                MuseUtils.realNull(pMetaSqlGroup) !== null &&
                MuseUtils.realNull(pMetaSqlName) !== null
            ) {
                // We obstensively have a metasql based query.
                if (MuseUtils.realNull(pParams) === null) {
                    queryResult = toolbox.executeDbQuery(
                        pMetaSqlGroup,
                        pMetaSqlName
                    );
                } else {
                    queryResult = toolbox.executeDbQuery(
                        pMetaSqlGroup,
                        pMetaSqlName,
                        pParams
                    );
                }
            } else {
                // We we'll try a text based query.
                if (MuseUtils.realNull(pParams) === null) {
                    queryResult = toolbox.executeQuery(pQueryText);
                } else {
                    queryResult = toolbox.executeQuery(pQueryText, pParams);
                }
            }

            // Check for query errors since the query will have been executed by
            // this point.
            if (queryResult.lastError().type != QSqlError.NoError) {
                throw new MuseUtils.DatabaseException(
                    "musextputils",
                    "MuseUtils.getJsonQueryResult",
                    "We encountered a database error.",
                    {
                        params: {
                            pQueryText: pQueryText,
                            pParams: pParams
                        },
                        databaseError: queryResult.lastError()
                    }
                );
            }

            // Based on the fields we have in the a representative record, we
            // construct a populating function.
            var functionString = " return { ";
            queryRecord = queryResult.record();

            // Get the variables in the JSON return format.
            for (var i = 0; i < queryRecord.count(); i++) {
                functionString =
                    functionString +
                    queryRecord.fieldName(i) +
                    ': this.value("' +
                    queryRecord.fieldName(i) +
                    '"), ';
            }

            // Close the function and call it good.
            functionString = functionString + " };";

            // Create our custom function.
            queryResult.returnRecord = new Function(functionString);

            // Now we add our extended functionality to the XSqlQuery object.
            queryResult.firstJson = function() {
                // Call the native first function.  If true, we should be able
                // to call our meta-function and return a JSON record.  If not,
                // return null.
                if (this.first()) {
                    return this.returnRecord();
                } else {
                    return null;
                }
            };

            queryResult.lastJson = function() {
                // Call the native last function.  If true, we should be able
                // to call our meta-function and return a JSON record.  If not,
                // return null.
                if (this.last()) {
                    return this.returnRecord();
                } else {
                    return null;
                }
            };

            queryResult.nextJson = function() {
                // Call the native next function.  If true, we should be able
                // to call our meta-function and return a JSON record.  If not,
                // return null.
                if (this.next()) {
                    return this.returnRecord();
                } else {
                    return null;
                }
            };

            queryResult.previousJson = function() {
                // Call the native previous function.  If true, we should be able
                // to call our meta-function and return a JSON record.  If not,
                // return null.
                if (this.previous()) {
                    return this.returnRecord();
                } else {
                    return null;
                }
            };

            queryResult.getJsonValues = function() {
                // Call the native isValidS function.  If true, we should be able
                // to call our meta-function and return a JSON record.  If not,
                // return null.
                if (this.isValid()) {
                    return this.returnRecord();
                } else {
                    return null;
                }
            };

            return queryResult;
        };

        var setDbTransVariable = function(pPackage, pVariable, pValue) {
            // Set the variable.
            var tranVarQry;
            try {
                tranVarQry = toolbox.executeQuery(
                    "SELECT musextputils.set_trans_variable( " +
                        '            <? value("pPackage") ?> ' +
                        '           ,<? value("pVariable") ?> ' +
                        '           ,<? value("pValue") ?>) AS result',
                    {
                        pPackage: pPackage,
                        pVariable: pVariable,
                        pValue: pValue
                    }
                );

                if (
                    tranVarQry.first() &&
                    MuseUtils.isTrue(tranVarQry.value("result"))
                ) {
                    return;
                } else {
                    throw new MuseUtils.DatabaseException(
                        "musextputils",
                        "We failed to set a database transaction variable.",
                        "musextputils.setDbTransVariable",
                        {
                            params: {
                                pPackage: pPackage,
                                pVariable: pVariable,
                                pValue: pValue
                            }
                        }
                    );
                }
            } catch (e) {
                throw new MuseUtils.DatabaseException(
                    "musextputils",
                    "We encountered a database error trying to set a transaction variable.",
                    "musextputils.setDbTransVariable",
                    {
                        params: {
                            pPackage: pPackage,
                            pVariable: pVariable,
                            pValue: pValue
                        },
                        databaseError: tranVarQry.lastError(),
                        thrownError: e
                    }
                );
            }
        };

        var setDbSessionVariable = function(pPackage, pVariable, pValue) {
            // Set the variable.
            var sessVarQry;
            try {
                sessVarQry = toolbox.executeQuery(
                    "SELECT musextputils.set_session_variable( " +
                        '            <? value("pPackage") ?> ' +
                        '           ,<? value("pVariable") ?> ' +
                        '           ,<? value("pValue") ?>) AS result',
                    {
                        pPackage: pPackage,
                        pVariable: pVariable,
                        pValue: pValue
                    }
                );

                if (
                    sessVarQry.first() &&
                    MuseUtils.isTrue(sessVarQry.value("result"))
                ) {
                    return;
                } else {
                    throw new MuseUtils.DatabaseException(
                        "musextputils",
                        "We failed to set a database session variable.",
                        "musextputils.setDbSessionVariable",
                        {
                            params: {
                                pPackage: pPackage,
                                pVariable: pVariable,
                                pValue: pValue
                            }
                        }
                    );
                }
            } catch (e) {
                throw new MuseUtils.DatabaseException(
                    "musextputils",
                    "We encountered a database error trying to set a session variable.",
                    "musextputils.setDbSessionVariable",
                    {
                        params: {
                            pPackage: pPackage,
                            pVariable: pVariable,
                            pValue: pValue
                        },
                        databaseError: sessVarQry.lastError(),
                        thrownError: e
                    }
                );
            }
        };

        var getDbVariable = function(pPackage, pVariable, pType) {
            // Resolve the pType, javascript oriented type value to one the
            // database understands.
            var vResolvedType;

            switch (pType.toString().toLowerCase()) {
                case "float":
                    vResolvedType = "numeric";
                    break;
                case "integer":
                    vResolvedType = "bigint";
                    break;
                case "date":
                    vResolvedType = "timestamptz";
                    break;
                default:
                    vResolvedType = pType;
            }

            // Get the variable.
            var getVarQry;
            try {
                getVarQry = toolbox.executeQuery(
                    "SELECT musextputils.get_variable( " +
                        '            <? value("pPackage") ?> ' +
                        '           ,<? value("pVariable") ?> ' +
                        '           ,<? value("vResolvedType") ?>) AS result',
                    {
                        pPackage: pPackage,
                        pVariable: pVariable,
                        vResolvedType: vResolvedType
                    }
                );

                if (getVarQry.first()) {
                    // we have our result, let's cast it to something more
                    // specific.
                    switch (pType) {
                        case "boolean":
                            return MuseUtils.isTrue(getVarQry.value("result"));
                        case "text":
                            return getVarQry.value("result");
                        case "float":
                            return parseFloat(getVarQry.value("result"));
                        case "integer":
                            return parseInt(getVarQry.value("result"));
                        case "date":
                            return new Date(getVarQry.value("result"));
                        default:
                            throw new MuseUtils.NotFoundException(
                                "musextputils",
                                "We could not retrieve a database variable",
                                "musextputils.get_variable",
                                {
                                    params: {
                                        pPackage: pPackage,
                                        pVariable: pVariable,
                                        pType: pType
                                    },
                                    vResolvedType: vResolvedType
                                }
                            );
                    }
                } else {
                    throw new MuseUtils.DatabaseException(
                        "musextputils",
                        "We failed to retrieve the requested database variable.",
                        "musextputils.getDbVariable",
                        {
                            params: {
                                pPackage: pPackage,
                                pVariable: pVariable,
                                pType: pType
                            },
                            vResolvedType: vResolvedType
                        }
                    );
                }
            } catch (e) {
                throw new MuseUtils.DatabaseException(
                    "musextputils",
                    "We encountered a database error trying to retrieve a database variable.",
                    "musextputils.getDbVariable",
                    {
                        params: {
                            pPackage: pPackage,
                            pVariable: pVariable,
                            pType: pType
                        },
                        vResolvedType: vResolvedType,
                        databaseError: getVarQry.lastError(),
                        thrownError: e
                    }
                );
            }
        };

        var getXtupleVersion = function() {
            var versionQry = toolbox.executeQuery(
                "SELECT major_version, minor_version, patch_version FROM " +
                    "musextputils.get_xtuple_version() "
            );
            if (versionQry.first()) {
                return {
                    major: parseInt(versionQry.value("major_version")),
                    minor: parseInt(versionQry.value("minor_version")),
                    patch: parseInt(versionQry.value("patch_version"))
                };
            } else {
                throw new MuseUtils.DatabaseException(
                    "musextputils",
                    "We failed to get the xTuple ERP version.",
                    "MuseUtils.getXtupleVersion",
                    { databaseError: versionQry.lastError() }
                );
            }
        };

        var getDataMap = function(pSchema, pTable) {
            try {
                // Get the column names from the database catalog.  We exclude the
                // fields for the audit triggers.  We nominally control the naming
                // and assignment, so we relucantly hard code the trigger name
                // pattern here.
                var dataMapQuery = MuseUtils.executeQuery(
                    "SELECT jsonb_object( " +
                        "            array_agg(q.json_key), " +
                        "            array_agg(q.json_value)) AS data_map " +
                        "FROM     " +
                        "    (SELECT vbc.column_name AS json_key, null::text AS json_value " +
                        "     FROM musextputils.v_basic_catalog vbc  " +
                        "         JOIN pg_catalog.pg_trigger pt  " +
                        "             ON vbc.table_oid = pt.tgrelid   " +
                        "     WHERE pt.tgname ~ 'trig_b_iu_audit_field_maintenance'  " +
                        '         AND vbc.table_schema_name = <? value("pSchema") ?>' +
                        '         AND vbc.table_name =  <? value("pTable") ?>  ' +
                        "         AND vbc.column_ordinal > 0  " +
                        "         AND NOT vbc.column_name = ANY(string_to_array( " +
                        "                                    encode(tgargs, 'escape'),E'\\\\000'))  " +
                        "     ORDER BY column_ordinal) q",
                    {
                        pSchema: pSchema,
                        pTable: pTable
                    }
                );

                if (dataMapQuery.first()) {
                    return JSON.parse(dataMapQuery.value("data_map"));
                } else {
                    throw new MuseUtils.NotFoundException(
                        "musextputils",
                        "We failed to retrieve the requested data map.",
                        "MuseUtils.getDataMap",
                        {
                            params: {
                                pSchema: pSchema,
                                pTable: pTable
                            }
                        }
                    );
                }
            } catch (e) {
                throw new MuseUtils.DatabaseException(
                    "musextputils",
                    "We encountered an error trying to retrieve a data map.",
                    "MuseUtils.getDataMap",
                    {
                        params: {
                            pSchema: pSchema,
                            pTable: pTable
                        },
                        thrownError: e
                    }
                );
            }
        };

        var getDifferencedData = function(
            pNewMappedData,
            pOldMappedData,
            pKeyColumnName
        ) {
            var returnData = {};

            // Check to see if we have old data.  If not, then we should just return
            // the object we were passed, sans the undefined values.
            if (MuseUtils.realNull(pOldMappedData) === null) {
                for (var tmpNewField in pNewMappedData) {
                    if (
                        pNewMappedData.hasOwnProperty(tmpNewField) &&
                        pNewMappedData[tmpNewField] !== undefined
                    ) {
                        returnData[tmpNewField] = pNewMappedData[tmpNewField];
                    }
                }
            } else {
                // We have both old and new data so difference them.
                for (var tmpDiffField in pNewMappedData) {
                    if (
                        pNewMappedData.hasOwnProperty(tmpDiffField) &&
                        pNewMappedData[tmpDiffField] !== undefined
                    ) {
                        // Check to see if we have difference data.  Note that we do
                        // not consider the primary key of the table to be
                        // changeable through this mechanism; and that the
                        // formulation is always <table name>_id.
                        if (
                            pNewMappedData[tmpDiffField] !=
                                pOldMappedData[tmpDiffField] ||
                            tmpDiffField == pKeyColumnName
                        ) {
                            returnData[tmpDiffField] =
                                pNewMappedData[tmpDiffField];
                        }
                    }
                }
            }
            return returnData;
        };

        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------

        pPublicApi.getQtSqlQueryStats = function(pSqlQuery) {
            try {
                //Validate the parameters
                if (pSqlQuery === null || pSqlQuery.isSelect === undefined) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We require an XSqlQuery or QSqlQuery object to process this function.",
                        "MuseUtils.pPublicApi.getQtSqlQueryStats",
                        { params: pSqlQuery.toString() }
                    );
                }

                // Call the function.
                getQtSqlQueryStats(pSqlQuery);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.getQtSqlQueryStats",
                    {
                        params: { pSqlQuery: pSqlQuery },
                        thrownError: e
                    }
                );
            }
        };

        pPublicApi.executeQuery = function(pQueryText, pParams) {
            try {
                // Validate parameters
                if (MuseUtils.realNull(pQueryText) === null) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We did not understand the requested database query.",
                        "MuseUtils.pPublicApi.executeQuery",
                        {
                            params: {
                                pQueryText: pQueryText,
                                pParams: pParams
                            }
                        }
                    );
                }

                return getJsonQueryResult(pQueryText, null, null, pParams);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.executeQuery",
                    {
                        params: { pQueryText: pQueryText, pParams: pParams },
                        thrownError: e
                    }
                );
            }
        };

        pPublicApi.executeDbQuery = function(
            pMetaSqlGroup,
            pMetaSqlName,
            pParams
        ) {
            try {
                // Validate parameters
                if (
                    MuseUtils.realNull(pMetaSqlGroup) === null ||
                    MuseUtils.realNull(pMetaSqlName) === null
                ) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "MuseUtils.pPublicApi.executeDbQuery",
                        "We did not understand the requested database query.",
                        {
                            params: {
                                pMetaSqlGroup: pMetaSqlGroup,
                                pMetaSqlName: pMetaSqlName,
                                pParams: pParams
                            }
                        }
                    );
                }

                return getJsonQueryResult(
                    null,
                    pMetaSqlGroup,
                    pMetaSqlName,
                    pParams
                );
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.executeDbQuery",
                    {
                        params: {
                            pMetaSqlGroup: pMetaSqlGroup,
                            pMetaSqlName: pMetaSqlName,
                            pParams: pParams
                        },
                        thrownError: e
                    }
                );
            }
        };

        pPublicApi.setDbTransVariable = function(pPackage, pVariable, pValue) {
            try {
                //Validate our parameters
                if (MuseUtils.realNull(pPackage) === null) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We require a valid package name.",
                        "musextputils.pPublicApi.setDbTransVariable",
                        {
                            params: {
                                pPackage: pPackage,
                                pVariable: pVariable,
                                pValue: pValue
                            }
                        }
                    );
                } else if (MuseUtils.realNull(pVariable) === null) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We require a valid variable name.",
                        "musextputils.pPublicApi.setDbTransVariable",
                        {
                            params: {
                                pPackage: pPackage,
                                pVariable: pVariable,
                                pValue: pValue
                            }
                        }
                    );
                }

                return setDbTransVariable(pPackage, pVariable, pValue);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.setDbTransVariable",
                    {
                        params: {
                            pPackage: pPackage,
                            pVariable: pVariable,
                            pValue: pValue
                        },
                        thrownError: e
                    }
                );
            }
        };

        pPublicApi.setDbSessionVariable = function(
            pPackage,
            pVariable,
            pValue
        ) {
            try {
                //Validate our parameters
                if (MuseUtils.realNull(pPackage) === null) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We require a valid package name.",
                        "musextputils.pPublicApi.setDbSessionVariable",
                        {
                            params: {
                                pPackage: pPackage,
                                pVariable: pVariable,
                                pValue: pValue
                            }
                        }
                    );
                } else if (MuseUtils.realNull(pVariable) === null) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We require a valid variable name.",
                        "musextputils.pPublicApi.setDbSessionVariable",
                        {
                            params: {
                                pPackage: pPackage,
                                pVariable: pVariable,
                                pValue: pValue
                            }
                        }
                    );
                }

                return setDbSessionVariable(pPackage, pVariable, pValue);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.setDbSessionVariable",
                    {
                        params: {
                            pPackage: pPackage,
                            pVariable: pVariable,
                            pValue: pValue
                        },
                        thrownError: e
                    }
                );
            }
        };

        pPublicApi.getDbVariable = function(pPackage, pVariable, pType) {
            try {
                // Validate our parameters. Mostly pType as we have limits on what
                // is acceptable.
                if (MuseUtils.realNull(pPackage) === null) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We require a valid package name.",
                        "musextputils.pPublicApi.getDbVariable",
                        {
                            params: {
                                pPackage: pPackage,
                                pVariable: pVariable,
                                pType: pType
                            }
                        }
                    );
                } else if (MuseUtils.realNull(pVariable) === null) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We require a valid variable name.",
                        "musextputils.pPublicApi.getDbVariable",
                        {
                            params: {
                                pPackage: pPackage,
                                pVariable: pVariable,
                                pType: pType
                            }
                        }
                    );
                } else if (
                    MuseUtils.realNull(pType) === null ||
                    (pType.toString().toLowerCase() != "boolean" &&
                        pType.toString().toLowerCase() != "text" &&
                        pType.toString().toLowerCase() != "float" &&
                        pType.toString().toLowerCase() != "integer" &&
                        pType.toString().toLowerCase() != "date")
                ) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We require a valid type name.",
                        "musextputils.pPublicApi.getDbVariable",
                        {
                            params: {
                                pPackage: pPackage,
                                pVariable: pVariable,
                                pType: pType
                            }
                        }
                    );
                }

                return getDbVariable(pPackage, pVariable, pType);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.getDbVariable",
                    {
                        params: {
                            pPackage: pPackage,
                            pVariable: pVariable,
                            pType: pType
                        },
                        thrownError: e
                    }
                );
            }
        };

        pPublicApi.getXtupleVersion = function() {
            try {
                getXtupleVersion();
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during the execution of an API call.",
                    "MuseUtils.pPublicApi.getXtupleVersion",
                    {
                        thrownError: e
                    }
                );
            }
        };

        pPublicApi.getDataMap = function(pSchema, pTable) {
            if (MuseUtils.realNull(pSchema) === null) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "You must supply the schema name that contains the desired table to data map.",
                    "MuseUtils.pPublicApi.getDataMap",
                    {
                        params: {
                            pSchema: pSchema,
                            pTable: pTable
                        }
                    }
                );
            }

            if (MuseUtils.realNull(pTable) === null) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "You must supply the table name that you wish to map.",
                    "MuseUtils.pPublicApi.getDataMap",
                    {
                        params: {
                            pSchema: pSchema,
                            pTable: pTable
                        }
                    }
                );
            }

            try {
                return getDataMap(pSchema, pTable);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We encountered an error processing a data map retrieval request.",
                    "MuseUtils.pPublicApi.getDataMap",
                    {
                        params: {
                            pSchema: pSchema,
                            pTable: pTable
                        }
                    }
                );
            }
        };

        pPublicApi.getDifferencedData = function(
            pNewMappedData,
            pOldMappedData,
            pKeyColumnName
        ) {
            var funcParams = {
                pNewMappedData: pNewMappedData,
                pOldMappedData: pOldMappedData,
                pKeyColumnName: pKeyColumnName
            };

            // Validate our parameters
            if (MuseUtils.realNull(pNewMappedData) === null) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We did understand the 'new' mapped data parameter.",
                    "MuseUtils.pPublicApi.getDifferencedData",
                    {
                        params: funcParams
                    }
                );
            }

            try {
                return getDifferencedData(
                    pNewMappedData,
                    pOldMappedData,
                    pKeyColumnName
                );
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We encountered an error processing differencing old and new data.",
                    "MuseUtils.pPublicApi.getDifferencedData",
                    {
                        params: funcParams
                    }
                );
            }
        };

        // Set a flag indicating that this library is loaded.
        pPublicApi.isMuseUtilsDbLoaded = true;
    })(MuseUtils);
} catch (e) {
    QMessageBox.critical(
        mainwindow,
        "Muse Systems xTuple Utilities",
        "We failed loading the exception utilities. \n\n" + e.message
    );
}
