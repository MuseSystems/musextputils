/*************************************************************************
 *************************************************************************
 **
 ** File:         v_characteristic.sql
 ** Project:      Muse Systems xTuple ERP Utilities
 ** Author:       Steven C. Buttgereit
 **
 ** (C) 2017 Lima Buttgereit Holdings LLC d/b/a Muse Systems
 **
 ** Contact:
 ** muse.information@musesystems.com  :: https://muse.systems
 ** 
 ** License: MIT License. See LICENSE.TXT for complete licensing details.
 **
 *************************************************************************
 ************************************************************************/

--
-- Compacts characteristic assignments into JSONB unstructured documents.  The
-- division is by target type and target id.  The object generated for each
-- target type/id contains other objects keyed by the public.char natural key
-- and containing all other values of both char and charass.  Note that we
-- assume one instance of a characteristic per one target id.  Also note that
-- this view will not perform well unless a reasonably well restricted WHERE
-- clause is provided.
--

CREATE OR REPLACE VIEW musextputils.v_characteristic AS
    SELECT   ca.charass_target_type
            ,ca.charass_target_id
            ,jsonb_object_agg(tj.char_name,tj.data) AS json_data
    FROM     public.charass ca
        JOIN    (SELECT      charass_id
                            ,char_name
                            ,jsonb_build_object('char_id',char_id
                                                ,'char_items',char_items
                                                ,'char_options',char_options
                                                ,'char_attributes',char_attributes
                                                ,'char_lotserial',char_lotserial
                                                ,'char_notes',char_notes
                                                ,'char_customers',char_customers
                                                ,'char_crmaccounts',char_crmaccounts
                                                ,'char_addresses',char_addresses
                                                ,'char_contacts',char_contacts
                                                ,'char_opportunity',char_opportunity
                                                ,'char_employees',char_employees
                                                ,'char_mask',char_mask
                                                ,'char_validator',char_validator
                                                ,'char_incidents',char_incidents
                                                ,'char_type',char_type
                                                ,'char_order',char_order
                                                ,'char_search',char_search
                                                ,'char_quotes',char_quotes
                                                ,'char_salesorders',char_salesorders
                                                ,'char_invoices',char_invoices
                                                ,'char_vendors',char_vendors
                                                ,'char_purchaseorders',char_purchaseorders
                                                ,'char_vouchers',char_vouchers
                                                ,'char_projects',char_projects
                                                ,'char_tasks',char_tasks
                                                ,'charass_id',charass_id
                                                ,'charass_value',charass_value
                                                ,'charass_default',charass_default
                                                ,'charass_price',charass_price) AS data
                 FROM       public.charass
                    JOIN    public.char
                        ON  charass_char_id = char_id) tj
            ON ca.charass_id = tj.charass_id
    GROUP BY ca.charass_target_type, ca.charass_target_id;

ALTER VIEW musextputils.v_characteristic OWNER TO admin;

REVOKE ALL ON TABLE musextputils.v_characteristic FROM public;
GRANT ALL ON TABLE musextputils.v_characteristic TO admin;
GRANT ALL ON TABLE musextputils.v_characteristic TO xtrole;

COMMENT ON VIEW musextputils.v_characteristic 
    IS $DOC$Compacts characteristic assignments into JSONB unstructured documents.  The division is by target type and target id.  The object generated for each target type/id contains other objects keyed by the public.char natural key and containing all other values of both char and charass.  Note that we assume one instance of a characteristic per one target id.  Also note that this view will not perform well unless a reasonably well restricted WHERE clause is provided. $DOC$;

COMMENT ON COLUMN musextputils.v_characteristic.charass_target_type
    IS 
    $DOC$The type of record the characteristic is assoiated with (i.e 'LS' for Lot/Serial, 'INCDT' for incidents).$DOC$;

COMMENT ON COLUMN musextputils.v_characteristic.charass_target_id
    IS 
    $DOC$The primary key of the specific record of the target type being described.$DOC$;

COMMENT ON COLUMN musextputils.v_characteristic.json_data
    IS 
    $DOC$A JSON object containing sub-objects for each characteristic that has been assigned to the target type/id record.  Note that the top level JSON attributes are the public.char.char_name (natural key) values of the assigned characteristics.  All data about the characteristic and the assigned values are contained within the appropriate sub-object.$DOC$;
