-- File:        jsonb_diff.sql
-- Location:    musextputils/database/functions
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
-- Compares two JSONB objects and returns any attributes from the Primary object that don't exist or have different values as compared to the secondary object.  Inspired by origtinal work from Christophe Pettus (http://thebuild.com/blog/2016/01/21/a-simple-json-difference-function/).
--

CREATE OR REPLACE FUNCTION musextputils.jsonb_diff(pPrimary jsonb, pSecondary jsonb)
    RETURNS jsonb AS
        $BODY$
            SELECT  jsonb_object_agg(pri.key, pri.value)
            FROM
                (SELECT key, value FROM jsonb_each(pPrimary)) pri
                LEFT OUTER JOIN (SELECT key, value FROM jsonb_each(pSecondary)) sec
                    ON pri.key = sec.key
                WHERE   pri.value != sec.value
                    OR  sec.key IS NULL;
        $BODY$
    LANGUAGE sql IMMUTABLE;

ALTER FUNCTION musextputils.jsonb_diff(pPrimary jsonb, pSecondary jsonb)
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.jsonb_diff(pPrimary jsonb, pSecondary jsonb) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.jsonb_diff(pPrimary jsonb, pSecondary jsonb) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.jsonb_diff(pPrimary jsonb, pSecondary jsonb) TO xtrole;


COMMENT ON FUNCTION musextputils.jsonb_diff(pPrimary jsonb, pSecondary jsonb)
    IS $DOC$Compares two JSONB objects and returns any attributes from the Primary object that don't exist or have different values as compared to the secondary object.  Inspired by origtinal work from Christophe Pettus (http://thebuild.com/blog/2016/01/21/a-simple-json-difference-function/).$DOC$;
