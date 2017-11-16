/*************************************************************************
 *************************************************************************
 **
 ** File:        museUtilsConfig.js
 ** Project:     Muse Systems xTuple Utilties
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

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi) {
    //--------------------------------------------------------------------
    //  "Private" Functional Logic
    //--------------------------------------------------------------------
    var getMetric = function(pPackageName, pMetricName, pMetricType) {
        // Validate that we have our params.
        if (!pMetricName || !pPackageName || !pMetricType) {
            throw new MuseUtils.ParameterException(
                "musextputils",
                "We did not receive all of the required parameters to retrieve an application configuration.",
                "MuseUtils.getMetric",
                {
                    params: {
                        pPackageName: pPackageName,
                        pMetricName: pMetricName,
                        pMetricType: pMetricType
                    }
                }
            );
        }
        var metricQuery;
        // Get the metric
        try {
            metricQuery = toolbox.executeQuery(
                'SELECT musextputils.get_musemetric(<? value("package") ?>, ' +
                    ' <? value("metric") ?>, null::' +
                    pMetricType +
                    ") AS result",
                {
                    package: pPackageName,
                    metric: pMetricName
                }
            );

            if (metricQuery.first()) {
                return metricQuery.value("result");
            }

            // We didn't get a result, just return null.
            return null;
        } catch (e) {
            throw new MuseUtils.DatabaseException(
                "musextputils",
                "We encountered what is most likely a database error trying to retrieve a configuration.",
                "MuseUtils.getMetric",
                {
                    params: {
                        pPackageName: pPackageName,
                        pMetricName: pMetricName,
                        pMetricType: pMetricType
                    },
                    databaseError: metricQuery.lastError()
                }
            );
        }
    };
    var getNumberMetric = function(pPackageName, pMetricName) {
        // Get the metric
        return getMetric(pPackageName, pMetricName, "numeric");
    };
    var getTextMetric = function(pPackageName, pMetricName) {
        // Get the metric
        return getMetric(pPackageName, pMetricName, "text");
    };
    var getFlagMetric = function(pPackageName, pMetricName) {
        // Get the metric
        return getMetric(pPackageName, pMetricName, "boolean");
    };
    var getDateMetric = function(pPackageName, pMetricName) {
        // Get the metric
        return getMetric(pPackageName, pMetricName, "timestamptz");
    };
    var getHstoreMetric = function(pPackageName, pMetricName) {
        // Get the metric
        return getMetric(pPackageName, pMetricName, "hstore");
    };
    var getJsonMetric = function(pPackageName, pMetricName) {
        // Get the metric
        return getMetric(pPackageName, pMetricName, "jsonb");
    };
    var getNumberArrayMetric = function(pPackageName, pMetricName) {
        // Get the metric
        return getMetric(pPackageName, pMetricName, "numeric[]");
    };
    var getTextArrayMetric = function(pPackageName, pMetricName) {
        // Get the metric
        return getMetric(pPackageName, pMetricName, "text[]");
    };

    //--------------------------------------------------------------------
    //  Public Interface -- Functions
    //--------------------------------------------------------------------

    pPublicApi.getNumberMetric = function(pPackageName, pMetricName) {
        try {
            return getNumberMetric(pPackageName, pMetricName);
        } catch (e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during execution of an API call.",
                "MuseUtils.pPublicApi.getNumberMetric",
                {
                    params: {
                        pPackageName: pPackageName,
                        pMetricName: pMetricName
                    }
                }
            );
        }
    };

    pPublicApi.getTextMetric = function(pPackageName, pMetricName) {
        try {
            return getTextMetric(pPackageName, pMetricName);
        } catch (e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during execution of an API call.",
                "MuseUtils.pPublicApi.getTextMetric",
                {
                    params: {
                        pPackageName: pPackageName,
                        pMetricName: pMetricName
                    }
                }
            );
        }
    };

    pPublicApi.getFlagMetric = function(pPackageName, pMetricName) {
        try {
            return getFlagMetric(pPackageName, pMetricName);
        } catch (e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during execution of an API call.",
                "MuseUtils.pPublicApi.getFlagMetric",
                {
                    params: {
                        pPackageName: pPackageName,
                        pMetricName: pMetricName
                    }
                }
            );
        }
    };

    pPublicApi.getDateMetric = function(pPackageName, pMetricName) {
        try {
            return getDateMetric(pPackageName, pMetricName);
        } catch (e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during execution of an API call.",
                "MuseUtils.pPublicApi.getDateMetric",
                {
                    params: {
                        pPackageName: pPackageName,
                        pMetricName: pMetricName
                    }
                }
            );
        }
    };

    pPublicApi.getHstoreMetric = function(pPackageName, pMetricName) {
        try {
            return getHstoreMetric(pPackageName, pMetricName);
        } catch (e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during execution of an API call.",
                "MuseUtils.pPublicApi.getHstoreMetric",
                {
                    params: {
                        pPackageName: pPackageName,
                        pMetricName: pMetricName
                    }
                }
            );
        }
    };

    pPublicApi.getJsonMetric = function(pPackageName, pMetricName) {
        try {
            return getJsonMetric(pPackageName, pMetricName);
        } catch (e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during execution of an API call.",
                "MuseUtils.pPublicApi.getJsonMetric",
                {
                    params: {
                        pPackageName: pPackageName,
                        pMetricName: pMetricName
                    }
                }
            );
        }
    };

    pPublicApi.getNumberArrayMetric = function(pPackageName, pMetricName) {
        try {
            return getNumberArrayMetric(pPackageName, pMetricName);
        } catch (e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during execution of an API call.",
                "MuseUtils.pPublicApi.pPublicApi",
                {
                    params: {
                        pPackageName: pPackageName,
                        pMetricName: pMetricName
                    }
                }
            );
        }
    };

    pPublicApi.getTextArrayMetric = function(pPackageName, pMetricName) {
        try {
            return getTextArrayMetric(pPackageName, pMetricName);
        } catch (e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during execution of an API call.",
                "MuseUtils.pPublicApi.getTextArrayMetric",
                {
                    params: {
                        pPackageName: pPackageName,
                        pMetricName: pMetricName
                    }
                }
            );
        }
    };

    // Set a flag indicating that this library is loaded.
    pPublicApi.isMuseUtilsConfigLoaded = true;
})(MuseUtils);
