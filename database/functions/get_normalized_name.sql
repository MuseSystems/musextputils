-- File:        get_normalized_name.sql
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
