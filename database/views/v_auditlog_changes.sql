/*************************************************************************
 *************************************************************************
 **
 ** File:         v_auditlog_changes.sql
 ** Project:      Muse Systems xTuple Utilties
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
-- Provides auditlog data focusing on changed data rather than complete records.
--

CREATE OR REPLACE VIEW musextputils.v_auditlog_changes AS
    SELECT   auditlog_id                
            ,auditlog_table_schema      
            ,auditlog_table             
            ,auditlog_record_id         
            ,auditlog_change_type       
            ,auditlog_txid              
            ,CASE
                WHEN auditlog_change_type = 'DELETE' THEN 
                    to_jsonb(
                        (SELECT array_agg(q) 
                         FROM jsonb_object_keys(auditlog_old_record) q)) 
                ELSE 
                    to_jsonb(
                        (SELECT array_agg(q) 
                         FROM jsonb_object_keys(musextputils.jsonb_diff(
                                                    auditlog_new_record, 
                                                    auditlog_old_record)) q))
             END AS auditlog_changed_fields        
            ,musextputils.jsonb_diff(auditlog_new_record, 
                auditlog_old_record) AS auditlog_new_values
            ,musextputils.jsonb_diff(auditlog_old_record, 
                auditlog_new_record) AS auditlog_old_values
            ,auditlog_is_active         
            ,auditlog_date_created      
            ,auditlog_role_created      
            ,auditlog_date_modified     
            ,auditlog_wallclock_modified
            ,auditlog_role_modified     
            ,auditlog_date_deactivated  
            ,auditlog_role_deactivated  
            ,auditlog_row_version_number
    FROM     musextputils.auditlog;

ALTER VIEW musextputils.v_auditlog_changes OWNER TO admin;

REVOKE ALL ON TABLE musextputils.v_auditlog_changes FROM public;
GRANT ALL ON TABLE musextputils.v_auditlog_changes TO admin;
GRANT ALL ON TABLE musextputils.v_auditlog_changes TO xtrole;

COMMENT ON VIEW musextputils.v_auditlog_changes 
    IS $DOC$Provides auditlog data focusing on changed data rather than complete records.$DOC$;
