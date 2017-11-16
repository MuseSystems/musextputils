/*************************************************************************
 *************************************************************************
 **
 ** File:         auditlog.sql
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

DO
    $BODY$
        DECLARE

        BEGIN

            -- Create the table if it does not exist.  Apply deltas if it does and it's needed.
            IF NOT EXISTS(SELECT     true
                          FROM         musextputils.v_basic_catalog
                          WHERE     table_schema_name = 'musextputils'
                                  AND table_name = 'auditlog') THEN
                -- The table doesn't exist, so let's create it.
                CREATE TABLE musextputils.auditlog (
                     auditlog_id    bigserial    NOT NULL    PRIMARY KEY
                    ,auditlog_table_schema text NOT NULL
                    ,auditlog_table text NOT NULL
                    ,auditlog_record_id bigint NOT NULL
                    ,auditlog_change_type text NOT NULL
                    ,auditlog_txid bigint NOT NULL DEFAULT txid_current()
                    ,auditlog_old_record jsonb NOT NULL DEFAULT '{}'::jsonb
                    ,auditlog_new_record jsonb NOT NULL DEFAULT '{}'::jsonb
                );

                ALTER TABLE  musextputils.auditlog OWNER TO admin;

                REVOKE ALL ON TABLE musextputils.auditlog FROM public;
                GRANT ALL ON TABLE musextputils.auditlog TO admin;
                GRANT ALL ON TABLE musextputils.auditlog TO xtrole;

                COMMENT ON TABLE musextputils.auditlog
                    IS $DOC$Records data changes to selected tables for selected SQL events (insert, update, delete).  Note that this table should likely be partitioned or purged in order to maintain query performance over time.$DOC$;

                -- Column Comments
                COMMENT ON COLUMN musextputils.auditlog.auditlog_id
                    IS
                    $DOC$The unique identifier for this record.$DOC$;

                COMMENT ON COLUMN musextputils.auditlog.auditlog_table_schema
                    IS
                    $DOC$The name of the schema in which the table being audited resides.$DOC$;

                COMMENT ON COLUMN musextputils.auditlog.auditlog_table
                    IS
                    $DOC$The name of the table being audited.$DOC$;

                COMMENT ON COLUMN musextputils.auditlog.auditlog_record_id
                    IS
                    $DOC$The unique indentifier (primary key) of the record which is the subject of the audit record.  Note that we assume that all primary keys are some numeric form, either integer, bigint, or numeric; this should be true in xTuple generally.$DOC$;

                COMMENT ON COLUMN musextputils.auditlog.auditlog_change_type
                    IS
                    $DOC$The event that caused the change to be recorded.  Almost certainly INSERT, UPDATE, or DELETE.$DOC$;

                COMMENT ON COLUMN musextputils.auditlog.auditlog_txid
                    IS
                    $DOC$The PostgreSQL transaction ID (per txid_current) that included the change.$DOC$;

                COMMENT ON COLUMN musextputils.auditlog.auditlog_old_record
                    IS
                    $DOC$A JSON representation of the record before the change.  In INSERT operations, this will be an empty JSON object.$DOC$;

                COMMENT ON COLUMN musextputils.auditlog.auditlog_new_record
                    IS
                    $DOC$A JSON representation of the record after the change.  In DELETE operations, this will be an empty object.$DOC$;


                -- Let's now add the audit columns and triggers
                PERFORM musextputils.add_common_table_columns(   'musextputils'
                                                                ,'auditlog'
                                                                ,'auditlog_date_created'
                                                                ,'auditlog_role_created'
                                                                ,'auditlog_date_deactivated'
                                                                ,'auditlog_role_deactivated'
                                                                ,'auditlog_date_modified'
                                                                ,'auditlog_wallclock_modified'
                                                                ,'auditlog_role_modified'
                                                                ,'auditlog_row_version_number'
                                                                ,'auditlog_is_active');

                -- Set up musextputils.auditlog self-auditing for update and delete.  Really
                -- there should never be an update/delete on this table outside of intentional
                -- truncation or parition dropping.  Please note that this is not sufficient for
                -- regulatory audit control as it's fairly easily bypassable.

                PERFORM musextputils.add_table_auditing('musextputils', 'auditlog',
                    'auditlog_id', ARRAY['UPDATE','DELETE']);


            ELSE
                -- Deltas go here.  Be sure to check if each is really needed.

            END IF;


        END;
    $BODY$;
