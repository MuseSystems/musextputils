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
 ** License: MIT License. See LICENSE.md for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

-- This script is used to create metrics in the common/custom musextputils.metrics table.  Only try if the metric doesn't exist already.
SELECT musextputils.create_musemetric('musextputils', 'debugErrorMessageDisplay', 'Determines whether the displayError function will show full error messages or simplified error messages suitable for end users.', false)
    WHERE musextputils.get_musemetric('musextputils', 'debugErrorMessageDisplay', null::boolean) IS NULL;

--
--  If true, we will report the root cause exception found (insofar as we can
--  infer it) rather than the exception at the top of the call stack.  Important
--  Note:  This function only works if the (now) standard exception payload
--  includes "thrownError" properties for any caught exceptions.  We navigate
--  down the trace looking for the last object that doesn't have a thrownError
--  property; the payload without a thrownError property should be the root
--  cause.  If you don't use this convention then this configuration should be
--  set to false.
--

SELECT musextputils.create_musemetric(  'musextputils'
                                       ,'rootCauseReportingEnabled'
                                       ,'If true, we will report the root cause exception found (insofar as we can infer it) rather than the exception at the top of the call stack.  Important Note:  This function only works if the (now) standard exception payload includes "thrownError" properties for any caught exceptions.  We navigate down the trace looking for the last object that doesn''t have a thrownError property; the payload without a thrownError property should be the root cause.  If you don''t use this convention then this configuration should be set to false.'
                                       ,false
                                    )
    WHERE musextputils.get_musemetric(  'musextputils'
                                       ,'rootCauseReportingEnabled'
                                       ,null::boolean) IS NULL;

