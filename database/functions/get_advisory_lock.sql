/*************************************************************************
 *************************************************************************
 **
 ** File:         get_advisory_lock.sql
 ** Project:     Muse Systems xTuple ERP Utilities
 ** Author:        Steven C. Buttgereit
 **
 ** (C) 2014-2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 ** 
 ** License: MIT License. See LICENSE.TXT for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

--
--  There are a couple of kinds of advisor locks.  For xTuple work, the most useful are the session advisory locks.
--  Both the bigint version and the dual keyed int versions are useful so we'll make those two.  Unlocking and such
--  should be handled using stock xTuple functionality; we wrapper here since we want to use some of the related data
--     like who already has a lock.

-- The bigint version of the function.

CREATE OR REPLACE FUNCTION musextputils.get_advisory_lock(pLockID bigint) 
    RETURNS TABLE(is_acquired boolean, locker_pid integer, locker_role text) AS
        $BODY$
            DECLARE
                vIsAcquired     boolean := false;
            BEGIN
                -- First, let's validate input.
                IF pLockID IS NULL THEN
                    RAISE EXCEPTION 'This function required a non-null value and you passed us a null.  Please don''t do that.  Thank you. (FUNC: musextputils.get_advisory_lock(bigint))';
                END IF;

                -- Make compatible with both PostgreSQL < 9.3 AND 9.3+
                CASE 
                    WHEN current_setting('server_version_num')::integer >= 90300 THEN
                        -- This is PostgreSQL 9.3 or greater so run the queries compatible with that version.

                        -- Next, we'll try and get the lock requested.  We'll follow xTuple's idea of also checking for the same session having the lock already.
                        IF EXISTS(SELECT     1 
                                    FROM     pg_catalog.pg_stat_activity psa 
                                        JOIN pg_catalog.pg_locks pl ON pl.pid = psa.pid
                                    WHERE     pl.locktype = 'advisory'
                                            AND pl.objsubid = 1
                                            AND    (pl.classid::int8 << 32) | pl.objid::int8 = pLockID
                                            AND pl.granted) THEN
                            -- Looks like it exists, so we'll return false.
                            vIsAcquired := false;
                        ELSE
                            vIsAcquired := pg_try_advisory_lock(pLockID);
                        END IF;

                        -- If we fail to lock, then we want to return pertinent information. Otherwise we'll return a positive respsonse.
                        IF NOT vIsAcquired THEN 

                            RETURN QUERY (SELECT     vIsAcquired,coalesce(psa.pid,-2)::integer,coalesce(psa.usename,'***UNKNOWN***')::text
                                            FROM     pg_catalog.pg_stat_activity psa JOIN pg_catalog.pg_locks pl ON pl.pid = psa.pid
                                          WHERE     pl.locktype = 'advisory'
                                                  AND pl.objsubid = 1
                                                  AND    (pl.classid::int8 << 32) | pl.objid::int8 = pLockID);
                            RETURN;
                        
                        END IF;

                    WHEN current_setting('server_version_num')::integer < 90300 THEN
                        -- This PostgreSQL 9.2 or earlier so we'll run those queries.

                        -- Next, we'll try and get the lock requested.  We'll follow xTuple's idea of also checking for the same session having the lock already.
                        IF EXISTS(SELECT     1 
                                    FROM     pg_catalog.pg_stat_activity psa 
                                        JOIN pg_catalog.pg_locks pl ON pl.pid = psa.procpid
                                    WHERE     pl.locktype = 'advisory'
                                            AND pl.objsubid = 1
                                            AND    (pl.classid::int8 << 32) | pl.objid::int8 = pLockID
                                            AND pl.granted) THEN
                            -- Looks like it exists, so we'll return false.
                            vIsAcquired := false;
                        ELSE
                            vIsAcquired := pg_try_advisory_lock(pLockID);
                        END IF;

                        -- If we fail, then we want to return pertinent information. Otherwise we'll return a positive respsonse.
                        IF NOT vIsAcquired THEN 

                                RETURN QUERY (SELECT     vIsAcquired,coalesce(psa.procpid,-2)::integer,coalesce(psa.usename,'***UNKNOWN***')::text
                                                FROM     pg_catalog.pg_stat_activity psa JOIN pg_catalog.pg_locks pl ON pl.pid = psa.procpid
                                              WHERE     pl.locktype = 'advisory'
                                                      AND pl.objsubid = 1
                                                      AND    (pl.classid::int8 << 32) | pl.objid::int8 = pLockID);
                                RETURN;
                            
                        END IF;
                    ELSE
                        -- We didn't successfully detect the PostgreSQL version correctly... somthing's wrong.
                        RAISE EXCEPTION 'Trying to get a bigint advisory lock, something went awry.  We should never get here. (FUNC: musextputils.get_advisory_lock(bigint))';

                END CASE;

                --If we get here we should have successfully gotten our lock.... so return it!
                RETURN QUERY (SELECT vIsAcquired,null::integer,null::text);
                RETURN;
                
            END;
        $BODY$
    LANGUAGE plpgsql;

ALTER FUNCTION musextputils.get_advisory_lock(pLockID bigint)
    OWNER TO admin;

COMMENT ON FUNCTION musextputils.get_advisory_lock(pLockID bigint) IS 'A function to obtain a session advisory lock using a single bigint, or to return useful information if a lock is not acqiured.  Use the standard PostgreSQL advisor management functions for all needs after the lock is successfully acquired.';

REVOKE EXECUTE ON FUNCTION musextputils.get_advisory_lock(bigint) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.get_advisory_lock(bigint) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.get_advisory_lock(bigint) TO xtrole;


-- This is the int, int version of the function.
CREATE OR REPLACE FUNCTION musextputils.get_advisory_lock(pFirstLockID integer, pSecondLockID integer) 
    RETURNS TABLE(is_acquired boolean, locker_pid integer, locker_role text) AS
        $BODY$
            DECLARE
                vIsAcquired     boolean := false;
            BEGIN
                -- First, let's validate input.
                IF pFirstLockID IS NULL OR pSecondLockID IS NULL THEN
                    RAISE EXCEPTION 'This function requires a parameters to be non-null and you passed us a null (%,%).  Please don''t do that.  Thank you. (FUNC: musextputils.get_advisory_lock(int, int))',pFirstLockID,pSecondLockID;
                END IF;

                -- Make compatible with both PostgreSQL < 9.3 AND 9.3+
                CASE 
                    WHEN current_setting('server_version_num')::integer >= 90300 THEN
                        -- This is PostgreSQL 9.3 or greater so run the queries compatible with that version.

                        -- Next, we'll try and get the lock requested.  We'll follow xTuple's idea of also checking for the same session having the lock already.
                        IF EXISTS(SELECT     1 
                                    FROM     pg_catalog.pg_stat_activity psa 
                                        JOIN pg_catalog.pg_locks pl ON pl.pid = psa.pid
                                    WHERE     pl.locktype = 'advisory'
                                            AND pl.objsubid = 2
                                            AND    pl.classid::int8 = pFirstLockID AND pl.objid::int8 = pSecondLockID
                                            AND pl.granted) THEN
                            -- Looks like it exists, so we'll return false.
                            vIsAcquired := false;
                        ELSE
                            vIsAcquired := pg_try_advisory_lock(pFirstLockID,pSecondLockID);
                        END IF;

                        -- If we fail to lock, then we want to return pertinent information. Otherwise we'll return a positive respsonse.
                        IF NOT vIsAcquired THEN 

                            RETURN QUERY (SELECT     vIsAcquired,coalesce(psa.pid,-2)::integer,coalesce(psa.usename,'***UNKNOWN***')::text
                                            FROM     pg_catalog.pg_stat_activity psa JOIN pg_catalog.pg_locks pl ON pl.pid = psa.pid
                                          WHERE     pl.locktype = 'advisory'
                                                  AND pl.objsubid = 2
                                                  AND    pl.classid::int8 = pFirstLockID AND pl.objid::int8 = pSecondLockID);
                            RETURN;
                        
                        END IF;

                    WHEN current_setting('server_version_num')::integer < 90300 THEN
                        -- This PostgreSQL 9.2 or earlier so we'll run those queries.

                        -- Next, we'll try and get the lock requested.  We'll follow xTuple's idea of also checking for the same session having the lock already.
                        IF EXISTS(SELECT     1 
                                    FROM     pg_catalog.pg_stat_activity psa 
                                        JOIN pg_catalog.pg_locks pl ON pl.pid = psa.procpid
                                    WHERE     pl.locktype = 'advisory'
                                            AND pl.objsubid = 2
                                            AND    pl.classid::int8 = pFirstLockID AND pl.objid::int8 = pSecondLockID
                                            AND pl.granted) THEN
                            -- Looks like it exists, so we'll return false.
                            vIsAcquired := false;
                        ELSE
                            vIsAcquired := pg_try_advisory_lock(pFirstLockID,pSecondLockID);
                        END IF;

                        -- If we fail, then we want to return pertinent information. Otherwise we'll return a positive respsonse.
                        IF NOT vIsAcquired THEN 

                                RETURN QUERY (SELECT     vIsAcquired,coalesce(psa.procpid,-2)::integer,coalesce(psa.usename,'***UNKNOWN***')::text
                                                FROM     pg_catalog.pg_stat_activity psa JOIN pg_catalog.pg_locks pl ON pl.pid = psa.procpid
                                              WHERE     pl.locktype = 'advisory'
                                                      AND pl.objsubid = 2
                                                      AND    pl.classid::int8 = pFirstLockID AND pl.objid::int8 = pSecondLockID);
                                RETURN;
                            
                        END IF;
                    ELSE
                        -- We didn't successfully detect the PostgreSQL version correctly... somthing's wrong.
                        RAISE EXCEPTION 'Trying to get a dual key advisory lock, something went awry.  We should never get here. (FUNC: musextputils.get_advisory_lock(int, int))';

                END CASE;

                --If we get here we should have successfully gotten our lock.... so return it!
                RETURN QUERY (SELECT vIsAcquired,null::integer,null::text);
                RETURN;
                
            END;
        $BODY$
    LANGUAGE plpgsql;

ALTER FUNCTION musextputils.get_advisory_lock(pFirstLockID integer, pSecondLockID integer)
    OWNER TO admin;

COMMENT ON FUNCTION musextputils.get_advisory_lock(pFirstLockID integer, pSecondLockID integer) IS 'A function to obtain a session advisory lock using dual integer keys, or to return useful information if a lock is not acqiured.  Use the standard PostgreSQL advisor management functions for all needs after the lock is successfully acquired.';

REVOKE EXECUTE ON FUNCTION musextputils.get_advisory_lock(bigint) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.get_advisory_lock(bigint) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.get_advisory_lock(bigint) TO xtrole;

