-- File:        get_musemetric.sql
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


--  We create this function as a polymorphic function which can retrieve differently typed configuration data based on the passed pMetricType value.
CREATE OR REPLACE FUNCTION musextputils.get_musemetric(pMetricPackage text, pMetricName text, pMetricType anyelement)
    RETURNS anyelement AS
        $BODY$
            DECLARE
                vReturnValue ALIAS FOR $0; -- Special value initialized to the polymorphic parameter's type as passed into the function (same real type as pMetricType).
                vValueColumn        text;
            BEGIN
                -- First we validate input.
                IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE lower(table_schema_name) = lower(pMetricPackage)) THEN
                    RAISE EXCEPTION 'We could not find the package that you are referencing.  You wanted package % and we didn''t find it. Check that there is a schema for the package and try again. (FUNC: musextputils.get_musemetric)',pMetricPackage;
                END IF;

                IF pMetricName IS NULL OR (pMetricName ~* E'^\s*$') THEN
                    RAISE EXCEPTION 'The value passed in pMetricName was either NULL or an empty string.  This cannot possibly be right.  Please try again. Passed Params pMetricPackage: %, pMetricName: %, pMetricType: % , Null Eval: %, Empty String Eval: %.(FUNC: musextputils.get_musemetric)'
                            ,pMetricPackage,pMetricName,pg_typeof(pMetricType),(pMetricName IS NULL),  (pMetricName ~* E'^\s*$');
                END IF;

                IF pg_typeof(pMetricType)::text NOT IN ('numeric','text','boolean','timestamptz','hstore','jsonb','numeric[]','text[]') THEN
                    RAISE EXCEPTION 'pMetricType must one of types numeric, text, boolean, timestamptz, hstore, jsonb, numeric[], text[]... you passed us: %.  Please try again. (FUNC: musextputils.get_musemetric)', pg_typeof(pMetricType)::text;
                END IF;

                -- Now we know we should be able to succeed, so long as the metric exists and has data.
                CASE
                    WHEN pg_typeof(pMetricType)::text = 'numeric' THEN
                        vValueColumn := 'musemetric_number';
                    WHEN pg_typeof(pMetricType)::text = 'text' THEN
                        vValueColumn := 'musemetric_text';
                    WHEN pg_typeof(pMetricType)::text = 'boolean' THEN
                        vValueColumn := 'musemetric_flag';
                    WHEN pg_typeof(pMetricType)::text = 'timestamptz' THEN
                        vValueColumn := 'musemetric_date';
                    WHEN pg_typeof(pMetricType)::text = 'hstore' THEN
                        vValueColumn := 'musemetric_hstore';
                    WHEN pg_typeof(pMetricType)::text = 'jsonb' THEN
                        vValueColumn := 'musemetric_jsonb';
                    WHEN pg_typeof(pMetricType)::text = 'numeric[]' THEN
                        vValueColumn := 'musemetric_number_array';
                    WHEN pg_typeof(pMetricType)::text = 'text[]' THEN
                        vValueColumn := 'musemetric_text_array';
                    ELSE
                        -- Something is not good.  Stop right here and fix it before executing this thing.
                        RAISE EXCEPTION 'We got somewhere in the case statement, but are defaulting out.  This should never happen, yet here we are.  (FUNC: musextputils.get_musemetric)';
                END CASE;

                EXECUTE format('SELECT %1$I FROM musextputils.musemetric WHERE lower(musemetric_package) = lower(%2$L) AND lower(musemetric_name) = lower(%3$L)',vValueColumn,pMetricPackage,pMetricName) INTO vReturnValue;

                RETURN vReturnValue;

            END;
        $BODY$
    LANGUAGE plpgsql STABLE;

ALTER FUNCTION musextputils.get_musemetric(pMetricPackage text, pMetricName text, pMetricType anyelement)
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.get_musemetric(text, text, anyelement) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.get_musemetric(text, text, anyelement) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.get_musemetric(text, text, anyelement) TO xtrole;

COMMENT ON FUNCTION musextputils.get_musemetric(pMetricPackage text, pMetricName text, pMetricType anyelement) IS 'A polymorphic function which returns a named metric value for the requested type.   To use, provide a package name, metric name, and null value of type numeric, text, boolean, timestamptz, hstore, jsonb, numeric[], or text[].  That type''s value is returned to the caller, or null if not found or set.';