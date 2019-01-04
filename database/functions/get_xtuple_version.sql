-- File:        get_xtuple_version.sql
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
-- A function which returns the xTuple ERP version number in an easy to evaluate
-- format.
--

CREATE OR REPLACE FUNCTION musextputils.get_xtuple_version()
    RETURNS TABLE(   major_version integer
                    ,minor_version integer
                    ,patch_version integer) AS
        $BODY$

                SELECT
                     (SELECT substring(fetchMetricText('ServerVersion'),E'^([[:digit:]]+)\..*'))::integer as major_version
                    ,(SELECT substring(fetchMetricText('ServerVersion'),E'^[[:digit:]]+\.([[:digit:]]+)\..*$'))::integer as minor_version
                    ,(SELECT substring(fetchMetricText('ServerVersion'),E'^[[:digit:]]+\.[[:digit:]]+\.([[:digit:]]+)'))::integer as patch_version;

        $BODY$
    LANGUAGE sql STABLE;

ALTER FUNCTION musextputils.get_xtuple_version()
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.get_xtuple_version() FROM public;
GRANT EXECUTE ON FUNCTION musextputils.get_xtuple_version() TO admin;
GRANT EXECUTE ON FUNCTION musextputils.get_xtuple_version() TO xtrole;


COMMENT ON FUNCTION musextputils.get_xtuple_version()
    IS $DOC$A function which returns the xTuple ERP version number in an easy to evaluate format.$DOC$;
