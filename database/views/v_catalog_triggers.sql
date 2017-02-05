/*************************************************************************
 *************************************************************************
 **
 ** File:       v_catalog_triggers.sql
 ** Project:    Muse Systems xTuple Utilities
 ** Author:     Steven C. Buttgereit
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

CREATE OR REPLACE VIEW musextputils.v_catalog_triggers AS
    SELECT       pcns.nspname AS table_schema_name
                ,ptpc.relname AS table_name
                ,pt.tgname AS trigger_name
                ,ppns.nspname AS function_schema_name
                ,ptpp.proname AS function_name
    FROM        pg_trigger pt
        JOIN    pg_class ptpc ON pt.tgrelid = ptpc.oid
        JOIN    pg_namespace pcns ON ptpc.relnamespace = pcns.oid
        JOIN    pg_proc ptpp ON pt.tgfoid = ptpp.oid
        JOIN    pg_namespace ppns ON ptpp.pronamespace = ppns.oid;

ALTER VIEW musextputils.v_catalog_triggers OWNER TO admin;

REVOKE ALL ON TABLE musextputils.v_catalog_triggers FROM public;
GRANT ALL ON TABLE musextputils.v_catalog_triggers TO admin;
GRANT ALL ON TABLE musextputils.v_catalog_triggers TO xtrole;
COMMENT ON VIEW musextputils.v_catalog_triggers IS 'A view which simplifies the lookup of triggers that are defined on tables. The view reduces the complexity of dealing with the native catalog.';