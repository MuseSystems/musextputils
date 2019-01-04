-- File:        set_session_variable.sql
-- Location:    musextputils/database/functions
-- Project:     Muse Systems xTuple ERP Utilities
--
-- Licensed to Lima Buttgereit Holdings LLC (d/b/a Muse Systems) under one or
-- more agreements.  Muse Systems licenses this file to you under the Apache
-- License, Version 2.0.
--
-- See the LICENSE file in the project root for license terms and conditions.
-- See the NOTICE file in the project root for copyright ownership information.
--
-- muse.information@musesystems.com  :: https://muse.systems


--
-- Wraps the standard set_config PostgreSQL function with some formality useful for the xTuple context.  Note this version sets variables valid for an entire session.
--

CREATE OR REPLACE FUNCTION musextputils.set_session_variable(pPackage text, pVariable text, pValue text)
    RETURNS boolean AS
        $BODY$
            DECLARE

            BEGIN
                -- Validate require parameters
                IF pPackage IS NULL THEN
                    RAISE EXCEPTION 'We require a valid package name. (FUNC: musextputils.set_session_variable)';
                ELSIF pVariable IS NULL THEN
                    RAISE EXCEPTION 'We require a valid variable name. (FUNC: musextputils.set_session_variable)';
                END IF;

                -- Set the variable.  Turns out this really always returns
                -- not null... or throws an exception.
                IF set_config(pPackage||'.'||pVariable,pValue,false) IS NOT NULL THEN
                    RETURN true;
                ELSE
                    RETURN false;
                END IF;

            END;
        $BODY$
    LANGUAGE plpgsql VOLATILE;

ALTER FUNCTION musextputils.set_session_variable(pPackage text, pVariable text, pValue text)
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.set_session_variable(pPackage text, pVariable text, pValue text) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.set_session_variable(pPackage text, pVariable text, pValue text) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.set_session_variable(pPackage text, pVariable text, pValue text) TO xtrole;


COMMENT ON FUNCTION musextputils.set_session_variable(pPackage text, pVariable text, pValue text)
    IS $DOC$Wraps the standard set_config PostgreSQL function with some formality useful
 for the xTuple context.  Note this version sets variables valid for an entire session.$DOC$;
