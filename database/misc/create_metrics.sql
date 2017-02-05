/*************************************************************************
 *************************************************************************
 **
 ** File:         create_metrics.sql
 ** Project:      Muse Systems xTuple Utilities
 ** Author:       Steven C. Buttgereit
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

-- This script is used to create metrics in the common/custom musextputils.metrics table.  Only try if the metric doesn't exist already.
SELECT musextputils.create_musemetric('musextputils', 'debugErrorMessageDisplay', 'Determines whether the displayError function will show full error messages or simplified error messages suitable for end users.', false)
    WHERE musextputils.get_musemetric('musextputils', 'debugErrorMessageDisplay', null::boolean) IS NULL;