/*************************************************************************
 *************************************************************************
 **
 ** File:         get_normalized_name.sql
 ** Project:      Muse Systems xTuple Utilities
 ** Author:       Steven C. Buttgereit
 **
 ** (C) 2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 **
 ** License: MIT License. See LICENSE.md for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

--
-- For a given text string, this function will convert it to a strictly "snake
-- case" version of that string.  This is typically used in forming computer
-- friendly, human readable identifiers.
--

CREATE OR REPLACE FUNCTION musextputils.get_normalized_name(pText text)
    RETURNS text AS
        $BODY$
            SELECT
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            lower(pText), E'''','','g'),
                        E'[[:punct:][:space:]]+','_','g'),
                    E'^_|_$','','g');
        $BODY$
    LANGUAGE sql IMMUTABLE;

ALTER FUNCTION musextputils.get_normalized_name(pText text)
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.get_normalized_name(pText text) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.get_normalized_name(pText text) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.get_normalized_name(pText text) TO xtrole;


COMMENT ON FUNCTION musextputils.get_normalized_name(pText text)
    IS $DOC$For a given text string, this function will convert it to a strictly "snake case" version of that string.  This is typically used in forming computer friendly, human readable identifiers.$DOC$;
