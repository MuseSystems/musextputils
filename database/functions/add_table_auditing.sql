/*************************************************************************
 *************************************************************************
 **
 ** File:         add_table_auditing.sql
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
-- Adds a trigger to the requested table which will log all changes for the the
-- requested events to the musextputils.auditlog table.  Calling this function
-- on an already audited table will cause the existing trigger to be dropped and
-- re-created, with any change in event options requested.  IMPORTANT NOTE: This
-- table auditing SHOULD NOT be applied to any table which has columns for large
-- object such as those that store images, PDF, or other "documents" in the
-- database.  Auditing such tables could have severe system-wide performance
-- impacts.  Also, you cannot audit the musextputils.auditlog itself with this
-- infrastructure.  To drop or disable the trigger outright, simply use the
-- standard PostgreSQL trigger management functionality as normal.
--

CREATE OR REPLACE FUNCTION musextputils.add_table_auditing(pTableSchema text, pTable text, pPkColumn text, pEvents text[] DEFAULT '{INSERT,UPDATE,DELETE}'::text[])
    RETURNS text AS
        $BODY$
            DECLARE
                vExistingTrigger text;
                vTriggerName text;
                vCreateTrigger text;
            BEGIN

                -- Validation of parameters.
                IF NOT EXISTS(SELECT true
                              FROM  musextputils.v_basic_catalog
                              WHERE table_schema_name = coalesce(lower(pTableSchema),'***')
                                    AND table_name = coalesce(lower(pTable),'***')
                                    AND column_name = coalesce(lower(pPkColumn),'***')
                                    AND is_required
                                    AND table_kind = 'TABLE'
                                    AND table_persistence = 'PERMANENT') THEN

                    RAISE EXCEPTION 'Valid values for the pTableSchema, pTable, pPkColumn parameters were not provided.  Please ensure that these parameters are not null and represent an existing table with a single, numeric primary key column.  (pTableSchema: %, pTable: %, pPkColumn: %) (FUNC: musextputils.add_table_auditing)', pTableSchema, pTable, pPkColumn;

                END IF;

                -- Normalize array event names and continue with parameter
                -- validation.
                SELECT array_agg(upper(q)) INTO pEvents
                FROM unnest(coalesce(pEvents,'{}'::text[])) q;

                IF array_length(pEvents,1) < 1
                    OR NOT ARRAY[ 'INSERT', 'UPDATE', 'DELETE']
                        @> pEvents THEN

                    RAISE EXCEPTION 'We could not find valid event types for which you desire auditing.  Event types must be one or more of: INSERT, UPDATE, or DELETE. (pEvents: %) (FUNC: musextputils.add_table_auditing)',pEvents::text;

                END IF;

                IF lower(pTableSchema) = 'musextputils'
                    AND lower(pTable) = 'auditlog'
                    AND 'INSERT' = ANY(pEvents) THEN

                    RAISE EXCEPTION 'Self-auditing the musextputils.auditlog table with the INSERT event type is not supported as it results in endless recursion. (FUNC: musextputils.add_table_auditing)';

                END IF;

                -- We're done validating, we can move on.

                -- Check for existing trigger, drop it if found.
                SELECT DISTINCT trigger_name INTO vExistingTrigger
                FROM    information_schema.triggers
                WHERE   event_object_schema = pTableSchema
                    AND event_object_table = pTable
                    AND trigger_name ~ E'trig_a.+_record_audit_logging';

                IF vExistingTrigger IS NOT NULL THEN
                    EXECUTE format('DROP TRIGGER IF EXISTS %3$I ON %1$I.%2$I'
                        ,pTableSchema, pTable, vExistingTrigger);
                END IF;

                -- Construct trigger name.
                vTriggerName := 'z99_trig_a_'; -- Always run last and after.

                IF 'INSERT' = ANY(pEvents) THEN
                    vTriggerName := vTriggerName || 'i';
                END IF;

                IF 'UPDATE' = ANY(pEvents) THEN
                    vTriggerName := vTriggerName || 'u';
                END IF;

                IF 'DELETE' = ANY(pEvents) THEN
                    vTriggerName := vTriggerName || 'd';
                END IF;

                vTriggerName := vTriggerName || '_record_audit_logging';

                -- Construct create trigger statement and apply to table.
                vCreateTrigger := 'CREATE TRIGGER %1$I AFTER '||
                    (SELECT string_agg(q, ' OR ')
                     FROM unnest(pEvents) q) || ' ON %2$I.%3$I FOR EACH ROW ' ||
                    'EXECUTE PROCEDURE ' ||
                    'musextputils.trig_a_iud_record_audit_logging(%4$L)';

                EXECUTE format(vCreateTrigger, vTriggerName, lower(pTableSchema),
                    lower(pTable), lower(pPkColumn));

                -- Assuming we get here without blowing up, return our trigger
                -- name.
                RETURN vTriggerName;

            END;
        $BODY$
    LANGUAGE plpgsql VOLATILE;

ALTER FUNCTION musextputils.add_table_auditing(pTableSchema text, pTable text, pPkColumn text, pEvents text[])
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.add_table_auditing(pTableSchema text, pTable text, pPkColumn text, pEvents text[]) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.add_table_auditing(pTableSchema text, pTable text, pPkColumn text, pEvents text[]) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.add_table_auditing(pTableSchema text, pTable text, pPkColumn text, pEvents text[]) TO xtrole;


COMMENT ON FUNCTION musextputils.add_table_auditing(pTableSchema text, pTable text, pPkColumn text, pEvents text[])
    IS $DOC$Adds a trigger to the requested table which will log all changes for the the requested events to the musextputils.auditlog table.  Calling this function on an already audited table will cause the existing trigger to be dropped and re-created, with any change in event options requested.  IMPORTANT NOTE: This table auditing SHOULD NOT be applied to any table which has columns for large object such as those that store images, PDF, or other "documents" in the database.  Auditing such tables could have severe system-wide performance impacts.  Also, you cannot audit the musextputils.auditlog itself with this infrastructure.  To drop or disable the trigger outright, simply use the standard PostgreSQL trigger management functionality as normal.$DOC$;