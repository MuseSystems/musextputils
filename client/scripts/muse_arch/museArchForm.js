/*************************************************************************
 *************************************************************************
 **
 ** File:        museArchForm.js
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
    if (typeof MuseArch.Groups === "undefined") {
        MuseArch.Groups = {};
    }
    if (typeof MuseArch.Form === "undefined") {
        MuseArch.Form = {};
    }

    //////////////////////////////////////////////////////////////////////////
    //  Imports
    //////////////////////////////////////////////////////////////////////////

    if (typeof MuseUtils === "undefined") {
        include("museUtils");
    }

    MuseUtils.loadMuseUtils([
        MuseUtils.MOD_EXCEPTION,
        MuseUtils.MOD_JS,
        MuseUtils.MOD_JSPOLYFILL,
        MuseUtils.MOD_QT,
        MuseUtils.MOD_CONFIG
    ]);
} catch (e) {
    if (
        typeof MuseUtils !== "undefined" &&
        (MuseUtils.isMuseUtilsExceptionLoaded === true ? true : false)
    ) {
        var error = new MuseUtils.ScriptException(
            "musextputils",
            "We encountered a script level issue while processing MuseArch.Form.",
            "MuseArch.Form",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );

        MuseUtils.displayError(error, mainwindow);
    } else {
        QMessageBox.critical(
            mainwindow,
            "MuseArch.Form Script Error",
            "We encountered a script level issue while processing MuseArch.Form."
        );
    }
}

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi) {
    try {
        //--------------------------------------------------------------------
        //  Constants & Module State
        //--------------------------------------------------------------------

        // Constants
        var SC_DEFS = {};
        var PREFIX = "";
        var FORM_OBJECT_NAME = "";

        // Internal State
        var myEntityObjectName;
        var myEntityDataRecId;
        var myMode = null;
        var myIsConnectsSet = false;
        var sections = {};
        var labels = {};
        var widgets = {};

        // Context for exceptions
        var context = { not_initialized: "call 'set' first" };

        //--------------------------------------------------------------------
        //  Get Object References From Screen Definitions
        //--------------------------------------------------------------------
        sections = {};

        labels = {};

        widgets = {};

        //--------------------------------------------------------------------
        //  Custom Screen Objects and Starting GUI Manipulation
        //--------------------------------------------------------------------
        widgets.load_type.allowNull = true;
        widgets.load_type.nullStr = "-- Please Select --";
        MuseUtils.numericLineEdit(widgets.cases, 0);

        //--------------------------------------------------------------------
        //  "Private" Functional Logic
        //--------------------------------------------------------------------
        var isFormInitialized = function() {
            return (
                MuseUtils.realNull(myEntityObjectName) !== null &&
                MuseUtils.realNull(myEntityDataRecId) !== null &&
                MuseUtils.realNull(myMode) !== null &&
                ["new", "edit", "view"].includes(myMode) &&
                (MuseUtils.isValidId(myEntityDataRecId) ||
                    myEntityDataRecId.match(/^new/) !== null)
            );
        };

        var populateScDefLov = function(pScDefIntName) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pScDefIntName: pScDefIntName
            };

            var lovQry;

            try {
                lovQry = MuseUtils.executeQuery(
                    "SELECT scdef_list_query " +
                        "FROM musesuperchar.scdef " +
                        "WHERE scdef_internal_name = <? value('pScDefIntName') ?> ",
                    { pScDefIntName: pScDefIntName }
                );
            } catch (e) {
                throw new MuseUtils.DatabaseException(
                    "musextputils",
                    "We encountered a database problem looking up a Super Characteristic.",
                    "MuseArch." + FORM_OBJECT_NAME + ".populateScDefLov",
                    { params: funcParams, thrownError: e, context: context },
                    MuseUtils.LOG_WARNING
                );
            }

            if (!lovQry.first()) {
                throw new MuseUtils.NotFoundException(
                    "musextputils",
                    "We failed to find the requested Super Characteristic.",
                    "Fully Qualified Function Name",
                    { params: funcParams, context: context },
                    MuseUtils.LOG_WARNING
                );
            }

            if (MuseUtils.realNull(lovQry.value("scdef_list_query")) !== null) {
                return lovQry.value("scdef_list_query");
            } else {
                try {
                    return MuseUtils.executeQuery(
                        "SELECT id, lov " +
                            "FROM  " +
                            "(SELECT row_number() over () AS id, lov " +
                            "FROM unnest((SELECT scdef_values_list " +
                            "FROM musesuperchar.scdef " +
                            "WHERE scdef_internal_name = <? value('pScDefIntName') ?>)) lov) q",
                        { pScDefIntName: pScDefIntName }
                    );
                } catch (e) {
                    throw new MuseUtils.DatabaseException(
                        "musextputils",
                        "We encountered a database problem retrieving a Super Characteristic list of values.",
                        "MuseArch." + FORM_OBJECT_NAME + ".populateScDefLov",
                        {
                            params: funcParams,
                            thrownError: e,
                            context: context
                        },
                        MuseUtils.LOG_WARNING
                    );
                }
            }
        };

        var populateComboboxes = function() {
            var keys = Object.keys(SC_DEFS);

            for (var i = 0; i < keys.length; i++) {
                if (SC_DEFS[keys[i]] == "combobox") {
                    widgets[keys[i]].populate(populateScDefLov(keys[i]));
                }
            }
        };

        var setViewOnly = function() {
            var keys = Object.keys(sections);

            for (var i = 0; i < keys.length; i++) {
                sections[keys[i]].enabled = false;
            }
        };

        var setEditable = function() {
            var keys = Object.keys(sections);

            for (var i = 0; i < keys.length; i++) {
                sections[keys[i]].enabled = true;
            }
        };

        var setMode = function() {
            if (myMode == "new" || myMode == "edit") {
                setEditable();
            } else {
                setViewOnly();
            }
        };

        var setDataValue = function(pScDefIntName, pValue) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pScDefIntName: pScDefIntName,
                pValue: pValue
            };

            MuseArch.Data[myEntityObjectName].setValue(
                pScDefIntName,
                myEntityDataRecId,
                pValue
            );
        };

        var updateValue = function(pScDefIntName) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pScDefIntName: pScDefIntName
            };

            try {
                var dataObj = MuseArch.Data[myEntityObjectName];

                switch (SC_DEFS[pScDefIntName]) {
                    case "textfield":
                        widgets[pScDefIntName].text = dataObj.getValue(
                            pScDefIntName,
                            myEntityDataRecId
                        );
                        break;
                    case "textarea":
                        var newVal = dataObj.getValue(
                            pScDefIntName,
                            myEntityDataRecId
                        );
                        if (
                            widgets[pScDefIntName].document.toPlainText() !=
                            newVal
                        ) {
                            widgets[pScDefIntName].setPlainText(newVal);
                        }
                        break;
                    case "datecluster":
                        widgets[pScDefIntName].date = dataObj.getValue(
                            pScDefIntName,
                            myEntityDataRecId
                        );
                        break;
                    case "checkbox":
                        widgets[pScDefIntName].checked = dataObj.getValue(
                            pScDefIntName,
                            myEntityDataRecId
                        );
                        break;
                    case "combobox":
                        widgets[pScDefIntName].code =
                            MuseUtils.realNull(
                                dataObj.getValue(
                                    pScDefIntName,
                                    myEntityDataRecId
                                )
                            ) !== null
                                ? dataObj.getValue(
                                      pScDefIntName,
                                      myEntityDataRecId
                                  )
                                : "";
                        break;
                    case "wholenumber":
                    case "decimalnumber":
                    case "qty":
                    case "cost":
                    case "purchprice":
                    case "salesprice":
                    case "extprice":
                    case "weight":
                    case "percent":
                        widgets[pScDefIntName].setFormattedText(
                            MuseUtils.coalesce(
                                dataObj.getValue(
                                    pScDefIntName,
                                    myEntityDataRecId
                                ),
                                0
                            )
                        );
                        break;
                    case "filecluster":
                        break;
                    case "imagecluster":
                        widgets[pScDefIntName].setId(
                            MuseUtils.coalesce(
                                dataObj.getValue(
                                    pScDefIntName,
                                    myEntityDataRecId
                                ),
                                -1
                            )
                        );
                        break;
                    default:
                        throw new MuseUtils.NotFoundException(
                            "musextputils",
                            "We were asked to update a widget for an unknown Super Characteristic data type.",
                            "MuseArch." + FORM_OBJECT_NAME + ".updateValue",
                            { params: funcParams, context: context },
                            MuseUtils.LOG_WARNING
                        );
                }
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We failed to update the requested form field's value.",
                    "MuseArch." + FORM_OBJECT_NAME + ".updateValue",
                    { params: funcParams, thrownError: e, context: context },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        var updateAllValues = function() {
            var keys = Object.keys(SC_DEFS);

            try {
                for (var i = 0; i < keys.length; i++) {
                    updateValue(keys[i]);
                }
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We encountered problems updating the Super Characteristic Group's widgets.",
                    "MuseArch." + FORM_OBJECT_NAME + ".updateAllValues",
                    { thrownError: e, context: context },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        var setLovOverride = function(pScDefIntName) {
            var funcParams = {
                pScDefIntName: pScDefIntName
            };

            try {
                var dataObj = MuseArch.Data[myEntityObjectName];
                var cachedValue = dataObj.getValue(
                    pScDefIntName,
                    myEntityDataRecId
                );
                switch (SC_DEFS[pScDefIntName]) {
                    case "combobox":
                        widgets[pScDefIntName].populate(
                            dataObj.getLovQuery(
                                pScDefIntName,
                                myEntityDataRecId
                            )
                        );

                        widgets[pScDefIntName].code = cachedValue;
                        break;
                    default:
                        throw new MuseUtils.NotFoundException(
                            "musextputils",
                            "We were asked to override the LOV values for a type that does not accept such overrides.",
                            "MuseArch." + FORM_OBJECT_NAME + ".setLovOverride",
                            { params: funcParams, context: context },
                            MuseUtils.LOG_WARNING
                        );
                }
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We failed to override the field's LOV list as requested.",
                    "MuseArch." + FORM_OBJECT_NAME + ".setLovOverride",
                    { params: funcParams, thrownError: e, context: context },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        var signalParser = function(pSignal) {
            // Is it for us?  If not exit..
            var signal = pSignal.match(/^_@(.+?)@_$/);

            if (signal === null) {
                // not for us.
                return null;
            }

            var signalElements = signal[0].match(/@.+?@/g);

            return {
                signalPrefix:
                    signalElements[0] !== undefined
                        ? signalElements[0].match(/@(.+?)@/)[1]
                        : null,
                signalEntity:
                    signalElements[1] !== undefined
                        ? signalElements[1].match(/@(.+?)@/)[1]
                        : null,
                signalDataRecId:
                    signalElements[2] !== undefined
                        ? signalElements[2].match(/@(.+?)@/)[1]
                        : null,
                signalScDef:
                    signalElements[3] !== undefined
                        ? signalElements[3].match(/@(.+?)@/)[1]
                        : null
            };
        };

        var stringSignalHandler = function(pSignal, pType) {
            var signalData = signalParser(pSignal);

            // If somehow this isn't for us, just do nothing return sooner than
            // later.
            if (
                signalData === null ||
                signalData.signalPrefix != PREFIX ||
                signalData.signalEntity != myEntityObjectName ||
                signalData.signalDataRecId != myEntityDataRecId
            ) {
                return null;
            }

            if (pType == "update_all") {
                return updateAllValues();
            } else if (
                pType == "update" &&
                SC_DEFS.hasOwnProperty(signalData.signalScDef)
            ) {
                return updateValue(signalData.signalScDef);
            } else if (
                pType == "lov_override" &&
                SC_DEFS.hasOwnProperty(signalData.signalScDef)
            ) {
                return setLovOverride(signalData.signalScDef);
            }

            // If we get here, silently fail.
            return null;
        };

        var resetForm = function(pEntityObjName, pMode, pDataRecId) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pEntityObjName: pEntityObjName,
                pMode: pMode,
                pDataRecId: pDataRecId
            };

            myEntityObjectName = pEntityObjName;
            myEntityDataRecId = pDataRecId;
            myMode = pMode;

            context = {
                myEntityObjectName: myEntityObjectName,
                myEntityDataRecId: myEntityDataRecId,
                myMode: myMode,
                constants: {
                    SC_DEFS: SC_DEFS,
                    PREFIX: PREFIX,
                    FORM_OBJECT_NAME: FORM_OBJECT_NAME
                }
            };

            try {
                populateComboboxes();
                setMode();
                updateAllValues();
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "We failed to reset a Super Characteristic form.",
                    "MuseArch." +
                        FORM_OBJECT_NAME +
                        ".pPublicApi.sStringSignalHandler",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        //--------------------------------------------------------------------
        //  Public Interface -- Slots
        //--------------------------------------------------------------------
        pPublicApi.sStringSignalHandler = function(pString, pType) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pString: pString,
                pType: pType
            };

            try {
                if (!isFormInitialized()) {
                    throw new MuseUtils.ApiException(
                        "musextputils",
                        "The form is not yet properly initialized and cannot accept signals.",
                        "MuseArch." +
                            FORM_OBJECT_NAME +
                            ".pPublicApi.sStringSignalHandler",
                        { params: funcParams, context: context },
                        MuseUtils.LOG_WARNING
                    );
                }

                return stringSignalHandler(pString, pType);
            } catch (e) {
                var error = new MuseUtils.FormException(
                    "musextputils",
                    "We found errors while attempting to process a signal.",
                    "MuseArch." +
                        FORM_OBJECT_NAME +
                        ".pPublicApi.sStringSignalHandler",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_CRITICAL
                );
                MuseUtils.displayError(error, mywindow);
            }
        };

        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------
        pPublicApi.updateValue = function(pScDefIntName) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pScDefIntName: pScDefIntName
            };

            try {
                if (!isFormInitialized()) {
                    throw new MuseUtils.ApiException(
                        "musextputils",
                        "The form is not yet properly initialized and cannot be updated.",
                        "MuseArch." +
                            FORM_OBJECT_NAME +
                            ".pPublicApi.updateValue",
                        { params: funcParams, context: context },
                        MuseUtils.LOG_WARNING
                    );
                }

                if (!SC_DEFS.hasOwnProperty(pScDefIntName)) {
                    throw new MuseUtils.ParameterException(
                        "musextputils",
                        "We did not understand which Super Characteristic we should update with current data.",
                        "MuseArch." +
                            FORM_OBJECT_NAME +
                            ".pPublicApi.updateValue",
                        { params: funcParams, context: context },
                        MuseUtils.LOG_WARNING
                    );
                }

                return updateValue(pScDefIntName);
            } catch (e) {
                var error = new MuseUtils.FormException(
                    "musextputils",
                    "We found errors while attempting to cause a value to update from our associated data object.",
                    "MuseArch." + FORM_OBJECT_NAME + ".pPublicApi.updateValue",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_CRITICAL
                );
                MuseUtils.displayError(error, mywindow);
            }
        };

        pPublicApi.updateAllValues = function() {
            try {
                if (!isFormInitialized()) {
                    throw new MuseUtils.ApiException(
                        "musextputils",
                        "The form is not yet properly initialized and cannot be updated",
                        "MuseArch." +
                            FORM_OBJECT_NAME +
                            ".pPublicApi.updateAllValues",
                        { params: funcParams, context: context },
                        MuseUtils.LOG_WARNING
                    );
                }

                return updateAllValues();
            } catch (e) {
                var error = new MuseUtils.FormException(
                    "musextputils",
                    "We found errors while attempting to update all form values from our associated data object.",
                    "MuseArch." +
                        FORM_OBJECT_NAME +
                        ".pPublicApi.updateAllValues",
                    { params: funcParams, thrownError: e },
                    MuseUtils.LOG_CRITICAL
                );
                MuseUtils.displayError(error, mywindow);
            }
        };

        pPublicApi.getMode = function() {
            return MuseUtils.realNull(myMode);
        };

        pPublicApi.set = function(pParams) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pParams: pParams
            };

            var jsonParams = MuseUtils.parseParams(pParams);

            if (
                (!jsonParams.hasOwnProperty("mode") ||
                    !["new", "edit", "view", "preview"].includes(
                        jsonParams.mode
                    )) &&
                myMode === null
            ) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We did not understand in which mode to open the form.",
                    "MuseArch." + FORM_OBJECT_NAME + ".pPublicApi.set",
                    { params: funcParams, context: { jsonParams: jsonParams } },
                    MuseUtils.LOG_WARNING
                );
            }

            if (jsonParams.mode == "preview") {
                // in preview mode we won't prcess logic, so just exit here.
                return;
            }

            if (!jsonParams.hasOwnProperty("entity_object_name")) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We did not understand to which entity we should be associated.",
                    "MuseArch." + FORM_OBJECT_NAME + ".pPublicApi.set",
                    { params: funcParams, context: { jsonParams: jsonParams } },
                    MuseUtils.LOG_WARNING
                );
            }

            if (
                !jsonParams.hasOwnProperty("data_record_id") ||
                (!MuseUtils.isValidId(jsonParams.data_record_id) &&
                    jsonParams.data_record_id.toString().match(/^new/) === null)
            ) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We did not understand which record we were being initialized as.",
                    "MuseArch." + FORM_OBJECT_NAME + ".pPublicApi.set",
                    { params: funcParams, context: { jsonParams: jsonParams } },
                    MuseUtils.LOG_WARNING
                );
            }

            resetForm(
                jsonParams.entity_object_name,
                MuseUtils.coalesce(jsonParams.mode, myMode),
                jsonParams.data_record_id
            );

            //----------------------------------------------------------------
            //  Connects/Disconnects
            //----------------------------------------------------------------
            if (!myIsConnectsSet) {
                mainwindow["emitSignal(QString, QString)"].connect(
                    pPublicApi.sStringSignalHandler
                );

                widgets.fic["editingFinished()"].connect(function() {
                    setDataValue("fic", widgets.fic.text);
                });

                widgets.load_type["currentIndexChanged(int)"].connect(
                    function() {
                        setDataValue("load_type", widgets.load_type.code);
                    }
                );

                widgets.a_test_char["editingFinished()"].connect(function() {
                    setDataValue("a_test_char", widgets.a_test_char.text);
                });

                widgets.cases["editingFinished()"].connect(function() {
                    setDataValue("cases", widgets.cases.getNumericValue());
                });

                widgets.contract["editingFinished()"].connect(function() {
                    setDataValue("contract", widgets.contract.text);
                });

                myIsConnectsSet = true;
            }
        };
    } catch (e) {
        var error = new MuseUtils.ModuleException(
            "musextputils",
            "We enountered a MuseArch.Form module error that wasn't otherwise caught and handled.",
            "MuseArch.Form",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );
        MuseUtils.displayError(error, mainwindow);
    }
})(MuseArch.Form);
