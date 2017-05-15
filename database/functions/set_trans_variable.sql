/*************************************************************************
 *************************************************************************
 **
 ** File:         set_trans_variable.sql
 ** Project:      Muse Systems xTuple Utilities
 ** Author:       Steven C. Buttgereit
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

--
-- Wraps the standard set_config system function with some formality needed for
-- good xTuple usage.
--

CREATE OR REPLACE FUNCTION musextputils.set_trans_variable(pPackage text, pVariable text, pValue text) 
    RETURNS boolean AS
        $BODY$
            DECLARE
                
            BEGIN
                -- Validate require parameters
                IF pPackage IS NULL THEN
                    RAISE EXCEPTION 'We require a valid package name. (FUNC: musextputils.set_trans_variable)';
                ELSIF pVariable IS NULL THEN
                    RAISE EXCEPTION 'We require a valid variable name. (FUNC: musextputils.set_trans_variable)';
                END IF;

                -- Set the variable.  Turns out this really always returns
                -- not null... or throws an exception.
                IF set_config(pPackage||'.'||pVariable,pValue,true) IS NOT NULL THEN
                    RETURN true;
                ELSE
                    RETURN false;
                END IF;

            END;
        $BODY$
    LANGUAGE plpgsql VOLATILE;

ALTER FUNCTION musextputils.set_trans_variable(pPackage text, pVariable text, pValue text)
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.set_trans_variable(pPackage text, pVariable text, pValue text) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.set_trans_variable(pPackage text, pVariable text, pValue text) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.set_trans_variable(pPackage text, pVariable text, pValue text) TO xtrole;


COMMENT ON FUNCTION musextputils.set_trans_variable(pPackage text, pVariable text, pValue text) 
    IS $DOC$Wraps the standard set_config system function with some formality needed for good xTuple usage.$DOC$;
