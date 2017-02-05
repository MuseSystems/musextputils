//////////////////////////////////////////////////////////////////////////
//  Namespace Definition
//////////////////////////////////////////////////////////////////////////

this.MuseUtils = this.MuseUtils || {};

//////////////////////////////////////////////////////////////////////////
//  Imports
//////////////////////////////////////////////////////////////////////////

if(!MuseUtils.isMuseUtilsExceptionLoaded) {
    include("museUtilsException");
}

//////////////////////////////////////////////////////////////////////////
//  Module Defintion
//////////////////////////////////////////////////////////////////////////

(function(pPublicApi) {

    //--------------------------------------------------------------------
    //  "Private" Functional Logic
    //--------------------------------------------------------------------
    var getCurrentUserId = function() {
        // Let's find out who we are... we are someone aren't we?  We'll use
        // current_user rather than session_user in case we want to pretend
        // we're someone else.
        var userQuery;

        try {
            userQuery = toolbox.executeQuery('SELECT oid AS usr_id FROM pg_catalog.pg_roles WHERE rolname = current_user;');
        } catch(e) {
            throw new MuseUtils.DatabaseException(
                "musextputils",
                "We encountered a database problem determining the current user id.",
                "MuseUtils.getCurrentUserId",
                {
                    databaseError: userQuery.lastError()
                });
        }
        
        
        if(userQuery.first()) {
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
                });
        }
    };

    var getUserIdByUsername = function(pUsername) {
        
        var userQuery;

        try {
            userQuery = toolbox.executeQuery(
                'SELECT oid AS usr_id FROM pg_catalog.pg_roles ' +
                'WHERE rolname = <? value("pUsername") ?>;',
                {pUsername: pUsername});

        } catch(e) {

            throw new MuseUtils.DatabaseException(
                "musextputils",
                "We encountered a database problem determining the requested user's id.",
                "MuseUtils.getCurrentUserId",
                {
                    params: {
                        pUsername: pUsername
                    },
                    databaseError: userQuery.lastError(),
                    error: e
                });
        }
        
    
        if(userQuery.first()) {
            // We got something so lets return that.
            var usrId = userQuery.value("usr_id");
            return usrId;
        } else {
            // We didn't get something so lets error out.
            throw new MuseUtils.NotFoundException(
                "musextputils",
                "We encountered a problem determining the requested user's id.",
                "MuseUtils.getUserIdByUsername",
                {
                    params: {pUsername: pUsername},
                    databaseError: userQuery.lastError()
                });
        }
    };

    //--------------------------------------------------------------------
    //  Public Interface -- Functions
    //--------------------------------------------------------------------

    pPublicApi.getCurrentUserId = function() {
        try {
            return getCurrentUserId();
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during the execution of an API call.",
                "MuseUtils.pPublicApi.getCurrentUserId",
                {
                    thrownError: e
                });
        }
    };

    pPublicApi.getUserIdByUsername = function(pUsername) {
        try {
            // validate the input
            if(!pUsername) {
                throw new MuseUtils.ParameterException(
                    "musextputils",
                    "We were asked to look up a user id, but weren't given anybody's name.  This is a problem.",
                    "MuseUtils.getUserIdByUsername",
                    {params: {pUsername: pUsername}});
            }
    
            return getUserIdByUsername(pUsername);
        } catch(e) {
            throw new MuseUtils.ApiException(
                "musextputils",
                "There was an error during the execution of an API call.",
                "MuseUtils.pPublicApi.getUserIdByUsername",
                {
                    thrownError: e,
                    params: {pUsername: pUsername}
                });
        }
    };
    
    // Set a flag indicating that this library is loaded.
    pPublicApi.isMuseUtilsUserLoaded = true;

})(MuseUtils);
