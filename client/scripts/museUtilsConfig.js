// File:        museUtilsConfig.js
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
    //  Namespace Definition & Imports
    //////////////////////////////////////////////////////////////////////////

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
            "musextputils",
            "We encountered a script level issue while processing MuseUtils.",
            "MuseUtils",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );

        MuseUtils.displayError(error, mainwindow);
    } else {
        QMessageBox.critical(
            mainwindow,
            "MuseUtils Script Error",
            "We encountered a script level issue while processing MuseUtils."
        );
    }
}

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function (pPublicApi, pGlobal) {
    try {
        //--------------------------------------------------------------------
        //  Constants
        //--------------------------------------------------------------------

        //--------------------------------------------------------------------
        //  Private Functional Logic
        //--------------------------------------------------------------------
        var getMetric = function (pPackageName, pMetricName, pMetricType) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pPackageName: pPackageName,
                pMetricName: pMetricName,
                pMetricType: pMetricType
            };

            // Validate that we have our params.
            if (!pMetricName || !pPackageName || !pMetricType) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We did not receive all of the required parameters to retrieve an application configuration.",
                    "MuseUtils.getMetric",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }
            var metricQuery;
            // Get the metric
            metricQuery = toolbox.executeQuery(
                'SELECT to_json(musextputils.get_musemetric(<? value("package") ?>, ' +
                ' <? value("metric") ?>, null::' +
                pMetricType +
                ")) AS result",
                {
                    package: pPackageName,
                    metric: pMetricName
                }
            );

            // Check for query errors since the query will have been executed by
            // this point.
            if (metricQuery.lastError().type != QSqlError.NoError) {
                throw new MuseUtils.DatabaseException(
                    "musextputils",
                    "We encountered what is most likely a database error trying to retrieve a configuration.",
                    "MuseUtils.getMetric",
                    {
                        params: funcParams,
                        databaseError: metricQuery.lastError()
                    },
                    MuseUtils.LOG_CRITICAL
                );
            }

            if (metricQuery.first()) {
                return JSON.parse(metricQuery.value("result"));
            }

            // We didn't get a result, just return null.
            return null;
        };
        var getNumberMetric = function (pPackageName, pMetricName) {
            // Get the metric
            return getMetric(pPackageName, pMetricName, "numeric");
        };
        var getTextMetric = function (pPackageName, pMetricName) {
            // Get the metric
            return getMetric(pPackageName, pMetricName, "text");
        };
        var getFlagMetric = function (pPackageName, pMetricName) {
            // Get the metric
            return getMetric(pPackageName, pMetricName, "boolean");
        };
        var getDateMetric = function (pPackageName, pMetricName) {
            // Get the metric
            return new Date(
                getMetric(pPackageName, pMetricName, "timestamptz")
            );
        };
        var getJsonMetric = function (pPackageName, pMetricName) {
            // Get the metric
            return getMetric(pPackageName, pMetricName, "jsonb");
        };
        var getNumberArrayMetric = function (pPackageName, pMetricName) {
            // Get the metric
            return getMetric(pPackageName, pMetricName, "numeric[]");
        };
        var getTextArrayMetric = function (pPackageName, pMetricName) {
            // Get the metric
            return getMetric(pPackageName, pMetricName, "text[]");
        };

        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------
        pPublicApi.getNumberMetric = function (pPackageName, pMetricName) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pPackageName: pPackageName,
                pMetricName: pMetricName
            };

            try {
                return getNumberMetric(pPackageName, pMetricName);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during execution of an API call.",
                    "MuseUtils.pPublicApi.getNumberMetric",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        pPublicApi.getTextMetric = function (pPackageName, pMetricName) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pPackageName: pPackageName,
                pMetricName: pMetricName
            };

            try {
                return getTextMetric(pPackageName, pMetricName);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during execution of an API call.",
                    "MuseUtils.pPublicApi.getTextMetric",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        pPublicApi.getFlagMetric = function (pPackageName, pMetricName) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pPackageName: pPackageName,
                pMetricName: pMetricName
            };

            try {
                return getFlagMetric(pPackageName, pMetricName);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during execution of an API call.",
                    "MuseUtils.pPublicApi.getFlagMetric",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        pPublicApi.getDateMetric = function (pPackageName, pMetricName) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pPackageName: pPackageName,
                pMetricName: pMetricName
            };

            try {
                return getDateMetric(pPackageName, pMetricName);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during execution of an API call.",
                    "MuseUtils.pPublicApi.getDateMetric",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }
        };


        pPublicApi.getJsonMetric = function (pPackageName, pMetricName) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pPackageName: pPackageName,
                pMetricName: pMetricName
            };

            try {
                return getJsonMetric(pPackageName, pMetricName);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during execution of an API call.",
                    "MuseUtils.pPublicApi.getJsonMetric",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        pPublicApi.getNumberArrayMetric = function (pPackageName, pMetricName) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pPackageName: pPackageName,
                pMetricName: pMetricName
            };

            try {
                return getNumberArrayMetric(pPackageName, pMetricName);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during execution of an API call.",
                    "MuseUtils.pPublicApi.pPublicApi",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        pPublicApi.getTextArrayMetric = function (pPackageName, pMetricName) {
            // Capture function parameters for later exception references.
            var funcParams = {
                pPackageName: pPackageName,
                pMetricName: pMetricName
            };

            try {
                return getTextArrayMetric(pPackageName, pMetricName);
            } catch (e) {
                throw new MuseUtils.ApiException(
                    "musextputils",
                    "There was an error during execution of an API call.",
                    "MuseUtils.pPublicApi.getTextArrayMetric",
                    { params: funcParams },
                    MuseUtils.LOG_WARNING
                );
            }
        };

        // Set a flag indicating that this library is loaded.
        pPublicApi.isMuseUtilsConfigLoaded = true;
    } catch (e) {
        var error = new MuseUtils.ModuleException(
            "musextputils",
            "We enountered a  MuseUtils module error that wasn't otherwise caught and handled.",
            "MuseUtils",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );
        MuseUtils.displayError(error, mainwindow);
    }
})(MuseUtils, this);
