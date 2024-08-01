-- File:        musemetric.sql
-- Location:    musextputils/database/tables
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


CREATE OR REPLACE FUNCTION musextputils.create_musemetric_table()
    RETURNS void AS
        $BODY$
            DECLARE

            BEGIN

                --Check to see if the table exists, if not we'll create it.  If
                --so we'll just be sure it's up-to-date.
                IF NOT EXISTS(SELECT    true
                              FROM      information_schema.tables
                              WHERE     table_schema = 'musextputils'
                                    AND table_name = 'musemetric') THEN
                    -- The table doesn't exist so we'll create it here.
                    CREATE TABLE musextputils.musemetric (
                             musemetric_id                  bigserial       NOT NULL PRIMARY KEY
                            ,musemetric_package             text            NOT NULL
                            ,musemetric_name                text            NOT NULL
                            ,musemetric_descrip             text            NOT NULL
                            ,musemetric_number              numeric
                            ,musemetric_text                text
                            ,musemetric_flag                boolean
                            ,musemetric_date                timestamptz
                            ,musemetric_jsonb               jsonb
                            ,musemetric_number_array        numeric[]
                            ,musemetric_text_array          text[]
                            ,UNIQUE(musemetric_package,musemetric_name)
                    );

                    COMMENT ON TABLE musextputils.musemetric IS 'An centralized alternative for holding configuration data outside of the stock metrics table.  xTuple provides no standard way to add configuration points so this fills that gap.';

                    ALTER TABLE musextputils.musemetric OWNER TO admin;

                    REVOKE ALL ON TABLE musextputils.musemetric FROM public;
                    GRANT ALL ON TABLE musextputils.musemetric TO admin;
                    GRANT ALL ON TABLE musextputils.musemetric TO xtrole;

                    -- Let's now add the audit columns and triggers
                    PERFORM musextputils.add_common_table_columns(
                         'musextputils'
                        ,'musemetric'
                        ,'musemetric_date_created'
                        ,'musemetric_role_created'
                        ,'musemetric_date_deactivated'
                        ,'musemetric_role_deactivated'
                        ,'musemetric_date_modified'
                        ,'musemetric_wallclock_modified'
                        ,'musemetric_role_modified'
                        ,'musemetric_row_version_number'
                        ,'musemetric_is_active');

                ELSE
                    -- The table does exist so, if needed, we'll apply updates
                    -- in as rational a fashion as possible.

                    -- Add a column for jsonb configuration support.
                    IF NOT EXISTS(SELECT    true
                                  FROM      information_schema.columns
                                  WHERE     table_schema = 'musextputils'
                                        AND table_name = 'musemetric'
                                        AND column_name = 'musemetric_jsonb') THEN

                        -- The column doesn't exist, so we create it.
                        ALTER TABLE musextputils.musemetric
                            ADD COLUMN musemetric_jsonb jsonb;

                        COMMENT ON COLUMN musextputils.musemetric.musemetric_jsonb
                            IS 'A column to store JSONB based configuration data.';
                    END IF;

                    -- TODO: At some point we should add code to remove the
                    --       musemetric.musemetric_hstore column if it exists.
                    --       But that's not a safe operation since valuable data
                    --       may exist there with some users.  As such, we'll
                    --       just ignore its existence for now.

                END IF;

            END;
        $BODY$
    LANGUAGE plpgsql;

ALTER FUNCTION musextputils.create_musemetric_table()
    OWNER TO admin;

COMMENT ON FUNCTION musextputils.create_musemetric_table() IS 'This temporary function creates the musextputils.musemetric table.  This function should be deleted by the script that called it.';

SELECT musextputils.create_musemetric_table();

DROP FUNCTION musextputils.create_musemetric_table();
