-- File:        log_exception.sql
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


CREATE OR REPLACE FUNCTION musextputils.log_exception(pExceptionName text, pExceptionDescription text, pExceptionMessage text, pFunctionName text, pPackageName text, pPayload jsonb)
	RETURNS bigint AS
		$BODY$
			DECLARE
				vReturnVal bigint;
			BEGIN

				-- We already are in an exception state, so minimal validation: we want to get what we can and not cause additional problems.
				INSERT INTO musextputils.exceptionlog (	 exceptionlog_name
														,exceptionlog_descrip
														,exceptionlog_message
														,exceptionlog_function_name
														,exceptionlog_package_name
														,exceptionlog_payload)
							VALUES 					  (
														 pExceptionName
														,pExceptionDescription
														,pExceptionMessage
														,pFunctionName
														,pPackageName
														,pPayload
													  )
							RETURNING exceptionlog_id INTO vReturnVal;

				RETURN vReturnVal;

			END;
		$BODY$
	LANGUAGE plpgsql;

ALTER FUNCTION musextputils.log_exception(pExceptionName text, pExceptionDescription text, pExceptionMessage text, pFunctionName text, pPackageName text, pPayload jsonb)
	OWNER TO admin;

REVOKE EXECUTE ON FUNCTION musextputils.log_exception(pExceptionName text, pExceptionDescription text, pExceptionMessage text, pFunctionName text, pPackageName text, pPayload jsonb) FROM public;
GRANT EXECUTE ON FUNCTION musextputils.log_exception(pExceptionName text, pExceptionDescription text, pExceptionMessage text, pFunctionName text, pPackageName text, pPayload jsonb) TO admin;
GRANT EXECUTE ON FUNCTION musextputils.log_exception(pExceptionName text, pExceptionDescription text, pExceptionMessage text, pFunctionName text, pPackageName text, pPayload jsonb) TO xtrole;

COMMENT ON FUNCTION musextputils.log_exception(pExceptionName text, pExceptionDescription text, pExceptionMessage text, pFunctionName text, pPackageName text, pPayload jsonb) IS 'A standard means by which to add exception log records.';