-- File:        create_metrics.sql
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

