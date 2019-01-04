-- File:        alter_default_schema_seq_privs.sql
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


ALTER DEFAULT PRIVILEGES
    FOR ROLE xtrole
    IN SCHEMA musextputils
    GRANT USAGE, SELECT ON SEQUENCES
    TO xtrole;

GRANT USAGE, SELECT
    ON ALL SEQUENCES IN SCHEMA musextputils
    TO xtrole;
