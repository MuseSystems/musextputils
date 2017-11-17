/*************************************************************************
 *************************************************************************
 **
 ** File:       exceptionlog.sql
 ** Project:    Muse Systems xTuple ERP Utilities
 ** Author:     Steven C. Buttgereit
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

CREATE OR REPLACE FUNCTION  musextputils.create_exceptionlog_table()
    RETURNS void AS
        $BODY$
            DECLARE

            BEGIN

                -- First we'll see if the table exists already.  If not, we'll create it.  If so, we'll check to be sure that it's up to spec.
                IF NOT EXISTS(SELECT 1 FROM musextputils.v_basic_catalog WHERE table_schema_name = 'musextputils' AND table_name = 'exceptionlog') THEN
                    -- The table doesn't exist, so let's create it.
                    CREATE TABLE musextputils.exceptionlog (
                         exceptionlog_id                        bigserial       NOT NULL    PRIMARY KEY
                        ,exceptionlog_name                      text
                        ,exceptionlog_descrip                   text
                        ,exceptionlog_message                   text
                        ,exceptionlog_function_name             text
                        ,exceptionlog_package_name              text
                        ,exceptionlog_payload                   jsonb
                    );

                    ALTER TABLE  musextputils.exceptionlog OWNER TO admin;

                    COMMENT ON TABLE musextputils.exceptionlog IS 'A place to store thrown exceptions created by our exception framework.';

                    COMMENT ON COLUMN musextputils.exceptionlog.exceptionlog_id IS 'A sequential big integer primary key.';
                    COMMENT ON COLUMN musextputils.exceptionlog.exceptionlog_name IS 'The general name of the exception.  This is set in the exception defintion inside of xTuple code..';
                    COMMENT ON COLUMN musextputils.exceptionlog.exceptionlog_descrip IS 'The general description of the exception thrown. This is set in the exception definition inside the xTuple code.';
                    COMMENT ON COLUMN musextputils.exceptionlog.exceptionlog_message IS 'A message that is generated when the exception itself is thrown (not in the exception class definition).';
                    COMMENT ON COLUMN musextputils.exceptionlog.exceptionlog_function_name IS 'The name on of function that threw the exception.';
                    COMMENT ON COLUMN musextputils.exceptionlog.exceptionlog_package_name IS 'If a package is identified, the name of the package.';
                    COMMENT ON COLUMN musextputils.exceptionlog.exceptionlog_payload IS 'Contains relevant contextual information to the application''s state at the time of the exception in JSON format.  This can include calling parameters, internal values, or exception stack data.';

                    PERFORM musextputils.add_common_table_columns('musextputils','exceptionlog', 'exceptionlog_date_created', 'exceptionlog_role_created', 'exceptionlog_date_deactivated', 'exceptionlog_role_deactivated'
                            , 'exceptionlog_date_modified', 'exceptionlog_wallclock_modified', 'exceptionlog_role_modified', 'exceptionlog_row_version_number', 'exceptionlog_is_active');

                    REVOKE ALL ON TABLE musextputils.exceptionlog FROM public;
                    GRANT ALL ON TABLE musextputils.exceptionlog TO admin;
                    GRANT ALL ON TABLE musextputils.exceptionlog TO xtrole;

                ELSE
                    -- Check if the exceptionlog_payload field is already jsonb
                    -- if not, make it so.
                    IF EXISTS (SELECT   true
                                FROM    musextputils.v_basic_catalog
                               WHERE    table_schema_name = 'musextputils'
                                    AND table_name = 'exceptionlog'
                                    AND column_name = 'exceptionlog_payload'
                                    AND column_type_name = 'text') THEN

                        -- OK.  We're going to rename our current column and
                        -- create a new one with the same name.  We won't
                        -- migrate the data since it's only diagnostic and will
                        -- be difficult to migrate without error or in a useful
                        -- form.  Later we may deprecate the legacy column.
                        -- In the meantime, manual one-off migration can be
                        -- done outside of the package if appropriate.
                        ALTER TABLE musextputils.exceptionlog
                            RENAME COLUMN exceptionlog_payload
                                TO exceptionlog_legacy_payload;

                        ALTER TABLE musextputils.exceptionlog
                            ADD COLUMN exceptionlog_payload jsonb
                            DEFAULT '{}'::jsonb;

                        COMMENT ON COLUMN musextputils.exceptionlog.exceptionlog_payload IS 'Contains relevant contextual information to the application''s state at the time of the exception in JSON format.  This can include calling parameters, internal values, or exception stack data.';

                    END IF;

                END IF;

            END;
        $BODY$
    LANGUAGE plpgsql;

ALTER FUNCTION  musextputils.create_exceptionlog_table()
    OWNER TO admin;

COMMENT ON FUNCTION musextputils.create_exceptionlog_table() IS 'This temporary function creates the musextputils.exceptionlog.  The script that creates this function should also delete it once it has been used.';

SELECT musextputils.create_exceptionlog_table();

DROP FUNCTION musextputils.create_exceptionlog_table();