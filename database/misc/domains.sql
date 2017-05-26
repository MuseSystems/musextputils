/*************************************************************************
 *************************************************************************
 **
 ** File: 		domains.sql
 ** Project: 	Muse Systems xTuple Utilities
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