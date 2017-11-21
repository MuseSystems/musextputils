/*************************************************************************
 *************************************************************************
 **
 ** File:        museUtilsException.js
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

    if (typeof MuseUtils === "undefined") {
        throw new Error(
            "Please do load utility modules directly.  See museUtils.js for the loading methodology."
        );
    }
} catch (e) {
    if (
        typeof MuseUtils !== "undefined" &&
        (MuseUtils.isMuseUtilsExceptionLoaded === true ? true : false)
    ) {
        var error = new MuseUtils.ScriptException(
            "musextputils",
            "We encountered a script level issue while processing MuseUtils Mod Exception.",
            "MuseUtils",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );

        MuseUtils.displayError(error, mainwindow);
    } else {
        QMessageBox.critical(
            mainwindow,
            "MuseUtils Script Error",
            "We encountered a script level issue while processing MuseUtils Mod Exception."
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
        var getRootCause = function(pMuseExceptionPayload) {
            if (
                !pMuseExceptionPayload.hasOwnProperty("myIsMuseUtilsException")
            ) {
                return pMuseExceptionPayload;
            }

            var payload = pMuseExceptionPayload.myPayload;

            if (payload.hasOwnProperty("thrownError")) {
                return getRootCause(payload.thrownError);
            } else {
                return pMuseExceptionPayload;
            }
        };

        var getSystemNotification = function() {
            var rootCause = getRootCause(this || {});

            var returnText = "Notification (" + this.logMsg + "):\n";
            returnText += this.myMessage + "\n\n";

            if (rootCause != this) {
                if (rootCause.myIsMuseUtilsException == true ? true : false) {
                    returnText += "Caused By (" + rootCause.logMsg + "):\n";
                    returnText += rootCause.myMessage + "\n\n";
                    returnText +=
                        "--------------------------------------------\n\n";
                    returnText += "Function Name: " + this.myFunction + "\n";
                    returnText += "Package Name: " + this.myPackage + "\n\n";
                    returnText +=
                        "Root Function Name: " + rootCause.myFunction + "\n";
                    returnText +=
                        "Root Package Name: " + rootCause.myPackage + "\n\n";
                } else {
                    returnText += "Caused By (" + rootCause.logMsg + "):\n";
                    returnText += (rootCause.message || "(N/A)") + "\n\n";
                    returnText +=
                        "--------------------------------------------\n\n";
                    returnText += "Function Name: " + this.myFunction + "\n";
                    returnText += "Package Name: " + this.myPackage + "\n\n";
                    returnText +=
                        "Root File Name: " +
                        (rootCause.fileName || "(N/A)") +
                        "\n";
                    returnText +=
                        "Root Line Number: " +
                        (rootCause.lineNumber || "(N/A)") +
                        "\n\n";
                }
            } else {
                returnText +=
                    "--------------------------------------------\n\n";
                returnText += "Function Name: " + this.myFunction + "\n";
                returnText += "Package Name: " + this.myPackage + "\n\n";
            }

            return returnText;
        };

        var getDebugData = function() {
            return JSON.stringify(this, null, 4);
        };

        /**
         * Constructs exception text messages to be displayed to the user.  The
         * content of the message depends on the debugErrorMessageDisplay
         * config.
         * @return {text} The final text ready for display.
         */
        var getExceptionText = function() {
            return (
                this.getSystemNotification() +
                "============================================\n\n" +
                JSON.stringify(this.myPayload, null, 4)
            );
        };

        var logException = function(pThis) {
            // Log the exception.  However, don't stop if we can't: not worth it.
            try {
                if (pThis.myIsLogged) {
                    var exceptionQeury = toolbox.executeQuery(
                        'SELECT musextputils.log_exception(<? value("exceptionName") ?>, ' +
                            ' <? value("exceptionDescription") ?>, <? value("message") ?>, ' +
                            '<? value("functionName") ?>, <? value("packageName") ?>, ' +
                            '(<? value("payload") ?>)::jsonb) AS exception_log_id',
                        {
                            exceptionName:
                                pThis.myErrorName || "***UNDEFINED***",
                            exceptionDescription:
                                pThis.myErrorDesc || "***UNDEFINED***",
                            message: pThis.myMessage || "***UNDEFINED***",
                            functionName: pThis.myFunction || "***UNDEFINED***",
                            packageName: pThis.myPackage || "***UNDEFINED***",
                            payload: JSON.stringify(pThis.myPayload)
                        }
                    );

                    // Update the exception name to include the log ID.  If we don't get anything... just move along.
                    if (exceptionQeury.first()) {
                        return (
                            "Exception Log ID: " +
                            exceptionQeury.value("exception_log_id")
                        );
                    }
                } else {
                    return "Not Logged";
                }
            } catch (e) {
                // This is all we do... anything more would stop flow when we might otherwise be able to succeed.
                QMessageBox.critical(
                    mainwindow,
                    "Muse Systems xTuple Utilities Error",
                    "We could not log an exception to the database exception log.  This most likely means your connection to the database has been lost.  Please close and restart your xTuple session and if you continue to receive this error please contact your support staff."
                );
            }
        };

        var UnknownException = function(
            pPackage,
            pMessage,
            pFunction,
            pPayload,
            pIsLogged
        ) {
            this.myIsMuseUtilsException = true;
            this.myPackage = pPackage;
            this.myMessage = pMessage;
            this.myFunction = pFunction;
            this.myPayload = pPayload;
            this.myIsLogged = pIsLogged === true ? true : false;
            this.myErrorName = "UnknownException";
            this.myErrorDesc =
                "A generic exception thrown by a third party function or xTuple itself.";
            this.logMsg = logException(this);
        };

        UnknownException.prototype = new Error();
        UnknownException.prototype.constructor = UnknownException;
        UnknownException.prototype.toString = getExceptionText;
        UnknownException.prototype.getSystemNotification = getSystemNotification;
        UnknownException.prototype.getDebugData = getDebugData;

        var ParameterException = function(
            pPackage,
            pMessage,
            pFunction,
            pPayload,
            pIsLogged
        ) {
            this.myIsMuseUtilsException = true;
            this.myPackage = pPackage;
            this.myMessage = pMessage;
            this.myFunction = pFunction;
            this.myPayload = pPayload;
            this.myIsLogged = pIsLogged === true ? true : false;
            this.myErrorName = "ParameterException";
            this.myErrorDesc =
                "Parameters passed to the named function were not valid or were missing.";
            this.logMsg = logException(this);
        };

        ParameterException.prototype = new Error();
        ParameterException.prototype.constructor = ParameterException;
        ParameterException.prototype.toString = getExceptionText;
        ParameterException.prototype.getSystemNotification = getSystemNotification;
        ParameterException.prototype.getDebugData = getDebugData;

        var DatabaseException = function(
            pPackage,
            pMessage,
            pFunction,
            pPayload,
            pIsLogged
        ) {
            this.myIsMuseUtilsException = true;
            this.myPackage = pPackage;
            this.myMessage = pMessage;
            this.myFunction = pFunction;
            this.myPayload = pPayload;
            this.myIsLogged = pIsLogged === true ? true : false;
            this.myErrorName = "DatabaseException";
            this.myErrorDesc =
                "There was an error accessing the database or while running a query.";
            this.logMsg = logException(this);
        };

        DatabaseException.prototype = new Error();
        DatabaseException.prototype.constructor = DatabaseException;
        DatabaseException.prototype.toString = getExceptionText;
        DatabaseException.prototype.getSystemNotification = getSystemNotification;
        DatabaseException.prototype.getDebugData = getDebugData;

        var OutOfBoundsException = function(
            pPackage,
            pMessage,
            pFunction,
            pPayload,
            pIsLogged
        ) {
            this.myIsMuseUtilsException = true;
            this.myPackage = pPackage;
            this.myMessage = pMessage;
            this.myFunction = pFunction;
            this.myPayload = pPayload;
            this.myIsLogged = pIsLogged === true ? true : false;
            this.myErrorName = "OutOfBoundsException";
            this.myErrorDesc =
                "A provided value was outside of the checked bounds of the valid value range.";
            this.logMsg = logException(this);
        };

        OutOfBoundsException.prototype = new Error();
        OutOfBoundsException.prototype.constructor = OutOfBoundsException;
        OutOfBoundsException.prototype.toString = getExceptionText;
        OutOfBoundsException.prototype.getSystemNotification = getSystemNotification;
        OutOfBoundsException.prototype.getDebugData = getDebugData;

        var PermissionException = function(
            pPackage,
            pMessage,
            pFunction,
            pPayload,
            pIsLogged
        ) {
            this.myIsMuseUtilsException = true;
            this.myPackage = pPackage;
            this.myMessage = pMessage;
            this.myFunction = pFunction;
            this.myPayload = pPayload;
            this.myIsLogged = pIsLogged === true ? true : false;
            this.myErrorName = "PermissionException";
            this.myErrorDesc =
                "There were insufficient permissions to perform the requested action.";
            this.logMsg = logException(this);
        };

        PermissionException.prototype = new Error();
        PermissionException.prototype.constructor = PermissionException;
        PermissionException.prototype.toString = getExceptionText;
        PermissionException.prototype.getSystemNotification = getSystemNotification;
        PermissionException.prototype.getDebugData = getDebugData;

        var NotFoundException = function(
            pPackage,
            pMessage,
            pFunction,
            pPayload,
            pIsLogged
        ) {
            this.myIsMuseUtilsException = true;
            this.myPackage = pPackage;
            this.myMessage = pMessage;
            this.myFunction = pFunction;
            this.myPayload = pPayload;
            this.myIsLogged = pIsLogged === true ? true : false;
            this.myErrorName = "NotFoundException";
            this.myErrorDesc =
                "We were unable to retrieve a value or record when we believed to be available.";
            this.logMsg = logException(this);
        };

        NotFoundException.prototype = new Error();
        NotFoundException.prototype.constructor = NotFoundException;
        NotFoundException.prototype.toString = getExceptionText;
        NotFoundException.prototype.getSystemNotification = getSystemNotification;
        NotFoundException.prototype.getDebugData = getDebugData;

        var RecordLockedException = function(
            pPackage,
            pMessage,
            pFunction,
            pPayload,
            pIsLogged
        ) {
            this.myIsMuseUtilsException = true;
            this.myPackage = pPackage;
            this.myMessage = pMessage;
            this.myFunction = pFunction;
            this.myPayload = pPayload;
            this.myIsLogged = pIsLogged === true ? true : false;
            this.myErrorName = "RecordLockedException";
            this.myErrorDesc =
                "We tried to get an advisory lock for editing, but someone else was using it.";
            this.logMsg = logException(this);
        };

        RecordLockedException.prototype = new Error();
        RecordLockedException.prototype.constructor = RecordLockedException;
        RecordLockedException.prototype.toString = getExceptionText;
        RecordLockedException.prototype.getSystemNotification = getSystemNotification;
        RecordLockedException.prototype.getDebugData = getDebugData;

        var ApiException = function(
            pPackage,
            pMessage,
            pFunction,
            pPayload,
            pIsLogged
        ) {
            this.myIsMuseUtilsException = true;
            this.myPackage = pPackage;
            this.myMessage = pMessage;
            this.myFunction = pFunction;
            this.myPayload = pPayload;
            this.myIsLogged = pIsLogged === true ? true : false;
            this.myErrorName = "ApiException";
            this.myErrorDesc =
                "We encountered an error processing an API call.  See exception stack for root cause details.";
            this.logMsg = logException(this);
        };

        ApiException.prototype = new Error();
        ApiException.prototype.constructor = ApiException;
        ApiException.prototype.toString = getExceptionText;
        ApiException.prototype.getSystemNotification = getSystemNotification;
        ApiException.prototype.getDebugData = getDebugData;

        var ModuleException = function(
            pPackage,
            pMessage,
            pFunction,
            pPayload,
            pIsLogged
        ) {
            this.myIsMuseUtilsException = true;
            this.myPackage = pPackage;
            this.myMessage = pMessage;
            this.myFunction = pFunction;
            this.myPayload = pPayload;
            this.myIsLogged = pIsLogged === true ? true : false;
            this.myErrorName = "ModuleException";
            this.myErrorDesc =
                "We encountered an error processing a module definition script.  See exception stack for root cause details.";
            this.logMsg = logException(this);
        };

        ModuleException.prototype = new Error();
        ModuleException.prototype.constructor = ModuleException;
        ModuleException.prototype.toString = getExceptionText;
        ModuleException.prototype.getSystemNotification = getSystemNotification;
        ModuleException.prototype.getDebugData = getDebugData;

        var ScriptException = function(
            pPackage,
            pMessage,
            pFunction,
            pPayload,
            pIsLogged
        ) {
            this.myIsMuseUtilsException = true;
            this.myPackage = pPackage;
            this.myMessage = pMessage;
            this.myFunction = pFunction;
            this.myPayload = pPayload;
            this.myIsLogged = pIsLogged === true ? true : false;
            this.myErrorName = "ScriptException";
            this.myErrorDesc =
                "We encountered an error processing ad hoc scripting.  See exception stack for root cause details.";
            this.logMsg = logException(this);
        };

        ScriptException.prototype = new Error();
        ScriptException.prototype.constructor = ScriptException;
        ScriptException.prototype.toString = getExceptionText;
        ScriptException.prototype.getSystemNotification = getSystemNotification;
        ScriptException.prototype.getDebugData = getDebugData;

        var displayError = function(pException, pParent) {
            // Let's parse the exception.  Check for our marker attribute.
            // If the marker is present we assume it is our exception and that we
            // can provide richer information.
            if (pException.hasOwnProperty("myIsMuseUtilsException")) {
                // This is one of our exceptions so we can print richer
                // information.
                var exceptionDialog = toolbox.openWindow(
                    "museUtilsExceptionDialog",
                    0,
                    Qt.ApplicationModal,
                    Qt.Dialog
                );

                var tmp = toolbox.lastWindow().set({
                    systemNotification: pException.getSystemNotification(),
                    debugData: pException.getDebugData()
                });

                exceptionDialog.exec();
            } else {
                // Not our BaseException, so show something more generic.
                var error = new UnknownException(
                    "musextputils",
                    "There was an error which does not use our error framework.",
                    "MuseUtils.displayError",
                    { thrownError: pException },
                    MuseUtils.LOG_CRITICAL
                );

                displayError(error, pParent);
            }
        };

        //--------------------------------------------------------------------
        //  Public Interface -- Functions
        //--------------------------------------------------------------------
        pPublicApi.UnknownException = UnknownException;

        pPublicApi.ParameterException = ParameterException;

        pPublicApi.DatabaseException = DatabaseException;

        pPublicApi.OutOfBoundsException = OutOfBoundsException;

        pPublicApi.PermissionException = PermissionException;

        pPublicApi.NotFoundException = NotFoundException;

        pPublicApi.RecordLockedException = RecordLockedException;

        pPublicApi.ApiException = ApiException;

        pPublicApi.ModuleException = ModuleException;

        pPublicApi.ScriptException = ScriptException;

        pPublicApi.displayError = function(pException, pParent) {
            // First we need to know whether or not we were even called properly.
            if (!pException) {
                // We need at least a parameter to work with... otherwise we have to give up here.
                throw new ParameterException(
                    "musextputils",
                    "This function requires that something be passed in as an exception and none was found.",
                    "MuseUtils.displayError",
                    {
                        params: {
                            pException: JSON.stringify(pException),
                            pParent: JSON.stringify(pParent)
                        }
                    },
                    MuseUtils.LOG_FATAL
                );
            } else if (!pParent) {
                pParent = mainwindow;
            }

            displayError(pException, pParent);
        };

        pPublicApi.getRootCause = function(pException) {
            if (typeof pException === undefined || typeof pException === null) {
                throw new ParameterException(
                    "musextputils",
                    "We require some exception object in order to parse it for a root cause.",
                    "MuseUtils.getRootCause",
                    { params: { pException: pException } },
                    MuseUtils.LOG_CRITICAL
                );
            }

            return getRootCause(pException);
        };

        // Set a flag indicating that this library is loaded.
        pPublicApi.isMuseUtilsExceptionLoaded = true;
    } catch (e) {
        var error = new MuseUtils.ModuleException(
            "musextputils",
            "We enountered a MuseUtils Exception module error that wasn't otherwise caught and handled.",
            "MuseUtils",
            { thrownError: e },
            MuseUtils.LOG_FATAL
        );
        MuseUtils.displayError(error, mainwindow);
    }
})(MuseUtils, this);
