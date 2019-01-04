-- File:        add_common_table_columns.sql
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


CREATE OR REPLACE FUNCTION musextputils.add_common_table_columns(
		 pSchemaName text
		,pTableName text
		,pDateCreatedColumnName text DEFAULT null::text
		,pRoleCreatedColumnName text DEFAULT null::text
		,pDateDeactivatedColumnName text DEFAULT null::text
		,pRoleDeactivatedColumnName text DEFAULT null::text
		,pDateModifiedColumnName text DEFAULT null::text
		,pWallclockModifiedColumnName text DEFAULT null::text
		,pRoleModifiedColumnName text DEFAULT null::text
		,pRowVersionNumberColumnName text DEFAULT null::text
		,pIsActiveColumnName text DEFAULT null::text)
	RETURNS boolean AS
		$BODY$
			DECLARE

			BEGIN

				-- 	First let's check the parameters.
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = pSchemaName AND table_name = pTableName AND table_persistence = 'PERMANENT' AND table_kind = 'TABLE' LIMIT 1) THEN
					RAISE EXCEPTION 'The schema (%) or table (%) does not exist or is not of a permanemt table type.  Please check. (FUNC: musextputils.add_common_table_columns)',pSchemaName,pTableName;
				END IF;

				--  Next, set default column names if they weren't otherwise provided.
				IF pDateCreatedColumnName IS NULL THEN
					pDateCreatedColumnName := 'muse_date_created';
				END IF;

				IF pRoleCreatedColumnName IS NULL THEN
					pRoleCreatedColumnName := 'muse_role_created';
				END IF;

				IF pDateDeactivatedColumnName IS NULL THEN
					pDateDeactivatedColumnName := 'muse_date_deactivated';
				END IF;

				IF pRoleDeactivatedColumnName IS NULL THEN
					pRoleDeactivatedColumnName := 'muse_role_deactivated';
				END IF;

				IF pDateModifiedColumnName IS NULL THEN
					pDateModifiedColumnName := 'muse_date_modified';
				END IF;

				IF pWallclockModifiedColumnName IS NULL THEN
					pWallclockModifiedColumnName := 'muse_wallclock_modified';
				END IF;

				IF pRoleModifiedColumnName IS NULL THEN
					pRoleModifiedColumnName := 'muse_role_modified';
				END IF;

				IF pRowVersionNumberColumnName IS NULL THEN
					pRowVersionNumberColumnName := 'muse_row_version_number';
				END IF;

				IF pIsActiveColumnName IS NULL THEN
					pIsActiveColumnName := 'muse_is_active';
				END IF;


				--
				--	Manage Row Active Status (soft delete).
				--
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = pSchemaName AND table_name = pTableName AND table_persistence = 'PERMANENT' AND table_kind = 'TABLE'
								AND column_name = pIsActiveColumnName AND (column_type_schema = 'pg_catalog' AND column_type_name = 'bool')) THEN
					EXECUTE format('ALTER TABLE %1$I.%2$I ADD COLUMN %3$I bool NOT NULL DEFAULT true',pSchemaName,pTableName,pIsActiveColumnName);
					EXECUTE format('COMMENT ON COLUMN %1$I.%2$I.%3$I IS $$A flag which determines if the record is considered active or "soft-deleted".$$',pSchemaName,pTableName,pIsActiveColumnName);
				END IF;

				--
				--	Manage Date Created
				--
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = pSchemaName AND table_name = pTableName AND table_persistence = 'PERMANENT' AND table_kind = 'TABLE'
								AND column_name = pDateCreatedColumnName AND (column_type_schema = 'pg_catalog' AND column_type_name = 'timestamptz')) THEN
					EXECUTE format('ALTER TABLE %1$I.%2$I ADD COLUMN %3$I timestamptz NOT NULL DEFAULT ''1970-01-01 00:00:00+00''::timestamptz',pSchemaName,pTableName,pDateCreatedColumnName);
					EXECUTE format('COMMENT ON COLUMN %1$I.%2$I.%3$I IS $$The transaction start date/time that the record was created.$$',pSchemaName,pTableName,pDateCreatedColumnName);
				END IF;

				--
				--	Manage Role Created
				--
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = pSchemaName AND table_name = pTableName AND table_persistence = 'PERMANENT' AND table_kind = 'TABLE'
								AND column_name = pRoleCreatedColumnName AND (column_type_schema = 'pg_catalog' AND column_type_name = 'text')) THEN
					EXECUTE format('ALTER TABLE %1$I.%2$I ADD COLUMN %3$I text NOT NULL DEFAULT ''UNKNOWN''',pSchemaName,pTableName,pRoleCreatedColumnName);
					EXECUTE format('COMMENT ON COLUMN %1$I.%2$I.%3$I IS $$The database role that created the record.$$',pSchemaName,pTableName,pRoleCreatedColumnName);
				END IF;

				--
				--	Manage Date Modified
				--
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = pSchemaName AND table_name = pTableName AND table_persistence = 'PERMANENT' AND table_kind = 'TABLE'
								AND column_name = pDateModifiedColumnName AND (column_type_schema = 'pg_catalog' AND column_type_name = 'timestamptz')) THEN
					EXECUTE format('ALTER TABLE %1$I.%2$I ADD COLUMN %3$I timestamptz NOT NULL DEFAULT ''1970-01-01 00:00:00+00''::timestamptz',pSchemaName,pTableName,pDateModifiedColumnName);
					EXECUTE format('COMMENT ON COLUMN %1$I.%2$I.%3$I IS $$The transaction start date/time that the record was last modified.$$',pSchemaName,pTableName,pDateModifiedColumnName);
				END IF;

				--
				--	Manage Wall Clock Modified
				--
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = pSchemaName AND table_name = pTableName AND table_persistence = 'PERMANENT' AND table_kind = 'TABLE'
								AND column_name = pWallclockModifiedColumnName AND (column_type_schema = 'pg_catalog' AND column_type_name = 'timestamptz')) THEN
					EXECUTE format('ALTER TABLE %1$I.%2$I ADD COLUMN %3$I timestamptz NOT NULL DEFAULT ''1970-01-01 00:00:00+00''::timestamptz',pSchemaName,pTableName,pWallclockModifiedColumnName);
					EXECUTE format('COMMENT ON COLUMN %1$I.%2$I.%3$I IS $$The actual date/time (not transaction start) that the record was last modified.$$',pSchemaName,pTableName,pWallclockModifiedColumnName);
				END IF;

				--
				--	Manage Role Modified
				--
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = pSchemaName AND table_name = pTableName AND table_persistence = 'PERMANENT' AND table_kind = 'TABLE'
								AND column_name = pRoleModifiedColumnName AND (column_type_schema = 'pg_catalog' AND column_type_name = 'text')) THEN
					EXECUTE format('ALTER TABLE %1$I.%2$I ADD COLUMN %3$I text NOT NULL DEFAULT ''UNKNOWN''',pSchemaName,pTableName,pRoleModifiedColumnName);
					EXECUTE format('COMMENT ON COLUMN %1$I.%2$I.%3$I IS $$The database role that last modified the record.$$',pSchemaName,pTableName,pRoleModifiedColumnName);
				END IF;

				--
				--	Manage Date Deactivated
				--
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = pSchemaName AND table_name = pTableName AND table_persistence = 'PERMANENT' AND table_kind = 'TABLE'
								AND column_name = pDateDeactivatedColumnName AND (column_type_schema = 'pg_catalog' AND column_type_name = 'timestamptz')) THEN
					EXECUTE format('ALTER TABLE %1$I.%2$I ADD COLUMN %3$I timestamptz ',pSchemaName,pTableName,pDateDeactivatedColumnName);
					EXECUTE format('COMMENT ON COLUMN %1$I.%2$I.%3$I IS $$The transaction start date/time that deativated the record; this means setting the active flag to false.$$',pSchemaName,pTableName,pDateDeactivatedColumnName);
				END IF;

				--
				--	Manage Role Deactivated
				--
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = pSchemaName AND table_name = pTableName AND table_persistence = 'PERMANENT' AND table_kind = 'TABLE'
								AND column_name = pRoleDeactivatedColumnName AND (column_type_schema = 'pg_catalog' AND column_type_name = 'text')) THEN
					EXECUTE format('ALTER TABLE %1$I.%2$I ADD COLUMN %3$I text',pSchemaName,pTableName,pRoleDeactivatedColumnName);
					EXECUTE format('COMMENT ON COLUMN %1$I.%2$I.%3$I IS $$The database role that set the active flag to false.$$',pSchemaName,pTableName,pRoleDeactivatedColumnName);
				END IF;

				--
				--	Manage Row Serial
				--
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = pSchemaName AND table_name = pTableName AND table_persistence = 'PERMANENT' AND table_kind = 'TABLE'
								AND column_name = pRowVersionNumberColumnName AND (column_type_schema = 'pg_catalog' AND column_type_name = 'int8')) THEN
					EXECUTE format('ALTER TABLE %1$I.%2$I ADD COLUMN %3$I int8 NOT NULL DEFAULT 1',pSchemaName,pTableName,pRowVersionNumberColumnName);
					EXECUTE format('COMMENT ON COLUMN %1$I.%2$I.%3$I IS $$The current version number of the record.  This includes all changes including updates to same values.$$',pSchemaName,pTableName,pRowVersionNumberColumnName);
				END IF;

				--
				--  Now we should have all the columns that we want by standard added, so lets add the triggers that we require at this stage.
				--
				IF NOT EXISTS(SELECT 1 FROM musextputils.v_catalog_triggers WHERE table_schema_name = pSchemaName AND table_name = pTableName AND trigger_name = 'c90_trig_b_iu_audit_field_maintenance') THEN
					EXECUTE format('CREATE TRIGGER c90_trig_b_iu_audit_field_maintenance BEFORE INSERT OR UPDATE ON %1$I.%2$I FOR EACH ROW EXECUTE PROCEDURE musextputils.trig_b_iu_audit_field_maintenance(%3$L,%4$L,%5$L,%6$L,%7$L,%8$L,%9$L,%10$L,%11$L)'
						,pSchemaName,pTableName,pDateCreatedColumnName,pRoleCreatedColumnName,pDateDeactivatedColumnName,pRoleDeactivatedColumnName,pDateModifiedColumnName,pWallclockModifiedColumnName
						,pRoleModifiedColumnName,pRowVersionNumberColumnName,pIsActiveColumnName);
				END IF;

				RETURN true;

			END;
		$BODY$
	LANGUAGE plpgsql;

ALTER FUNCTION musextputils.add_common_table_columns(pSchemaName text, pTableName text, pDateCreatedColumnName text ,pRoleCreatedColumnName text, pDateDeactivatedColumnName text, pRoleDeactivatedColumnName text
	, pDateModifiedColumnName text, pWallclockModifiedColumnName text, pRoleModifiedColumnName text, pRowVersionNumberColumnName text, pIsActiveColumnName text)
	OWNER TO admin;

COMMENT ON FUNCTION musextputils.add_common_table_columns(pSchemaName text, pTableName text, pDateCreatedColumnName text ,pRoleCreatedColumnName text, pDateDeactivatedColumnName text, pRoleDeactivatedColumnName text
	, pDateModifiedColumnName text, pWallclockModifiedColumnName text, pRoleModifiedColumnName text, pRowVersionNumberColumnName text, pIsActiveColumnName text) IS 'A function to add so-called "common table columns" to a single table.  This includes any maintenance functionality such as triggers.';

-- A convenience wrapper for the simpler case.
DROP FUNCTION IF EXISTS musextputils.add_common_table_columns(pSchemaName text, pTableName text);