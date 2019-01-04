-- File:        get_scale.sql
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
-- A function to more easily retrieve xTuple rounding based on user locale.  There's a stock function, but it's incomplete and looks like it may be for a specific usecase.
--

CREATE OR REPLACE FUNCTION musextputils.get_scale(pConfig text)
    RETURNS integer AS
        $BODY$
            SELECT
                    CASE
                        WHEN lower(pConfig) = 'curr' THEN
                            locale_curr_scale
                        WHEN lower(pConfig) = 'salesprice' THEN
                            locale_salesprice_scale
                        WHEN lower(pConfig) = 'purchprice' THEN
                            locale_purchprice_scale
                        WHEN lower(pConfig) = 'extprice' THEN
                            locale_extprice_scale
                        WHEN lower(pConfig) = 'cost' THEN
                            locale_cost_scale
                        WHEN lower(pConfig) = 'qty' THEN
                            locale_qty_scale
                        WHEN lower(pConfig) = 'qtyper' THEN
                            locale_qtyper_scale
                        WHEN lower(pConfig) = 'uomratio' THEN
                            locale_uomratio_scale
                        WHEN lower(pConfig) = 'percent' THEN
                            locale_percent_scale
                        WHEN lower(pConfig) = 'weight' THEN
                            locale_weight_scale
                        ELSE
                            locale_extprice_scale
                        END
            FROM     public.locale
            WHERE    locale_id=getUsrLocaleId();
        $BODY$
    LANGUAGE sql STABLE;

ALTER FUNCTION musextputils.get_scale(pConfig text)
    OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.get_scale(pConfig text) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.get_scale(pConfig text) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.get_scale(pConfig text) TO xtrole;


COMMENT ON FUNCTION musextputils.get_scale(pConfig text)
    IS $DOC$A function to more easily retrieve xTuple rounding based on user locale.  There's a stock function, but it's incomplete and looks like it may be for a specific usecase.$DOC$;
