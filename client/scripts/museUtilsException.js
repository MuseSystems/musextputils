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

//////////////////////////////////////////////////////////////////////////
//  Namespace Definition
//////////////////////////////////////////////////////////////////////////

this.MuseUtils = this.MuseUtils || {};

//////////////////////////////////////////////////////////////////////////
//  Module Definition
//////////////////////////////////////////////////////////////////////////
(function(pPublicApi) {

    /****************************************
     *  Private Functions & Vars
     ***************************************/

    pPublicApi.isDebugging = false;
    pPublicApi.isRootCauseReported = false;

    // Check the debugging configuration.            
    try {    
        var debugQuery = toolbox.executeQuery(
                "SELECT musextputils.get_musemetric('musextputils', "+
                " 'debugErrorMessageDisplay', null::boolean) AS result"
            );
    
        if(debugQuery.first()) {
            pPublicApi.isDebugging = ('t' == debugQuery.value("result")
                                    .toString()
                                    .toLowerCase()
                                    .substring(0,1));
        } else {
            pPublicApi.isDebugging = false;
        }
    
    } catch(e) {
        pPublicApi.isDebugging = false;
    }

    // Check the root cause reporting configuration.
    try {
        var rootCauseQuery = toolbox.executeQuery(
            "SELECT musextputils.get_musemetric('musextputils', " +
            "'rootCauseReportingEnabled', null::boolean) AS result");

        if(rootCauseQuery.first()) {
            pPublicApi.isRootCauseReported = ('t' == rootCauseQuery.value("result")
                                                .toString()
                                                .toLowerCase()
                                                .substring(0,1));
        } else {
            pPublicApi.isRootCauseReported = false;
        }
    } catch(e) {
        pPublicApi.isRootCauseReported = false;
    }

    var getRootCause = function(pMuseExceptionPayload) {
        if(pMuseExceptionPayload.hasOwnProperty("thrownError")) {
            return getRootCause(pMuseExceptionPayload.thrownError);
        } else {
            return pMuseExceptionPayload;
        }
    };

    /**
     * Constructs exception text messages to be displayed to the user.  The
     * content of the message depends on the debugErrorMessageDisplay
     * config.
     * @return {text} The final text ready for display.
     */
    var getExceptionText = function() {

        var returnText;

        returnText = "\n";
        returnText += this.logMsg || "(Exception not logged!)";
        returnText += "\n\n";

        if(pPublicApi.isRootCauseReported) {
            var rootCause = getRootCause(this.myPayload || {});

            if(rootCause.myIsMuseUtilsException || false) {
                returnText += "Root Cause " + rootCause.logMsg || "(Exception not logged!)";
                returnText += "\nRoot Cause: "+ rootCause.myMessage;
                returnText += "\n\nPlease report this to your support staff along with the Exception Log Id above.";
                returnText += "\n\n---------------------------------------------------\n";
                returnText += "Root Cause Function Name: "+rootCause.myFunction+"\n";
                returnText += "Root Cause Package Name: "+rootCause.myPackage+"\n";
                if(pPublicApi.isDebugging) {
                    returnText += "Root Cause Exception Name: "+rootCause.myErrorName+"\n";
                    returnText += "Root Cause Exception Desc: "+rootCause.myErrorDesc+"\n";
                    returnText += "Root Cause Payload: "+JSON.stringify(rootCause.myPayload);
                    returnText += "\n\n---------------------------------------------------\n";
                }
            } else {
                returnText += "\nmessage: " + rootCause.message || "(N/A)";
                returnText += "\nfileName: " + rootCause.fileName || "(N/A)";
                returnText += "\nsourceId: " + rootCause.sourceId || "(N/A)";
                returnText += "\nlineNumber: " + rootCause.lineNumber || "(N/A)";
                returnText += "\nexpressionEndOffset: " + rootCause.expressionEndOffset || "(N/A)";
                returnText += "\nexpressionBeginOffset: " + rootCause.expressionBeginOffset || "(N/A)";
                returnText += "\nexpressionCaretOffset: " + rootCause.expressionCaretOffset || "(N/A)";
                returnText += "\n\nPlease report this to your support staff along with the Exception Log Id above.";
                returnText += "\n\n---------------------------------------------------\n";
            }
        } else {
            returnText += this.myMessage;
            returnText += "\n\nPlease report this to your support staff along with the Exception Log Id above.";
            returnText += "\n\n---------------------------------------------------\n";
        }

        if(pPublicApi.isDebugging || false) {
            // Setup local variables to convert the passed data to a string return.
            returnText += "Message: "+this.myMessage+"\n";
            returnText += "Function Name: "+this.myFunction+"\n";
            returnText += "Package Name: "+this.myPackage+"\n";
            returnText += "Exception Name: "+this.myErrorName+"\n";
            returnText += "Exception Desc: "+this.myErrorDesc+"\n";
            returnText += "Payload: "+JSON.stringify(this.myPayload)+"\n";
        } else {
            // Setup local variables to convert the passed data to a string return.
            returnText += "Function Name: "+this.myFunction+"\n";
            returnText += "Package Name: "+this.myPackage+"\n";
        }
      
        return returnText; 
    }; 

    var logException = function(pThis) {

        // Log the exception.  However, don't stop if we can't: not worth it.
        try {
            
            var exceptionQeury = toolbox.executeQuery(
                'SELECT musextputils.log_exception(<? value("exceptionName") ?>, ' +
                ' <? value("exceptionDescription") ?>, <? value("message") ?>, ' +
                '<? value("functionName") ?>, <? value("packageName") ?>, ' +
                '(<? value("payload") ?>)::jsonb) AS exception_log_id',
                {
                    exceptionName: pThis.myErrorName || "***UNDEFINED***",
                    exceptionDescription: pThis.myErrorDesc || "***UNDEFINED***",
                    message: pThis.myMessage || "***UNDEFINED***",
                    functionName: pThis.myFunction || "***UNDEFINED***",
                    packageName: pThis.myPackage || "***UNDEFINED***",
                    payload: JSON.stringify(pThis.myPayload)
                });

            // Update the exception name to include the log ID.  If we don't get anything... just move along.
            if(exceptionQeury.first()) {
                return "Exception Log ID: " + exceptionQeury.value("exception_log_id");
            }
            
        } catch(e) {
            // This is all we do... anything more would stop flow when we might otherwise be able to succeed.
            QMessageBox.critical(mainwindow, "Muse Systems xTuple Utilities Error","We could not log an exception to the database exception log.  This most likely means your connection to the database has been lost.  Please close and restart your xTuple session and if you continue to receive this error please contact your support staff.");
        }
    };

    var UnknownException = function(pPackage, pMessage, pFunction, pPayload) {

        this.myIsMuseUtilsException = true;
        this.myIsDeugging = pPublicApi.isDebugging;
        this.myPackage = pPackage;
        this.myMessage = pMessage;
        this.myFunction = pFunction;
        this.myPayload = pPayload;
        this.myErrorName = "UnknownException";
        this.myErrorDesc = "A generic exception thrown by a third party function or xTuple itself.";
        this.logMsg = logException(this);
        
    };

    UnknownException.prototype = new Error();
    UnknownException.prototype.constructor = UnknownException;
    UnknownException.prototype.toString = getExceptionText;

    
    var ParameterException = function(pPackage, pMessage, pFunction, pPayload) {

        this.myIsMuseUtilsException = true;
        this.myIsDeugging = pPublicApi.isDebugging;
        this.myPackage = pPackage;
        this.myMessage = pMessage;
        this.myFunction = pFunction;
        this.myPayload = pPayload;
        this.myErrorName = "ParameterException";
        this.myErrorDesc = "Parameters passed to the named function were not valid or were missing.";
        this.logMsg = logException(this);
        
    };

    ParameterException.prototype = new Error();
    ParameterException.prototype.constructor = ParameterException;
    ParameterException.prototype.toString = getExceptionText;

    var DatabaseException = function(pPackage, pMessage, pFunction, pPayload) {

        this.myIsMuseUtilsException = true;
        this.myIsDeugging = pPublicApi.isDebugging;
        this.myPackage = pPackage;
        this.myMessage = pMessage;
        this.myFunction = pFunction;
        this.myPayload = pPayload;
        this.myErrorName = "DatabaseException";
        this.myErrorDesc = "There was an error accessing the database or while running a query.";
        this.logMsg = logException(this);

    };

    DatabaseException.prototype = new Error();
    DatabaseException.prototype.constructor = DatabaseException;
    DatabaseException.prototype.toString = getExceptionText;

    var OutOfBoundsException = function(pPackage, pMessage, pFunction, pPayload) {

        this.myIsMuseUtilsException = true;
        this.myIsDeugging = pPublicApi.isDebugging;
        this.myPackage = pPackage;
        this.myMessage = pMessage;
        this.myFunction = pFunction;
        this.myPayload = pPayload;
        this.myErrorName = "OutOfBoundsException";
        this.myErrorDesc = "A provided value was outside of the checked bounds of the valid value range.";
        this.logMsg = logException(this);

    };

    OutOfBoundsException.prototype = new Error();
    OutOfBoundsException.prototype.constructor = OutOfBoundsException;
    OutOfBoundsException.prototype.toString = getExceptionText;

    var PermissionException = function(pPackage, pMessage, pFunction, pPayload) {

        this.myIsMuseUtilsException = true;
        this.myIsDeugging = pPublicApi.isDebugging;
        this.myPackage = pPackage;
        this.myMessage = pMessage;
        this.myFunction = pFunction;
        this.myPayload = pPayload;
        this.myErrorName = "PermissionException";
        this.myErrorDesc = "There were insufficient permissions to perform the requested action.";
        this.logMsg = logException(this);

    };

    PermissionException.prototype = new Error();
    PermissionException.prototype.constructor = PermissionException;
    PermissionException.prototype.toString = getExceptionText;

    var NotFoundException = function(pPackage, pMessage, pFunction, pPayload) {

        this.myIsMuseUtilsException = true;
        this.myIsDeugging = pPublicApi.isDebugging;
        this.myPackage = pPackage;
        this.myMessage = pMessage;
        this.myFunction = pFunction;
        this.myPayload = pPayload;
        this.myErrorName = "NotFoundException";
        this.myErrorDesc = "We were unable to retrieve a value or record when we believed to be available.";
        this.logMsg = logException(this);

    };

    NotFoundException.prototype = new Error();
    NotFoundException.prototype.constructor = NotFoundException;
    NotFoundException.prototype.toString = getExceptionText;

    var RecordLockedException = function(pPackage, pMessage, pFunction, pPayload) {

        this.myIsMuseUtilsException = true;
        this.myIsDeugging = pPublicApi.isDebugging;
        this.myPackage = pPackage;
        this.myMessage = pMessage;
        this.myFunction = pFunction;
        this.myPayload = pPayload;
        this.myErrorName = "RecordLockedException";
        this.myErrorDesc = "We tried to get an advisory lock for editing, but someone else was using it.";
        this.logMsg = logException(this);

    };

    RecordLockedException.prototype = new Error();
    RecordLockedException.prototype.constructor = RecordLockedException;
    RecordLockedException.prototype.toString = getExceptionText;

     var ApiException = function(pPackage, pMessage, pFunction, pPayload) {

        this.myIsMuseUtilsException = true;
        this.myIsDeugging = pPublicApi.isDebugging;
        this.myPackage = pPackage;
        this.myMessage = pMessage;
        this.myFunction = pFunction;
        this.myPayload = pPayload;
        this.myErrorName = "ApiException";
        this.myErrorDesc = "We encountered an error processing an API call.  See exception stack for root cause details.";
        this.logMsg = logException(this);

    };

    ApiException.prototype = new Error();
    ApiException.prototype.constructor = ApiException;
    ApiException.prototype.toString = getExceptionText;

    var displayError = function(pException, pParent) {
        // Let's parse the exception.  Check for our marker attribute.
        // If the marker is present we assume it is our exception and that we
        // can provide richer information.
        if(pException.hasOwnProperty("myIsMuseUtilsException")) { 
            // This is one of our exceptions so we can print richer
            // information.
            QMessageBox.critical(pParent, "Error: "+pException.myPackage+"/"+pException.myFunction, "Error encountered." + pException.toString());
        } else {
            // Not our BaseException, so show something more generic.
            var error = new UnknownException(
                "musextputils",
                "There was an error which does not use our error framework.\n\n" +
                "(Message: " + (pException.message || "Unknown") + ")",
                "MuseUtils.displayError", 
                pException);
            displayError(error,pParent);
        }
    };

    /****************************************
     *  Public API
     ***************************************/
    pPublicApi.UnknownException = UnknownException;
    
    pPublicApi.ParameterException = ParameterException;
    
    pPublicApi.DatabaseException = DatabaseException;
    
    pPublicApi.OutOfBoundsException = OutOfBoundsException;
    
    pPublicApi.PermissionException = PermissionException;
    
    pPublicApi.NotFoundException = NotFoundException;
    
    pPublicApi.RecordLockedException = RecordLockedException;

    pPublicApi.ApiException = ApiException;
    
    pPublicApi.displayError = function(pException, pParent) {
        // First we need to know whether or not we were even called properly.
        if(!pException) {
            // We need at least a parameter to work with... otherwise we have to give up here.
            throw new ParameterException(
                "musextputils",
                "This function requires that something be passed in as an exception and none was found.",
                "MuseUtils.displayError",
                {
                    params:{
                        pException:JSON.stringify(pException),
                        pParent:JSON.stringify(pParent)
                    }
                });
        } else if(!pParent) {
            pParent = mainwindow;
        }

        displayError(pException, pParent);
    };

    // Set a flag indicating that this library is loaded.
    pPublicApi.isMuseUtilsExceptionLoaded = true;

})(this.MuseUtils);