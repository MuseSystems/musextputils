-- File:        v_basic_catalog.sql
-- Location:    musextputils/database/views
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
--
--  Fully qualified view to get schema, table, column, and type.
--
--

CREATE OR REPLACE VIEW musextputils.v_basic_catalog  AS
    SELECT       pcpn.oid AS table_schema_oid
                ,pcpn.nspname AS table_schema_name
                ,pc.oid AS table_oid
                ,pc.relname AS table_name
                ,CASE
                    WHEN pc.relpersistence = 'p' THEN 'PERMANENT'
                    WHEN pc.relpersistence = 'u' THEN 'UNLOGGED'
                    WHEN pc.relpersistence = 't' THEN 'TEMPORARY'
                    ELSE 'UNKNOWN' END AS table_persistence
                ,CASE
                    WHEN pc.relkind = 'r' THEN 'TABLE'
                    WHEN pc.relkind = 'i' THEN 'INDEX'
                    WHEN pc.relkind = 'S' THEN 'SEQUENCE'
                    WHEN pc.relkind = 'v' THEN 'VIEW'
                    WHEN pc.relkind = 'm' THEN 'MATERIALIZED_VIEW'
                    WHEN pc.relkind = 'c' THEN 'COMPOSITE_TYPE'
                    WHEN pc.relkind = 't' THEN 'TOAST_TABLE'
                    WHEN pc.relkind = 'f' THEN 'FOREIGN_TABLE'
                    ELSE 'UNKNOWN' END AS table_kind
                ,pcpa.attname AS column_name
                ,ptpn.oid AS column_type_schema_oid
                ,ptpn.nspname AS column_type_schema
                ,papt.oid AS column_type_oid
                ,papt.typname AS column_type_name
                ,pcpa.attnum AS column_ordinal
                ,pcpa.attnotnull AS is_required
                ,pcad.adsrc AS default_value
    FROM        pg_class pc
        JOIN    pg_namespace pcpn ON pc.relnamespace = pcpn.oid
        JOIN    pg_attribute pcpa ON pc.oid = pcpa.attrelid
        JOIN    pg_type papt ON pcpa.atttypid = papt.oid
        JOIN    pg_namespace ptpn ON papt.typnamespace = ptpn.oid
        LEFT OUTER JOIN pg_catalog.pg_attrdef pcad
            ON pcpa.attrelid = pcad.adrelid
                AND pcpa.attnum = pcad.adnum
    WHERE NOT pcpa.attisdropped;

ALTER VIEW musextputils.v_basic_catalog OWNER TO admin;

REVOKE ALL ON TABLE musextputils.v_basic_catalog FROM public;
GRANT ALL ON TABLE musextputils.v_basic_catalog TO admin;
GRANT ALL ON TABLE musextputils.v_basic_catalog TO xtrole;

COMMENT ON VIEW musextputils.v_basic_catalog IS 'A convenience view of the system catalog which provides basic table information such as table schema, table name, column name, and column type inforamtion.';
