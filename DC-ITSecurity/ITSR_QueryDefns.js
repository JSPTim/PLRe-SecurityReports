//// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =========================================================================================================


// simple pattern ofthe sites queries


function get_wfNodesx(ct, variant) {
   // now lets get the workflow control data for this type of item

   var fields = ["FormName1", "FormVariant", "StageNo", "StageLevel", "ParentStage", "Stage", "Amber", "Red",
      "StageDescription", "StartRAG", "Stream", "PreReq1", "PreReq2", "PreReq3", "PreReq4"
   ];
   var order = ["StageNo"];

   var where = [
      ["Eq", "FormName1", "Text", ct]
   ];
   //  ["Eq", "FormVariant", "Text", variant]
   //];
   var qs = buildCSOMQuery2(fields, order, where, 50);
   return qs;
}


function get_wfConnectionsx(ct, variant) {
   // now lets get the workflow control data for this type of item
   //alert(variant)
   $fields = ["FormName1", "LinkID", "Title", "From", "From_x003a_StageNo", "To", "To_x003a_StageNo", "OwnerConstraint", "LogText",
      "OwnerOnly", "AllowedGroups", "ClearStream", "Alert", "Mandatory", "Hours", "ApplyValidation", "RequireStageNote", "ButtonColor", "direction"
   ];
   var order = ["LinkID"];
   var where = [
      ["Eq", "FormName1", "Text", ct]
      // ["Eq", "FormVariant", "Text", variant]
   ];
   var qs = buildCSOMQuery2($fields, order, where, 50);
   return qs;
}

function get_wfFieldControlsx(ct, variant) {
   // now lets get the workflow control data for this type of item
   var Fname = ct; //+ ":" + variant;
   var fields = ["FormName", "Title", "AltName", "TabNo", "TabName", "FieldNo", "FieldHelp", "wfStage25", "FieldNo", "LogChange", "wfStage1",
      "wfStage2", "wfStage3", "wfStage4", "wfStage5", "wfStage6", "wfStage7", "wfStage8", "wfStage9", "wfStage10", "wfStage11", "wfStage12", "wfStage13",
      "wfStage14", "wfStage15", "wfStage16", "wfStage17", "wfStage18", "wfStage19", "wfStage20", "Width"
   ];
   var order = ["TabNo", "FieldNo"];
   var where = [
      ["Eq", "FormName", "Text", Fname]
   ];
   var qs = buildCSOMQuery2(fields, order, where, 60);
   return qs;
}



function get_ITSReports() {
   // now lets get the workflow control data for this type of item
   var fields = ["ID", "_SystemUpdateDate", "_UserField1", "_UserField2", "_UserField3", "_wfFormType",
      "_wfStatusChangeDate", "AssignedTo1", "BusinessOwner",  "BusinessUnit",
      "BusinessParticipants", "BusinessUsers", "Created", "Description", "EmailAlert",
      "Modified", "NotificationTo", "Participants", "Priority", "RAGDate", "RAGStatus", "RefNo", "StageNote",
      "StageRAGStatus", "Title", "wfStage", "wfSubStage", "wfSubStage1", "wfSubStage2", "Created By",
      "Modified By", "_ISPack", "ITSRSystem", "ITSRSystemComponent", "ReportDepartment"
   ];
   var order = ["ID"];
   var where = [
      ["Eq", "_ISPack", "Boolean", 1]
   ];
   var qs = buildCSOMQuery2(fields, order, where, 200);
   return qs;
}




function get_ITSReport(id) {
   // now lets get the workflow control data for this type of item
   var fields = ["ID", "_SystemUpdateDate", "_UserField1", "_UserField2", "_UserField3", "_wfFormType",
      "_wfStatusChangeDate", "AssignedTo1", "BusinessOwner", "BusinessUnit",
      "BusinessParticipants", "BusinessUsers", "Created", "Description", "EmailAlert",
      "Modified", "NotificationTo", "Participants", "Priority", "RAGDate", "RAGStatus", "RefNo", "StageNote",
      "StageRAGStatus", "Title", "wfStage", "wfSubStage", "wfSubStage1", "wfSubStage2", "Created By",
      "Modified By", "_ISPack", "ITSRSystem", "ITSRSystemComponent", "ReportDepartment"
   ];
   var order = ["ID"];
   var where = [
      ["Eq", "ID", "Counter", id]
   ];
   var qs = buildCSOMQuery2(fields, order, where, 1);
   return qs;
}