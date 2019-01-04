-- File:        v_auditlog_changes.sql
-- Location:    musextputils/database/views
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
-- Provides auditlog data focusing on changed data rather than complete records.
--

CREATE OR REPLACE VIEW musextputils.v_auditlog_changes AS
    SELECT   auditlog_id
            ,auditlog_table_schema
            ,auditlog_table
            ,auditlog_record_id
            ,auditlog_change_type
            ,auditlog_txid
            ,CASE
                WHEN auditlog_change_type = 'DELETE' THEN
                    to_jsonb(
                        (SELECT array_agg(q)
                         FROM jsonb_object_keys(auditlog_old_record) q))
                ELSE
                    to_jsonb(
                        (SELECT array_agg(q)
                         FROM jsonb_object_keys(musextputils.jsonb_diff(
                                                    auditlog_new_record,
                                                    auditlog_old_record)) q))
             END AS auditlog_changed_fields
            ,musextputils.jsonb_diff(auditlog_new_record,
                auditlog_old_record) AS auditlog_new_values
            ,musextputils.jsonb_diff(auditlog_old_record,
                auditlog_new_record) AS auditlog_old_values
            ,auditlog_is_active
            ,auditlog_date_created
            ,auditlog_role_created
            ,auditlog_date_modified
            ,auditlog_wallclock_modified
            ,auditlog_role_modified
            ,auditlog_date_deactivated
            ,auditlog_role_deactivated
            ,auditlog_row_version_number
    FROM     musextputils.auditlog;

ALTER VIEW musextputils.v_auditlog_changes OWNER TO admin;

REVOKE ALL ON TABLE musextputils.v_auditlog_changes FROM public;
GRANT ALL ON TABLE musextputils.v_auditlog_changes TO admin;
GRANT ALL ON TABLE musextputils.v_auditlog_changes TO xtrole;

COMMENT ON VIEW musextputils.v_auditlog_changes
    IS $DOC$Provides auditlog data focusing on changed data rather than complete records.$DOC$;
