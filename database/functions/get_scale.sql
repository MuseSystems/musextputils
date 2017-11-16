/*************************************************************************
 *************************************************************************
 **
 ** File:         get_scale.sql
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
