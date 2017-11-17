/*************************************************************************
 *************************************************************************
 **
 ** File:    trig_b_iu_audit_field_maintenance.sql
 ** Project:    Muse Systems xTuple Utils
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

CREATE OR REPLACE FUNCTION musextputils.trig_b_iu_audit_field_maintenance()
    RETURNS trigger AS
       $BODY$
         DECLARE
          vHstoreNew  hstore;
          vHstoreOld  hstore;
          vHstoreFinal hstore;
          pDateCreatedColumnName text;
          pRoleCreatedColumnName text;
          pDateDeactivatedColumnName text;
          pRoleDeactivatedColumnName text;
          pDateModifiedColumnName text;
          pWallclockModifiedColumnName text;
          pRoleModifiedColumnName text;
          pRowVersionNumberColumnName text;
          pIsActiveColumnName text;

         BEGIN
          -- If this is an update and no actual data has changed, we can short
          -- circuit the entire process a bit.  At this point the audit fields
          -- should not be updated either.
          IF TG_OP = 'UPDATE'
            AND coalesce(
                  array_length(
                      akeys(hstore(NEW) - hstore(OLD)),1)
                  ,0) < 1 THEN

              -- We detect no changes so just return NEW.  Nothing to update.
              RETURN NEW;

          END IF;

          -- Now let's failsafe (a little) the trigger.  We're expecting parameters, but may not get them. (we'll label them "p" even though they are real function params.)
          IF TG_ARGV[0] IS NULL THEN
              pDateCreatedColumnName := 'muse_date_created';
          ELSE
              pDateCreatedColumnName := TG_ARGV[0];
          END IF;

          IF TG_ARGV[1] IS NULL THEN
              pRoleCreatedColumnName := 'muse_role_created';
          ELSE
              pRoleCreatedColumnName := TG_ARGV[1];
          END IF;

          IF TG_ARGV[2] IS NULL THEN
              pDateDeactivatedColumnName := 'muse_date_deactivated';
          ELSE
              pDateDeactivatedColumnName := TG_ARGV[2];
          END IF;

          IF TG_ARGV[3] IS NULL THEN
              pRoleDeactivatedColumnName := 'muse_role_deactivated';
          ELSE
              pRoleDeactivatedColumnName := TG_ARGV[3];
          END IF;

          IF TG_ARGV[4] IS NULL THEN
              pDateModifiedColumnName := 'muse_date_modified';
          ELSE
              pDateModifiedColumnName := TG_ARGV[4];
          END IF;

          IF TG_ARGV[5] IS NULL THEN
              pWallclockModifiedColumnName := 'muse_wallclock_modified';
          ELSE
              pWallclockModifiedColumnName := TG_ARGV[5];
          END IF;

          IF TG_ARGV[6] IS NULL THEN
              pRoleModifiedColumnName := 'muse_role_modified';
          ELSE
              pRoleModifiedColumnName := TG_ARGV[6];
          END IF;

          IF TG_ARGV[7] IS NULL THEN
              pRowVersionNumberColumnName := 'muse_row_version_number';
          ELSE
              pRowVersionNumberColumnName := TG_ARGV[7];
          END IF;

          IF TG_ARGV[8] IS NULL THEN
              pIsActiveColumnName := 'muse_is_active';
          ELSE
              pIsActiveColumnName := TG_ARGV[8];
          END IF;

          -- Let's turn the new and old records into hstores so we can arbitrarily get their columns.  We also need to make the final hstore look a lot like NEW.
          vHstoreNew := hstore(NEW);

          vHstoreFinal := delete(vHstoreNew,ARRAY[ pDateCreatedColumnName
                                     ,pRoleCreatedColumnName
                                     ,pDateModifiedColumnName
                                     ,pWallclockModifiedColumnName
                                     ,pRoleModifiedColumnName
                                     ,pRowVersionNumberColumnName
                                     ,pDateDeactivatedColumnName
                                     ,pRoleDeactivatedColumnName]);

          -- Now we can get some work done.
          IF TG_OP = 'INSERT' THEN
              vHstoreFinal := vHstoreFinal || hstore(pDateCreatedColumnName, (now())::text);
              vHstoreFinal := vHstoreFinal || hstore(pRoleCreatedColumnName, (session_user)::text);
              vHstoreFinal := vHstoreFinal || hstore(pDateModifiedColumnName, (now())::text);
              vHstoreFinal := vHstoreFinal || hstore(pWallclockModifiedColumnName, (clock_timestamp())::text);
              vHstoreFinal := vHstoreFinal || hstore(pRoleModifiedColumnName, (session_user)::text);
              vHstoreFinal := vHstoreFinal || hstore(pRowVersionNumberColumnName, (1)::text);

          ELSIF TG_OP = 'UPDATE' THEN
              vHstoreOld := hstore(OLD);
              IF (NOT (vHstoreNew->pIsActiveColumnName)::boolean AND (vHstoreOld->pIsActiveColumnName)::boolean) THEN
                 vHstoreFinal := vHstoreFinal || hstore(pDateDeactivatedColumnName, (now())::text);
                 vHstoreFinal := vHstoreFinal || hstore(pRoleDeactivatedColumnName, (session_user)::text);
              ELSIF ((vHstoreNew->pIsActiveColumnName)::boolean AND NOT (vHstoreOld->pIsActiveColumnName)::boolean) THEN
                 vHstoreFinal := vHstoreFinal || hstore(pDateDeactivatedColumnName,null);
                 vHstoreFinal := vHstoreFinal || hstore(pRoleDeactivatedColumnName,null);
              END IF;
              vHstoreFinal := vHstoreFinal || hstore(pDateModifiedColumnName, (now())::text);
              vHstoreFinal := vHstoreFinal || hstore(pWallclockModifiedColumnName, (clock_timestamp())::text);
              vHstoreFinal := vHstoreFinal || hstore(pRoleModifiedColumnName, (session_user)::text);
              vHstoreFinal := vHstoreFinal || hstore(pRowVersionNumberColumnName, ((vHstoreOld->pRowVersionNumberColumnName)::int8 + 1)::text);
          ELSE
              RAISE EXCEPTION 'We should never get here.  The audit trigger was fired on something other than the insert/update of a regular record type. (FUNC: musextputils.trig_b_iu_audit_field_maintenance)';
          END IF;

          -- We've done our hstore magic, lets actually get a record to return...
          NEW := populate_record(NEW,vHstoreFinal);

          RETURN NEW;

         END;
       $BODY$
    LANGUAGE plpgsql;

ALTER FUNCTION musextputils.trig_b_iu_audit_field_maintenance()
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.trig_b_iu_audit_field_maintenance() FROM public;
GRANT EXECUTE ON FUNCTION musextputils.trig_b_iu_audit_field_maintenance() TO admin;
GRANT EXECUTE ON FUNCTION musextputils.trig_b_iu_audit_field_maintenance() TO xtrole;

COMMENT ON FUNCTION musextputils.trig_b_iu_audit_field_maintenance() IS 'A trigger function to maintain "common table" auditing fields recording date and role created, last modified, etc.';