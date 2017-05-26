/*************************************************************************
 *************************************************************************
 **
 ** File:         get_xtuple_version.sql
 ** Project:      Muse Systems xTuple Utilities
 ** Author:       Steven C. Buttgereit
 **
 ** (C) 2016-2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 ** 
 ** License: MIT License. See LICENSE.md for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

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
