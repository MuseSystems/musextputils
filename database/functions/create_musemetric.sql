/*************************************************************************
 *************************************************************************
 **
 ** File: 		create_musemetric.sql
 ** Project: 	Muse Systems xTuple ERP Utilities
 ** Author:		Steven C. Buttgereit
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

-- Generic way to create a metric.  Since in most cases, we will create a metric for a single type of value, we handle a default single setting here.
--     More complex configurations are multi-type and that is allowable, but each type needs to be updated after creation for that use case. 
CREATE OR REPLACE FUNCTION musextputils.create_musemetric(pMetricPackage text, pMetricName text, pMetricDescription text, pMetricValue anyelement) 
	RETURNS bigint AS
		$BODY$
			DECLARE
				vValueColumn		text;
				vReturnValue 		bigint;  -- This will be the record ID if all goes well.
			BEGIN

				-- First we'll validate that our input matches what we would expect.
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE lower(table_schema_name) = lower(pMetricPackage)) THEN
					RAISE EXCEPTION 'We could not find the package that you are referencing.  You wanted package % and we didn''t find it. Check that there is a schema for the package and try again. (FUNC: musextputils.create_musemetric)',pMetricPackage;
				END IF;

				IF pMetricName IS NULL OR NOT (pMetricName ~* '[[[:alpha:]_]|[[:digit:]]|[[:punct:]]]+') THEN
					RAISE EXCEPTION 'The value passed in pMetricName was either NULL or an empty string (%).  This cannot possibly be right.  Please try again. (FUNC: musextputils.create_musemetric)',pMetricName;
				END IF;

				IF pMetricDescription IS NULL OR NOT (pMetricDescription ~* '[[[:alpha:]_]|[[:digit:]]|[[:punct:]]]+') THEN
					RAISE EXCEPTION 'pMetricDescription must have a non-null, non-empty-string value.  You passed: %.  Please try again. (FUNC: )',pMetricDescription;
				END IF;

				IF pg_typeof(pMetricValue)::text NOT IN ('numeric','text','boolean','timestamptz','hstore','jsonb','numeric[]','text[]') THEN
					RAISE EXCEPTION 'pMetricValue must one of types numeric, text, boolean, timestamptz, hstore, jsonb, numeric[], text[]... you passed us: %.  Please try again. (FUNC: musextputils.create_musemetric)', pg_typeof(pMetricValue)::text;
				END IF;

				-- We got something reasonable so we'll go forward... start by figuring out the correct value column.
				CASE
					WHEN pg_typeof(pMetricValue)::text = 'numeric' THEN
						vValueColumn := 'musemetric_number';
					WHEN pg_typeof(pMetricValue)::text = 'text' THEN
						vValueColumn := 'musemetric_text';
					WHEN pg_typeof(pMetricValue)::text = 'boolean' THEN
						vValueColumn := 'musemetric_flag';
					WHEN pg_typeof(pMetricValue)::text = 'timestamptz' THEN
						vValueColumn := 'musemetric_date';
					WHEN pg_typeof(pMetricValue)::text = 'hstore' THEN
						vValueColumn := 'musemetric_hstore';
					WHEN pg_typeof(pMetricValue)::text = 'jsonb' THEN
						vValueColumn := 'musemetric_jsonb';
					WHEN pg_typeof(pMetricValue)::text = 'numeric[]' THEN
						vValueColumn := 'musemetric_number_array';
					WHEN pg_typeof(pMetricValue)::text = 'text[]' THEN
						vValueColumn := 'musemetric_text_array';
					ELSE
						-- Something is not good.  Stop right here and fix it before executing this thing.
						RAISE EXCEPTION 'We got somewhere in the case statement, but are defaulting out.  This should never happen, yet here we are.  (FUNC: musextputils.create_musemetric)';
				END CASE;


				EXECUTE format('INSERT INTO musextputils.musemetric (musemetric_package, musemetric_name, musemetric_descrip, %1$I ) 
										SELECT %2$L,%3$L,%4$L,%5$L WHERE NOT EXISTS(SELECT 1 FROM musextputils.musemetric WHERE musemetric_package = %2$L AND lower(musemetric_name) = lower(%3$L)) 
										RETURNING musemetric_id',lower(vValueColumn),lower(pMetricPackage),pMetricName,pMetricDescription,pMetricValue) INTO vReturnValue;

				RETURN vReturnValue;  -- Let's return the id of the metric just created in case the caller has some use for it.  NULL means we didn't actually do anything probably because the package/metric combo existed... but let the caller handle that case.
				
			END;
		$BODY$
	LANGUAGE plpgsql;

ALTER FUNCTION musextputils.create_musemetric(pMetricPackage text, pMetricName text, pMetricDescription text, pMetricValue anyelement)
	OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.create_musemetric(text, text, text, anyelement) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.create_musemetric(text, text, text, anyelement) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.create_musemetric(text, text, text, anyelement) TO xtrole;

COMMENT ON FUNCTION musextputils.create_musemetric(pMetricPackage text, pMetricName text, pMetricDescription text, pMetricValue anyelement) IS 'This function will either exclusively "CREATE" a new metric with its associated value, or perform an "UPSERT of the named metric.  The key difference is that the upsert will overwrite existing data if the metric already exists.';