-- File:        domains.sql
-- Location:    musextputils/database/misc
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
--   This file contains any PostgreSQL Domain definitions that are might be
--   useful in the context of xTuple data definition.  There will probably
--   only be a small handful of these.
--
CREATE OR REPLACE FUNCTION  musextputils.create_uppertext_domain()
    RETURNS void AS
        $BODY$
            DECLARE

            BEGIN

                -- First we'll see if the domain exists already.  If not, we'll create it.  If so, we'll check to be sure that it's up to spec.
                IF NOT EXISTS(SELECT 1 FROM pg_type pt JOIN pg_namespace pn ON pt.typnamespace = pn.oid WHERE pn.nspname = 'musextputils' AND pt.typname = 'uppertext') THEN
                    CREATE DOMAIN musextputils.uppertext AS text
                        CHECK(
                            NOT (VALUE ~ '[[:lower:]]+')
                        );

                    ALTER DOMAIN  musextputils.uppertext OWNER TO admin;

                    COMMENT ON DOMAIN musextputils.uppertext IS 'A simple domain type that validates to upper case text.';


                ELSE
                    -- The domain does exist, so let's make sure it's where it needs to be (or do nothing at all).

                END IF;


            END;
        $BODY$
    LANGUAGE plpgsql;


COMMENT ON FUNCTION musextputils.create_uppertext_domain() IS 'This temporary function creates the musextputils.uppertext.  The script that creates this function should also delete it once it has been used.';

SELECT musextputils.create_uppertext_domain();
DROP FUNCTION musextputils.create_uppertext_domain();