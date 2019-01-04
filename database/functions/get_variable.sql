-- File:        get_variable.sql
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
-- Retrieves a session or local variable and casts it to a useful type.  We also
-- avoid cast errors here and simply return null when a "setting" is not found.
--

CREATE OR REPLACE FUNCTION musextputils.get_variable(pPackage text, pVariable text, pReturnType anyelement)
    RETURNS anyelement AS
        $BODY$
            DECLARE
                vReturnValue ALIAS FOR $0;
            BEGIN

                IF musextputils.get_implied_null(
                    current_setting(pPackage||'.'||pVariable)) IS NULL THEN
                    NULL; -- Nothing to do here.
                ELSE
                    EXECUTE format('SELECT current_setting(%1$L)::%2$s',
                        pPackage||'.'||pVariable, pg_typeof(pReturnType))
                        INTO vReturnValue;
                    RAISE NOTICE ' Execute Null Test: %', vReturnValue;
                END IF;

                RETURN vReturnValue;
            EXCEPTION
                WHEN SQLSTATE '42704' THEN
                    RAISE WARNING 'Could not find configuration (%).',
                        pPackage||'.'||pVariable;
                    RETURN vReturnValue;
            END;
        $BODY$
    LANGUAGE plpgsql STABLE;

ALTER FUNCTION musextputils.get_variable(pPackage text, pVariable text, pReturnType anyelement)
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.get_variable(pPackage text, pVariable text, pReturnType anyelement) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.get_variable(pPackage text, pVariable text, pReturnType anyelement) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.get_variable(pPackage text, pVariable text, pReturnType anyelement) TO xtrole;


COMMENT ON FUNCTION musextputils.get_variable(pPackage text, pVariable text, pReturnType anyelement)
    IS $DOC$Retrieves a session or local variable and casts it to a useful type.  We also avoid cast errors here and simply return null when a "setting" is not found. $DOC$;
