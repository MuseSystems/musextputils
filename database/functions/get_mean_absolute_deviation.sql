/*************************************************************************
 *************************************************************************
 **
 ** File:         get_mean_absolute_deviation.sql
 ** Project:      Muse Systems xTuple Utilities
 ** Author:       Steven C. Buttgereit
 **
 ** (C) 2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 **
 ** Licensing restrictions apply.  Please refer to your Master Services
 ** Agreement or governing Statement of Work for complete terms and
 ** conditions.
 **
 *************************************************************************
 ************************************************************************/

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
