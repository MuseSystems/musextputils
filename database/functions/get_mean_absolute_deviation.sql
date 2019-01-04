-- File:        get_mean_absolute_deviation.sql
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
-- For a given array of numeric values, calculate the Mean Absolute Deviation.
--

CREATE OR REPLACE FUNCTION musextputils.get_mean_absolute_deviation(pPopulation numeric[])
    RETURNS numeric AS
        $BODY$

                WITH eval AS (
                    SELECT  avg(q) AS mean
                    FROM unnest(pPopulation) q
                    )
                SELECT sum(abs(val - mean))/count(1)::numeric
                FROM unnest(pPopulation) val
                    CROSS JOIN eval;

        $BODY$
    LANGUAGE sql IMMUTABLE;

ALTER FUNCTION musextputils.get_mean_absolute_deviation(pPopulation numeric[])
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.get_mean_absolute_deviation(pPopulation numeric[]) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.get_mean_absolute_deviation(pPopulation numeric[]) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.get_mean_absolute_deviation(pPopulation numeric[]) TO xtrole;


COMMENT ON FUNCTION musextputils.get_mean_absolute_deviation(pPopulation numeric[])
    IS $DOC$For a given array of numeric values, calculate the Mean Absolute Deviation.$DOC$;
