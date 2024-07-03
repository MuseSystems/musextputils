-- File:        trig_b_iu_audit_field_maintenance.sql
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


CREATE OR REPLACE FUNCTION musextputils.trig_b_iu_audit_field_maintenance()
    RETURNS trigger AS
       $BODY$
         DECLARE
             vJsonbNew                    jsonb;
             vJsonbOld                    jsonb;
             vJsonbFinal                  jsonb;

             pDateCreatedColumnName       text;
             pRoleCreatedColumnName       text;
             pDateDeactivatedColumnName   text;
             pRoleDeactivatedColumnName   text;
             pDateModifiedColumnName      text;
             pWallclockModifiedColumnName text;
             pRoleModifiedColumnName      text;
             pRowVersionNumberColumnName  text;
             pIsActiveColumnName          text;

         BEGIN
          -- If this is an update and no actual data has changed, we can short
          -- circuit the entire process a bit.  At this point the audit fields
          -- should not be updated either.

          IF TG_OP = 'UPDATE' AND to_jsonb( new ) = to_jsonb( old ) THEN

              RETURN NEW;

          END IF;

          -- Now let's failsafe (a little) the trigger.  We're expecting
          -- parameters, but may not get them. (we'll label them "p" even though
          -- they are real function params.)

          pDateCreatedColumnName       := coalesce(TG_ARGV[0], 'muse_date_created');
          pRoleCreatedColumnName       := coalesce(TG_ARGV[1], 'muse_role_created');
          pDateDeactivatedColumnName   := coalesce(TG_ARGV[2], 'muse_date_deactivated');
          pRoleDeactivatedColumnName   := coalesce(TG_ARGV[3], 'muse_role_deactivated');
          pDateModifiedColumnName      := coalesce(TG_ARGV[4], 'muse_date_modified');
          pWallclockModifiedColumnName := coalesce(TG_ARGV[5], 'muse_wallclock_modified');
          pRoleModifiedColumnName      := coalesce(TG_ARGV[6], 'muse_role_modified');
          pRowVersionNumberColumnName  := coalesce(TG_ARGV[7], 'muse_row_version_number');
          pIsActiveColumnName          := coalesce(TG_ARGV[8], 'muse_is_active');

          vJsonbNew := to_jsonb( new );

          vJsonbFinal := vJsonbNew - ARRAY [ pDateCreatedColumnName
                                           , pRoleCreatedColumnName
                                           , pDateModifiedColumnName
                                           , pWallclockModifiedColumnName
                                           , pRoleModifiedColumnName
                                           , pRowVersionNumberColumnName
                                           , pDateDeactivatedColumnName
                                           , pRoleDeactivatedColumnName];

          -- Now we can get some work done.
          IF TG_OP = 'INSERT' THEN

              vJsonbFinal := vJsonbFinal || jsonb_build_object( pDateCreatedColumnName, now());
              vJsonbFinal := vJsonbFinal || jsonb_build_object( pRoleCreatedColumnName, session_user);
              vJsonbFinal := vJsonbFinal || jsonb_build_object( pDateModifiedColumnName, now());
              vJsonbFinal := vJsonbFinal || jsonb_build_object( pWallclockModifiedColumnName, clock_timestamp());
              vJsonbFinal := vJsonbFinal || jsonb_build_object( pRoleModifiedColumnName, session_user);
              vJsonbFinal := vJsonbFinal || jsonb_build_object( pRowVersionNumberColumnName, 1);

          ELSIF TG_OP = 'UPDATE' THEN

              vJsonbOld := to_jsonb( old );

              IF (NOT (vJsonbNew->pIsActiveColumnName)::boolean AND (vJsonbOld->pIsActiveColumnName)::boolean) THEN
                 vJsonbFinal := vJsonbFinal || jsonb_build_object(pDateDeactivatedColumnName, now());
                 vJsonbFinal := vJsonbFinal || jsonb_build_object(pRoleDeactivatedColumnName, session_user);
              ELSIF ((vJsonbNew->pIsActiveColumnName)::boolean AND NOT (vJsonbOld->pIsActiveColumnName)::boolean) THEN
                 vJsonbFinal := vJsonbFinal || jsonb_build_object(pDateDeactivatedColumnName,null);
                 vJsonbFinal := vJsonbFinal || jsonb_build_object(pRoleDeactivatedColumnName,null);
              END IF;

              vJsonbFinal := vJsonbFinal || jsonb_build_object(pDateModifiedColumnName, now());
              vJsonbFinal := vJsonbFinal || jsonb_build_object(pWallclockModifiedColumnName, clock_timestamp());
              vJsonbFinal := vJsonbFinal || jsonb_build_object(pRoleModifiedColumnName, session_user);
              vJsonbFinal := vJsonbFinal || jsonb_build_object(pRowVersionNumberColumnName, ((vJsonbOld->pRowVersionNumberColumnName)::int8 + 1));

          ELSE

              RAISE EXCEPTION
                  'We should never get here.  The audit trigger was fired on '
                  'something other than the insert/update of a regular record '
                  'type. (FUNC: musextputils.trig_b_iu_audit_field_maintenance)';
          END IF;

          new := jsonb_populate_record(new, vJsonbFinal);

          RETURN new;

         END;
       $BODY$
    LANGUAGE plpgsql;

ALTER FUNCTION musextputils.trig_b_iu_audit_field_maintenance()
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.trig_b_iu_audit_field_maintenance() FROM public;
GRANT EXECUTE ON FUNCTION musextputils.trig_b_iu_audit_field_maintenance() TO admin;
GRANT EXECUTE ON FUNCTION musextputils.trig_b_iu_audit_field_maintenance() TO xtrole;

COMMENT ON FUNCTION musextputils.trig_b_iu_audit_field_maintenance() IS
    'A trigger function to maintain "common table" auditing fields recording '
    'date and role created, last modified, etc.';
