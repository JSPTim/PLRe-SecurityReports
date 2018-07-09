//// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =========================================================================================================



function set_historyTableParamaters() {
   return [
      { "field": "_wfAction", "name": "Action", "width": "35", "class": "featuredcell" },
      { "field": "Limit", "name": "Auth", "width": "8"  }, // the clever work on this column is done after we build the table
      { "field": "_wfUser", "name": "User / Date / Time", "width": "26", "class": "featuredcell" },
      { "field": "_wfStreamTime0", "name": "Days", "width": "14", "type": "number", "format": " 2" },
      { "field": "progress", "name": "% time", "width": "11" },
      { "field": "Icon", "name": "", "width": "3" },
      { "field": "Attachments", "name": "", "width": "3" }, 
      { "field": "_wfStageChange", "name": "New stage", "width": "0" },
      { "field": "_wfTime", "name": "", "width": "0", "type": "date", "format": "DD MMM YY (HH:mm)" },
      { "field": "_wfStreamStatus", "name": "Stage", "width": "0" },
      { "field": "_wfPrevStage", "name": "From", "width": "0" },
      { "field": "UserLogData", "name": "UserLog", "width": "0" }
   ];
}

function set_ListInfoTableParamaters() {
   return [
      { "field": "LNAME", "name": "List / Lib", "width": "35", "class": "featuredcell" },
      { "field": "LTYPE", "name": "Type", "width": "0"  }, // the clever work on this column is done after we build the table
      { "field": "LHIDDEN", "name": "hidden", "width": "0" },
      { "field": "LFOLDERS", "name": "Folder count", "width": "3"},
      { "field": "LITEMS", "name": "Item count", "width": "3" },
      { "field": "LUNIQUE", "name": "Unique", "width": "3" },
      { "field": "LVERSIONS", "name": "versions", "width": "0" }, 
      { "field": "LDRAFT", "name": "Draft", "width": "0" },
      { "field": "LCHECKOUT", "name": "CheckOut", "width": "0" },
      { "field": "LCT", "name": "Content Types", "width": "35" }
   ];
}
 



function set_ActiveITSRTableParamaters() {
   return [
      { "field": "ID", "name": "Id", "width": "1", "type": "editLink" },
      { "field": "Title", "name": "Title", "width": "15", "class": "featuredcell" },
      { "field": "_SystemUpdateDate", "name": "sysUpdate", "width": "0",  },
      { "field": "AssignedTo1", "name": "Author", "width": "5" },
      { "field": "BusinessUnit", "name": "BusinessUnit", "width": "5", "filter": "true"},
      { "field": "ITSRSystem", "name": "System", "width": "5", "filter": "true"},
      { "field": "ReportDepartment", "name": "Dept / team", "width": "5", "filter": "true" },
      { "field": "BusinessOwner", "name": "Approver", "width": "5", "filter": "true" },
      { "field": "RAGDate", "name": "target date", "width": "5", "type": "date", "format": "DD MMM YY" },
      { "field": "StageRAGStatus", "name": "Stage RAG", "width": "3" },
      { "field": "Progress", "name": "Progress", "width": "10" },
      { "field": "wfSubStage", "name": "Stage", "width": "8", "filter": "true"}
   ];
}

function set_CompletedITSRTableParamaters() {
   return [
      { "field": "ID", "name": "Id", "width": "1", "type": "editLink" },
      { "field": "Title", "name": "Title", "width": "15", "class": "featuredcell" },
      { "field": "_SystemUpdateDate", "name": "sysUpdate", "width": "0",  },
      { "field": "AssignedTo1", "name": "Author", "width": "5" },
      { "field": "BusinessUnit", "name": "BusinessUnit", "width": "5" },
      { "field": "ITSRSystem", "name": "System", "width": "5"},
      { "field": "ReportDepartment", "name": "Dept / team", "width": "5" },
      { "field": "BusinessOwner", "name": "Approver", "width": "5"},
      { "field": "RAGDate", "name": "target date", "width": "5", "type": "date", "format": "DD MMM YY" },
      { "field": "RAGStatus", "name": "RAG", "width": "3" },
      { "field": "wfSubStage", "name": "Stage", "width": "18" }
   ];
}

function set_SecurityDetailTableParamaters() {
   return [
      { "field": "kind", "name": "Kind", "width": "5", },
      { "field": "item", "name": "item", "width": "40", },
      { "field": "role", "name": "role", "width": "10",  },
      { "field": "via", "name": "via", "width": "5"},
      { "field": "type", "name": "type", "width": "5" },
      { "field": "user", "name": "user", "width": "10" }

   ];
}
