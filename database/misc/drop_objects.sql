-- File:        drop_objects.sql
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


-- This script will clean up package objects such as scripts, reports, and
-- UI forms.  These objects can get left behind as cruft as change happens
-- and there's no real mechanism to clean them up... that is until this
-- script!

DELETE FROM musextputils.pkgscript;
DELETE FROM musextputils.pkgreport;
DELETE FROM musextputils.pkgmetasql;
DELETE FROM musextputils.pkguiform;
DELETE FROM musextputils.pkgcmd;
DELETE FROM musextputils.pkgcmdarg;
DELETE FROM musextputils.pkgimage;
