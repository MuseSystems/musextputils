/*************************************************************************
 *************************************************************************
 **
 ** File:         get_normalized_numeric.sql
 ** Project:      Muse Systems xTuple Utilities
 ** Author:       Steven C. Buttgereit
 **
 ** (C) 2014-2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 ** 
 ** License: MIT License. See LICENSE.md for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

CREATE OR REPLACE FUNCTION musextputils.get_normalized_numeric(pWeight text) 
    RETURNS numeric AS
        $BODY$
            SELECT regexp_replace($1,'[\,]+','','g')::numeric;
        $BODY$
    LANGUAGE sql IMMUTABLE;

ALTER FUNCTION musextputils.get_normalized_numeric(pWeight text)
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.get_normalized_numeric(pWeight text) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.get_normalized_numeric(pWeight text) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.get_normalized_numeric(pWeight text) TO xtrole;


COMMENT ON FUNCTION musextputils.get_normalized_numeric(pWeight text) 
    IS 'A function which normalizes textually formatted numbers.  This can happen when trying get locale based weight rounding.'; 