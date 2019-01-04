-- File:        trig_a_iud_record_audit_logging.sql
-- Location:    musextputils/database/triggers
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
-- Looks for changes in data and logs the old and new version of the record (as
-- appropriate to the change type) in the musextputils.auditlog table.  Note
-- that this trigger should not be applied to tables directly; use the
-- musextputils.add_table_auditing function to ensure tha the trigger is set up
-- reasonably safely.
--

CREATE OR REPLACE FUNCTION musextputils.trig_a_iud_record_audit_logging()
    RETURNS trigger AS
        $BODY$
            DECLARE
                vNewRecJson jsonb;
                vOldRecJson jsonb;
            BEGIN

                -- All operations do the same basic thing.
                IF TG_OP = 'INSERT' THEN
                    vNewRecJson := to_jsonb(NEW);
                    vOldRecJson := '{}'::jsonb;
                ELSIF TG_OP = 'UPDATE' THEN
                    vNewRecJson := to_jsonb(NEW);
                    vOldRecJson := to_jsonb(OLD);

                    IF (SELECT count(1)
                        FROM jsonb_each(
                            musextputils.jsonb_diff(vNewRecJson,
                                vOldRecJson))) = 0 THEN
                        -- Nothing to do here... there are no changes... just
                        -- return.
                        RETURN NEW;
                    END IF;
                ELSE
                    vNewRecJson := '{}'::jsonb;
                    vOldRecJson := to_jsonb(OLD);
                END IF;

                -- Insert the data into the audit table.
                INSERT INTO musextputils.auditlog (
                     auditlog_table_schema
                    ,auditlog_table
                    ,auditlog_record_id
                    ,auditlog_change_type
                    ,auditlog_old_record
                    ,auditlog_new_record)
                VALUES (
                     TG_TABLE_SCHEMA
                    ,TG_TABLE_NAME
                    ,(coalesce(vNewRecJson ->> TG_ARGV[0],
                        vOldRecJson ->> TG_ARGV[0]))::bigint
                    ,TG_OP
                    ,vOldRecJson
                    ,vNewRecJson);

                -- We return new or old based on our operation type.
                IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
                    RETURN NEW;
                ELSE
                    RETURN OLD;
                END IF;
            END;
        $BODY$
    LANGUAGE plpgsql VOLATILE;

ALTER FUNCTION musextputils.trig_a_iud_record_audit_logging()
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.trig_a_iud_record_audit_logging() FROM public;
GRANT EXECUTE ON FUNCTION musextputils.trig_a_iud_record_audit_logging() TO admin;
GRANT EXECUTE ON FUNCTION musextputils.trig_a_iud_record_audit_logging() TO xtrole;


COMMENT ON FUNCTION musextputils.trig_a_iud_record_audit_logging()
    IS $DOC$Looks for changes in data and logs the old and new version of the record (as appropriate to the change type) in the musextputils.auditlog table.  Note that this trigger should not be applied to tables directly; use the musextputils.add_table_auditing function to ensure tha the trigger is set up reasonably safely.$DOC$;