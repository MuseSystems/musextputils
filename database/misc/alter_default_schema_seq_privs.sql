/*************************************************************************
 *************************************************************************
 **
 ** File:         alter_default_schema_seq_privs.sql
 ** Project:      Muse Systems xTuple ERP Utilities
 ** Author:       Steven C. Buttgereit
 **
 ** (C) 2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 **
 ** License: MIT License. See LICENSE.md for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

ALTER DEFAULT PRIVILEGES
    FOR ROLE xtrole
    IN SCHEMA musextputils
    GRANT USAGE, SELECT ON SEQUENCES
    TO xtrole;

GRANT USAGE, SELECT
    ON ALL SEQUENCES IN SCHEMA musextputils
    TO xtrole;
