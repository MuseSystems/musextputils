/*************************************************************************
 *************************************************************************
 **
 ** File:         get_implied_null.sql
 ** Project:      Muse xTuple Utilities
 ** Author:       Steven C. Buttgereit
 **
 ** (C) 2014-2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 ** 
 ** License: MIT License. See LICENSE.TXT for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

CREATE OR REPLACE FUNCTION musextputils.get_implied_null(pParam anyelement) 
    RETURNS anyelement AS
        $BODY$
            DECLARE
                vReturnValue ALIAS FOR $0;
            BEGIN
                IF pParam::text = '' OR pParam::text = '0' THEN
                    -- We evaluate the type of the parameter and return a null based on that type.
                    EXECUTE 'SELECT null::'||pg_catalog.pg_typeof(pParam) 
                        INTO vReturnValue;
                ELSE
                    vReturnValue := pParam;
                END IF;

                RETURN vReturnValue;
            END;
        $BODY$
    LANGUAGE plpgsql IMMUTABLE;

ALTER FUNCTION musextputils.get_implied_null(pParam anyelement)
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.get_implied_null(pParam anyelement) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.get_implied_null(pParam anyelement) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.get_implied_null(pParam anyelement) TO xtrole;

COMMENT ON FUNCTION musextputils.get_implied_null(pParam anyelement) 
    IS 'A function to take values passed from higher level Qt JavaScript code and infer nulls based on the input.  In this case we generally mean that the empty string is null and that 0 is also a null';