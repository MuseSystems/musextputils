/*************************************************************************
 *************************************************************************
 **
 ** File:         drop_objects.sql
 ** Project:      Muse Systems xTuple Utilities
 ** Author:       Steven C. Buttgereit
 **
 ** (C) 2016-2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 ** 
 ** License: MIT License. See LICENSE.TXT for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

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
