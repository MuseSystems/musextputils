-- File:        get_normalized_numeric.sql
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