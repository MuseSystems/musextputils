/*************************************************************************
 *************************************************************************
 **
 ** File:         jsonb_diff.sql
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
