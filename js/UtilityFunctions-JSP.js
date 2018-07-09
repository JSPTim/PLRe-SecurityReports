
//// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =====================================================================================================================


function stringifyCSOMItem(Obj, delim) {
   //gets an object then sees if it has memebrs and returns a string some queries return simple object this will
   //unpack them into a string, ie a list of users or a multi choice of soem kind
   if (delim == null) {
      delim = "|";
   }
   var retStr = "";
   //  var isArray = Obj instanceof Array;
   for (var l = 0; l < Obj.length; l++) {
      if (l == 0) {
         // special case for the first item no delimiter
         //if(isArray){ retStr += Obj[l]; } else { 
         retStr += Obj[l].get_lookupValue();
         //       }
      } else {
         // everythign else starts with a delimiter
         // if(isArray){ retStr += (delim + Obj[l]); } else {
         retStr += (delim + Obj[l].get_lookupValue());
         //}
      }
   }
   return retStr;
}

function getParameterByName(name) {
   // use as var xxx = getParameterByName("content ype");
   name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
   var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
      results = regex.exec(location.search);
   return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function blendColorsRGB(c0, c1, p) {
   // it expects colours in the form (rgb(r,g,b))
   var rgb1 = c0.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/); // decmompose the first
   var R1 = parseInt(rgb1[1]),
      G1 = parseInt(rgb1[2]),
      B1 = parseInt(rgb1[3]);
   var rgb2 = c1.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/); // decmompose the second
   var R2 = parseInt(rgb2[1]),
      G2 = parseInt(rgb2[2]),
      B2 = parseInt(rgb2[3]);
   // use the pattern for each colour to find the diffenece between the colours, multiply it by the factor then add it to the original, this softens saturation
   return (
      "rgb(" +
        (Math.round((R2 - R1) * p) + R1) +
        "," +
        (Math.round((G2 - G1) * p) + G1) +
        "," +
        (Math.round((B2 - B1) * p) + B1) +
        ")"
   );
}

function getTextColRGB(c0) {
   var rgb1 = c0.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
   var luma = (parseInt(rgb1[1]) + parseInt(rgb1[2]) + parseInt(rgb1[2])) / 3;
   if (luma > 140) {
      return "#000000";
   } else {
      return "#ffffff";
   }
}

function firstNChar(htmlstr, num) {
   // chop a HTML or a string down to a given length (or the next space aftewr it)
   // cases [null] [short string], [no spaces at all] etc if null it returns ''
   if (htmlstr == null || htmlstr == "null" || htmlstr == "undefined") {
      return "";
   } else {
      var answer = String($("<div>" + htmlstr + "</div>").text()); // note always wrapt it in a bit of html else it will return null
      if (answer.length >= num) {
         var i = answer.indexOf(" ", num);
         if (i == -1) {
            answer = answer.substr(0, num) + "...";
         } else {
            answer = answer.substr(0, i) + "...";
         }
      }
      return answer;
   }
}

function firstNCharSafe(htmlstr, num) {
   // chop a HTML or a string down to a given length (or the next space aftewr it)
   // cases [null] [short string], [no spaces at all] etc if null it returns ''
   if (htmlstr == null || htmlstr == "null" || htmlstr == "undefined") {
      return "";
   } else {
      var answer = String($("<div>" + htmlstr + "</div>").text()); // note always wrapt it in a bit of html else it will return null
      answer = answer.replace(/[^\w.]/g, " ");
      if (answer.length >= num) {
         var i = answer.indexOf(" ", num);
         if (i == -1) {
            answer = answer.substr(0, num);
         } else {
            answer = answer.substr(0, i);
         }
      }
      return answer;
   }
}

function displayPopUp(url) {
   var options = SP.UI.$create_DialogOptions();
   options.url = url;
   options.title = " ";
   options.width = 800;
   //options.showClose = false;
   options.dialogReturnValueCallback = Function.createDelegate(null, null);
   SP.UI.ModalDialog.showModalDialog(options);
}

function displayPopUpOptions(url, title, width, height, buttons, closehandler) {
   
   ExecuteOrDelayUntilScriptLoaded(internalOpenDialog, "SP.JS");
   
   function internalOpenDialog(){
      var max1 = false;
      var max2 = false;
      var close = false;
      if (buttons == "max") {
         max1 = true;
         width = 1000;
      }
      if (buttons == "max?") {
         max2 = true;
      }
      if (buttons == "close") {
         close = true;
      }

      var options = SP.UI.$create_DialogOptions();
      options.url = url;
      options.title = title;
      options.width = width;
      options.height = height;
      options.showClose = close;
      options.allowMaximize = max2;
      options.showMaximized = max1;
      if (closehandler != null && closehandler != undefined){
         options.dialogReturnValueCallback = closehandler;
      }
      SP.UI.ModalDialog.showModalDialog(options);
   }

}

function closeDialogHandler(result, target) {
   if (result === SP.UI.DialogResult.OK) {
      // processing in here but its not much use on a new one and you only get the path anyway
      alert("Dialog closed");
   }
}

function getSites(subWeb, success, error) {
   // i can pass this a subsite to get ie a list not in the current context
   var ctx;
   if (subWeb == "") {
      ctx = SP.ClientContext.get_current();
   } else {
      ctx = new SP.ClientContext(subWeb);
   }
   var list = ctx.get_web().getSubwebsForCurrentUser();

   ctx.load(list);
   ctx.executeQueryAsync(function() {
      success(list);
   }, error);
}

function getLists(subWeb, success, error) {
   // i can pass this a subsite to get ie a list not in the current context
   var ctx;
   if (subWeb == "") {
      ctx = SP.ClientContext.get_current();
   } else {
      ctx = new SP.ClientContext(subWeb);
   }
   var list = ctx.get_web().get_lists();
   ctx.load(list);
   ctx.executeQueryAsync(function() {
      success(list);
   }, error);
}

// try not to use try to use the three below
function get_WorkflowLookups(ct) {
   // now lets get the workflow control data for this type of item
   $fields = ["FormName", "StageNo", "StageLevel", "ParentStage", "Stage", "Previous", "Next", "Amber", "Red", "StageDescription", "OwnerConstraint", "AllowedGroups", "StartRAG", "Stream", "StageType", "PreReq1", "PreReq2", "PreReq3", "PreReq4"];
   var order = ["StageNo"];
   var where = [
      ["Eq", "FormName", "Text", ct]
   ];
   var qs = buildCSOMQuery2($fields, order, where, 50);
   return qs;
}

function get_WorkflowNodes(ct) {
   // now lets get the workflow control data for this type of item
   $fields = ["FormName", "StageNo", "StageLevel", "ParentStage", "Stage", "Amber", "Red", "StageDescription", "StartRAG", "Stream",
      "PreReq1", "PreReq2", "PreReq3", "PreReq4"
   ];
   var order = ["StageNo"];
   var where = [
      ["Eq", "FormName", "Text", ct]
   ];
   var qs = buildCSOMQuery2($fields, order, where, 50);
   return qs;
}

function get_WorkflowConnections(ct) {
   // now lets get the workflow control data for this type of item
   $fields = ["FormName", "LinkID", "Title", "From", "From_x003a_StageNo", "To", "To_x003a_StageNo", "OwnerConstraint", "LogText",
      "AllowedGroups", "ClearStream", "Alert", "Mandatory", "Hours", "ApplyValidation", "RequireStageNote", "ButtonColor"
   ];
   var order = ["LinkID"];
   var where = [
      ["Eq", "FormName", "Text", ct]
   ];
   var qs = buildCSOMQuery2($fields, order, where, 50);
   return qs;
}

function get_wfNodes(ct, variant) {
   // now lets get the workflow control data for this type of item
   var Fname = ct + ":" + variant;
   $fields = ["FormName1", "StageNo", "StageLevel", "ParentStage", "Stage", "Amber", "Red", "StageDescription", "StartRAG", "Stream",
      "PreReq1", "PreReq2", "PreReq3", "PreReq4"
   ];
   var order = ["StageNo"];
   var where = [
      ["Eq", "FormName1", "Text", Fname]
   ];
   var qs = buildCSOMQuery2($fields, order, where, 50);
   return qs;
}

function get_wfConnections(ct, variant) {
   // now lets get the workflow control data for this type of item
   //alert(variant)
   $fields = ["FormName1", "LinkID", "Title", "From", "From_x003a_StageNo", "To", "To_x003a_StageNo", "OwnerConstraint", "LogText",
      "AllowedGroups", "ClearStream", "Alert", "Mandatory", "Hours", "ApplyValidation", "RequireStageNote", "ButtonColor"
   ];
   var order = ["LinkID"];
   var where = [
      ["Eq", "FormName1", "Text", ct],
      ["Eq", "FormVariant", "Text", variant]
   ];
   var qs = buildCSOMQuery2($fields, order, where, 50);
   return qs;
}

function get_WorkflowFieldControls(ct) {
   $fields = ["FormName", "Title", "AltName", "TabNo", "TabName", "FieldNo", "FieldHelp", "wfStage25", "FieldNo", "LogChange", "wfStage1", "wfStage2", "wfStage3", "wfStage4", "wfStage5", "wfStage6", "wfStage7", "wfStage8", "wfStage9", "wfStage10", "wfStage11", "wfStage12", "wfStage13", "wfStage14", "wfStage15", "wfStage16", "wfStage17", "wfStage18", "wfStage19", "wfStage20"];
   var order = ["TabNo", "FieldNo"];
   var where = [
      ["Eq", "FormName", "Text", ct]
   ];
   var qs = buildCSOMQuery2($fields, order, where, 60);
   return qs;
}

function getListItems(subWeb, listTitle, qstring, success, error) {
   // i can pass this a subsite to get ie a list not in the current context
   var ctx;
   if (subWeb == "") {
      ctx = SP.ClientContext.get_current();
   } else {
      ctx = new SP.ClientContext(subWeb);
   }
   var list = ctx.get_web().get_lists().getByTitle(listTitle);
   var Q = new SP.CamlQuery();
   Q.set_viewXml(qstring);
   var items = list.getItems(Q);
   ctx.load(items);

   //get the content types as well as the data
   //var $listCTs = list.get_contentTypes();
   //ctx.load($listCTs);
   ctx.executeQueryAsync(function() {
      success(items);
   }, error);
}

function getListItemsfromView(subWeb, listTitle, viewName, success, error) {
   // i can pass this a subsite to get ie a list not in the current context
   var ctx;
   if (subWeb == "") {
      ctx = SP.ClientContext.get_current();
   } else {
      ctx = new SP.ClientContext(subWeb);
   }
   var list = ctx.get_web().get_lists().getByTitle(listTitle);

   ctx.load(list);
   //ctx.ExecuteQuery();
   var thisView = list.get_views().GetByTitle(viewName);

   ctx.load(thisView);
   //ctx.ExecuteQuery();
   var CQuery = new CamlQuery();
   CQuery.set_viewXml(thisView.get_htmlSchemaXml());
   //alert(thisView.ViewQuery);

   var items = list.GetItems(CQuery);
   ctx.load(items);

   ctx.executeQueryAsync(function() {
      success(items);
   }, error);
}

function getAttachedFiles(listName, listItemId) {
   var attachmentFileUrls = [];
   $().SPServices({
      operation: "GetAttachmentCollection",
      async: false,
      listName: listName,
      ID: listItemId,
      completefunc: function (xData, Status) {
         $(xData.responseXML).find("Attachment").each(function () {
            var url = $(this).text();
            attachmentFileUrls.push(url);
         });
      }
   });
   return attachmentFileUrls;
}

function buildCSOMQuery(flds, ord, where, limit) {
   // just to allow us to deal more easily with the list of fields when we issue a query
   var qs = "<View Scope='Recursive'><Query><OrderBy>";
   for (var i = 0; i < ord.length; i++) {
      qs += "<FieldRef Name='" + ord[i] + "'/>";
   }
   qs += "</OrderBy>";
   // only add in the where clause iif it deserves to be here
   if (where.length > 0) {
      qs += "<Where>";
      if (where.length > 1) {
         qs += "<And>";
      }
      // where sample <Where><Eq><FieldRef Name='PLPActive'/><Value Type='Boolean'>1</Value></Eq></Where>
      for (var j = 0; j < where.length; j++) {
         qs +=
                "<Eq><FieldRef Name='" +
                where[j][0] +
                "'/><Value Type='" +
                where[j][1] +
                "'>" +
                where[j][2] +
                "</value></Eq>";
      }
      if (where.length > 1) {
         qs += "</And>";
      }
      qs += "</Where>";
   }
   // finally add in the view fields
   qs += "</Query><ViewFields>";
   for (var k = 0; k < flds.length; k++) {
      qs += "<FieldRef Name='" + flds[k] + "'/>";
   }
   qs += "</ViewFields><RowLimit>" + limit + "</RowLimit></View>";
   return qs;
}

function buildCSOMQuery2(flds, ord, where, limit) {
   // just to allow us to deal more easily with the list of fields when we issue a query
   var qs = "<View Scope='Recursive'><Query><OrderBy>";
   for (var i = 0; i < ord.length; i++) {
      qs += "<FieldRef Name='" + ord[i] + "'/>";
   }
   qs += "</OrderBy>";
   // only add in the where clause iif it deserves to be here
   if (where.length > 0) {
      qs += "<Where>";
      if (where.length > 1) {
         qs += "<And>";
      }
      // where sample <Where><Eq><FieldRef Name='PLPActive'/><Value Type='Boolean'>1</Value></Eq></Where>
      for (var j = 0; j < where.length; j++) {
         qs +=
                "<" + where[j][0] + "><FieldRef Name='" +
                where[j][1] +
                "'/><Value Type='" +
                where[j][2] +
                "'>" +
                where[j][3] +
                "</value></" + where[j][0] + ">";
      }
      if (where.length > 1) {
         qs += "</And>";
      }
      qs += "</Where>";
   }
   // finally add in the view fields
   qs += "</Query><ViewFields>";
   for (var k = 0; k < flds.length; k++) {
      qs += "<FieldRef Name='" + flds[k] + "'/>";
   }
   qs += "</ViewFields><RowLimit>" + limit + "</RowLimit></View>";
   return qs;
}

function get_CSOMQueryString(flds, ord, where, limit, recurse) {
   // just to allow us to deal more easily with the list of fields when we issue a query
   var qs = "<View ";
   if (recurse) { qs += "Scope='Recursive'"; }
   qs += "><Query><OrderBy>";
   for (var i = 0; i < ord.length; i++) {
      qs += "<FieldRef Name='" + ord[i] + "'/>";
   }
   qs += "</OrderBy>";
   // only add in the where clause iif it deserves to be here
   if (Array.isArray(where)) {
      if (where.length > 0) {
         qs += "<Where>";
         if (where.length > 1) {
            qs += "<And>";
         }
         // where sample <Where><Eq><FieldRef Name='PLPActive'/><Value Type='Boolean'>1</Value></Eq></Where>
         for (var j = 0; j < where.length; j++) {
            qs +=
                    "<" + where[j][0] + "><FieldRef Name='" +
                    where[j][1] +
                    "'/><Value Type='" +
                    where[j][2] +
                    "'>" +
                    where[j][3] +
                    "</value></" + where[j][0] + ">";
         }
         if (where.length > 1) {
            qs += "</And>";
         }
         qs += "</Where>";
      }
   } else {
      if (where.length > 0) {
         qs += where; // treat it as a well formed string so we can get arbitarilly complex clauses in there
      }
   }
   // finally add in the view fields
   qs += "</Query><ViewFields>";
   for (var k = 0; k < flds.length; k++) {
      qs += "<FieldRef Name='" + flds[k] + "'/>";
   }
   qs += "</ViewFields><RowLimit>" + limit + "</RowLimit></View>";
   return qs;
}

function buildDataRows($fields, data, rows) {
   var rw = [];
   rows = []; // kill the old data
   // im using a pattern of building an array of values from the query
   //this little bit does it of course it assumes that the $fields array is correct
   //alert("items -"+data.get_count());
   for (var i = 0; i < data.get_count(); i++) {
      ListItem = data.getItemAtIndex(i);
      rw = [];
      for (var j = 0; j < $fields.length; j++) {
         if (ListItem.get_fieldValues()[$fields[j]] == null) {
            // its a start but leets test for no value or null
            rw[$fields[j]] = "";
         } else {
            rw[$fields[j]] = ListItem.get_fieldValues()[$fields[j]];
         }
      }
      rows.push(rw);
   }
   return rows;
}

function buildDataRowsPlus($fields, data, rows) {
   // it attenpts to draw out the other data types so i have to so less specific stuff on the page
   // everythign is simpler, so people (1) is returned as a string, compound thigs are returned as | delimited strings
   // number as numbers, dates as moments  ALSO this code gets the content type if it can
   var rw = [];
   var thisVar;
   var ListItem;
   rows = []; // kill the old data
   // im using a pattern of building an array of values from the query
   //this little bit does it of course it assumes that the $fields array is correct

   for (var i = 0; i < data.get_count(); i++) {
      ListItem = data.getItemAtIndex(i);

      //foreach(ListItem in data) {
      rw = [];

      for (var j = 0; j < $fields.length; j++) {
         thisVar = ListItem.get_fieldValues()[$fields[j]];
         //if(i==0){ thisVar );}
         if (thisVar == null) {
            // its a start but leets test for no value or null
            rw[$fields[j]] = ""; // get the easy case out of the way
         } else {
            // so what else may it be?
            if (thisVar instanceof Date) { // so turn it into a moment
               rw[$fields[j]] = moment(thisVar); // we can use format when rendering now
            } else { // so the anticipation mounts
               if (thisVar instanceof Object) { // object the bloody catch all
                  try { // still may have a nasty or two
                     rw[$fields[j]] = thisVar.get_lookupValue(); // see if its not an aray just a sigle value then get it
                  } catch (err) {
                     rw[$fields[j]] = stingifyCSOMItem(thisVar); // so turn it into a string so i can print it easilly  or split it
                  }
               } else { // what a let down but its easy and safe
                  rw[$fields[j]] = thisVar; // Nothign to do it must be a primitive number of a string
               }
            }
         }
      }
      rows.push(rw);
   }
   return rows;
}

function buildDataRowsPlusFields(data) {
   //so an introspective function that builds an array from the data with the first row being the column names
   //saves on global variables
   var rw = [];
   var fields = [];
   var thisVar;
   var ListItem;
   var rows = []; // im goign to return this array
   // im using a pattern of building an array of values from the query
   //but Firstly lets examine the  item to get its field names

   for (var i = 0; i < data.get_count(); i++) {
      ListItem = data.getItemAtIndex(i);

      if (i == 0) { // first time through lets just do soem JSON fiddling andf get an array of fields
         rw = [];
         var intFieldList = JSON.stringify(ListItem.get_fieldValues());
         intFields = JSON.parse("[" + intFieldList + "]");
         fieldKeys = Object.keys(intFields[0]);
         fieldKeys.forEach(function(k) {
            fields.push(k); // build an array of field names
            rw[k] = k; // start the associative array of field names it will become the first row of data
         });
         rows.push(rw);
      }

      //foreach(ListItem in data) {
      rw = [];

      for (var j = 0; j < fields.length; j++) {
         thisVar = ListItem.get_fieldValues()[fields[j]];
         //if(i==0){ thisVar );}
         if (thisVar == null) {
            // its a start but lets test for no value or null
            rw[fields[j]] = ""; // get the easy case out of the way
         } else {
            // so what else may it be?
            if (thisVar instanceof Date) { // so turn it into a moment
               rw[fields[j]] = moment(thisVar); // we can use format when rendering now
            } else { // so the anticipation mounts
               if (thisVar instanceof Object) { // object the bloody catch all
                  try { // still may have a nasty or two
                     rw[fields[j]] = thisVar.get_lookupValue(); // see if its not an aray just a sigle value then get it
                  } catch (err) {
                     rw[fields[j]] = stringifyCSOMItem(thisVar); // so turn it into a string so i can print it easilly  or split it
                  }
               } else { // what a let down but its easy and safe
                  rw[fields[j]] = thisVar; // Nothign to do it must be a primitive number of a string
               }
            }
         }

      }
      rows.push(rw);
   }
   return rows;
}


function getRowNoforField(fName, fVal, r) {
   // i think this is a general purpose function for  finding a sub array when i know the value of a field
   // the developighn pattern is to get data into a 2d array, the inner of which is one data row, each field has a name
   // so loop through lookign at the names / value and return when you find it
   for (var i = 0; i < r.length; i++) {
      if (r[i][fName] == fVal) {
         return i;
      }
   }
   return -1; //nothing found
}

function BuildwfButtons(StageNo) {
   // so the wf array is $wf and the stage is the index into it firstly can
   // RELIES ON GLOBAL VARIABLES - SORRY
   //alert("stage:" + StageNo);
   var wfSaveHTML = "";
   var wfExitHTML = "";
   prevNextButtons = ["", ""]; // 2 dimennsional array with empty sub arays one for next one for prev
   // am i able to do anything at this stage? if so i can save and close
   // Possible Colours are : light-green, orange, blue, purple, yellow, grey, red, dark-blue, ash-grey

   wfExitHTML = "<div class='btn exit ash-grey right transparent'>Exit<i class='fa fa-times-circle fa-2x'></i><table><tr><td></td></tr></table></div>";
   wfSaveHTML = "<div class='btn save blue left transparent'><table><tr><td><i class='fa fa-plus-circle fa-2x savemessage'></i></td><td id='savemessage'>Save</td><td id='nextstages'></td></tr></table></div>";

   //returns an array of HTML blocks containing buttons (one per stream - think this is OK
   // has this row got any pre requisites if so then lets build a nice data structure
   var preRequisites = [];
   var preReqRow;
   var preReqName;


   // can we mark our own homework on this one ?

   if ($wf[StageNo].OwnerConstraint && $AssignedTo.indexOf($CurrentUserName) > -1) {
      prevNextButtons[0] = "<h3>This request is assigned to you.</h3>";
      prevNextButtons[1] = "<h3>Please ask someone else to progress it...</h3>";
   } else {
      // does this row have a security group constraint?
      if (groupTest($wf[StageNo].AllowedGroups, $UserGroups)) { // dotn forget the first row is used for column names
         //alert("stage =" + $wf[StageNo].Stage + " prev:" + $wf[StageNo].Previous);
         prevNextButtons = buildButtons($wf[StageNo].Previous, "left", prevNextButtons, preRequisites); // will also retunr an enpty string if need be
         //alert("stage =" + $wf[StageNo].Stage + " next:" + $wf[StageNo].Next);
         prevNextButtons = buildButtons($wf[StageNo].Next, "right", prevNextButtons, preRequisites); // make buttons this colour
      } else {
         prevNextButtons[0] = "<h3>You are not a member of the group(s)</h3>";
         prevNextButtons[1] = "<h3>" + $wf[StageNo].AllowedGroups + "</h3>";
      }
   }

   var wfBlockButtons = "<div class='buttoncontainer'>" +
        "<h4>Workflow Control</h4>" +
        "<div class='wfcontainer'>" +
        "<div class='prev'>" + prevNextButtons[0] + "</div>" +
        "<div class='next'>" + prevNextButtons[1] + "</div>" +
        "</div>" +
        "<div class='formcontainer'>" + wfExitHTML + wfSaveHTML + "</div>";
   return wfBlockButtons + "</div>";
}

function buildButtons(stageList, direction, prevNextButtons, preRequisites) {
   var before, after, block, buttonColor, bHTML, streamStage = [];
   if (stageList != "") {
      if (direction == "right") {
         before = "<i class='fa fa-arrow-circle-right fa-2x'></i>";
         block = 1;
         after = "";
      } else {
         after = "<i class='fa fa-arrow-circle-left fa-2x'></i>";
         block = 0;
         before = "";
      }
      var theseButtons = stageList.split("|");
      //alert("Alert these buttons:" + theseButtons);
      theseButtons.forEach(function(butt) {
         var possButtonRowNo = getRowNoforField("Stage", butt, $wf); // go look it up of its -1 then its a new record

         if (possButtonRowNo != -1) {
            var possButtonStream = $wf[possButtonRowNo].Stream;
            if (possButtonStream == 1) { streamStage = [possButtonRowNo, butt, 0]; }
            if (possButtonStream == 2) { streamStage = $wfSubStage1.split(","); }
            if (possButtonStream == 3) { streamStage = $wfSubStage2.split(","); }
            buttonColor = $colours[possButtonStream];
            //alert(direction + "stream [" + possButtonStream + "] " + "possButtonRowNo (" + possButtonRowNo + ") " + streamStage);
            if (possButtonStream == 1 || possButtonRowNo > streamStage[0]) { // if its the main flow  OR past the row of the current one
               bHTML = "<div class='btn " + $colours[possButtonStream - 1] + " transparent' data-stageno='" + possButtonRowNo + "' data-type='" + direction + "' data-text='" + butt + "' data-stream='" + possButtonStream + "'>" + before + "<span>" + butt + "</span>" + after + "</div>"; // build my button
            } else {
               // OK so do we draw the next stage for this stream
               var possButtonRowNo2 = getRowNoforField("Stage", streamStage[1], $wf); // go look it up of its -1 then its a new record
               var nextList = $wf[possButtonRowNo2].Next.split("|");
               if (groupTest($wf[possButtonRowNo2].AllowedGroups, $UserGroups)) {
                  // if this user has access to this workflow row then draw all of the next buttons
                  nextList.forEach(function(butt2) {
                     bHTML = "<div class='btn " + $colours[possButtonStream - 1] + " transparent' data-stageno='" + possButtonRowNo2 + "' data-type='" + direction + "' data-text='" + nextList + "' data-stream='" + possButtonStream + "'>" + before + "<span>" + butt2 + "</span>" + after + "</div>"; // build my button
                  });
               } else {
                  bHTML = "You can't progress further on stream:" + possButtonStream;
               }
            }
            //bHTML = "<div class='btn " + colour + " transparent' data-stageno='" + possButtonRowNo + "' data-type='" + direction + "' data-text='" + butt + "' data-stream='" + possButtonStream + "'>" + before + "<span>" + butt + "</span>" + after + "</div>"; // build my button
            prevNextButtons[block] += bHTML; // push it onto an array one per stream can come in any order
         } else { //alert("error finding " + butt + "Check _WorkflowLookups");
         }
      });
   }
   return prevNextButtons;
}

// ============================================================================================

function groupTest(allowedGroups, ugroups) {
   // if allowed groups is nothing then return true - if not then one of the groups must exist in the users' Groups
   var result = false;
   if (allowedGroups == undefined || allowedGroups == "") {
      result = true;
   } else {
      var g1 = allowedGroups.split("|"); // cant brealk out of a xxx.forEach() so it returned false  ;-(
      for (var i = 0; i < g1.length; i++) {
         if (ugroups.indexOf(g1[i]) > -1) {
            result = true;
            break;
         }
      }
   }
   return result;
}

function renameFieldsAndSortForm() {
   var helpIcon = "";
   $wfFields.forEach(function(wfld) {
      //alert(wfld.Title + " : " + wfld.AltName + " : " + wfld.FieldNo + "");
      var fieldDisplayName = wfld.Title;
      if (wfld.AltName > "" && wfld.AltName != "AltName") { // ignor the first row though i could jyst do a slice ont he array
         newName = CamelSpaces(wfld.AltName);
      } else {
         newName = CamelSpaces(wfld.Title);
      }
      // lets see if we have any help text if so we will make a little icon for it
      if (wfld.FieldHelp > "") { helpIcon = " <i data-fieldhelp='" + wfld.FieldHelp + "' class='fa fa-info-circle'></i>"; } else { helpIcon = ""; }

      var theRow = $("[Title='" + fieldDisplayName + "'], [Title='" + fieldDisplayName + " possible values']").closest("td.ms-formbody").parent();
      if (theRow.length == 0) {
         theRow = $(".ms-formlabel").filter(function(index) {
            return $(this).text().trim() == fieldDisplayName || $(this).text().trim() == fieldDisplayName + " *";
         }).parent();
      }
      theRow.attr({
         "data-tab": wfld.TabNo,
         "data-order": (wfld.TabNo * 100 + wfld.FieldNo)
      });
      theRow.addClass("formRow");
      theRow.find(".ms-accentText").closest("td").addClass("mandatory");
      var thisItem = theRow.find(".ms-formlabel :contains('" + wfld.Title + "')");
      $(thisItem).addClass("formtitles");
      $(thisItem).html(newName);
      $(thisItem).prepend(helpIcon); // replace . tidy up the the names
   });

   // /now do the sort
   var srows = $("table#sorttable > tbody > tr.formRow:visible");
   var tabCount = 0;
   srows.sort(function(a, b) {
      var A = $(a).data("order");
      var B = $(b).data("order");
      if (A < B) {
         return -1;
      }
      if (A > B) {
         return 1;
      }
      return 0;
   });

   $.each(srows, function(index, srow) {
      tabCount = Math.max(tabCount, $(srow).data("tab")); // whist we are at it lets see what the number of tabs is
      $("table#sorttable > tbody").append(srow);
   });

   // can we change its width?
   $("#onetIDListForm").width("100%");
   $("#onetIDListForm table").width("100%");
   $("#onetIDListForm .ms-formtable tr td.ms-formbody").width("600px !important");

}

function setUpCascade(leve1, level2, store) {
   level2.find("option").each(function() {
      store.push($(this).text() + "|" + $(this).val());
   });
   return true;
}

function manageCascade(level1Text, level2, store) {
   var level2Val = level2.val();
   level2.empty();
   $(level2).append(new Option("Please Select", "0"));
   store.forEach(function(opt, i) {
      if (opt.split("|")[0] == level1Text) {
         $(level2).append(new Option(opt.split("|")[1], opt.split("|")[2]));
         $(level2).val(level2Val.toString());
      }
   });
   return $(level2).find("option:selected").text();
}

function CamelSpaces(string) {
   string = string.replace(/([a-z])([A-Z])/g, "$1 $2");
   string = string.replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
   return string;
}

function logtoJSON(username, itemfields, wfactions) {
   // itemsfields is a 2 d array with the field name and its alternatibe  ie [[dayseffort][|and they added] ]
   // ps ths is valid Json [{"tim":"1","tom":"2"},{"tam":"3","jom":"4"}]
   var action;
   var tempdate;
   var logStr = "{\"_SaveTime\":\"" + moment().format("DD/MM/YYYY HH:mm:ss") + "\"";
   logStr += ", \"User\":\"" + username + "\"";
   //logStr += ', "_wfChangeDateTime":"' + (Lozzi.Fields.getval("_wfStatusChangeDate") + ' ' + getTimeParts("_wfStatusChangeDate")) + '"';
   if (wfactions == ",,") { action = "Save"; } else { action = "Progress"; }
   logStr += ", \"_wfActions\":\"" + action + "\"";
   var thisval = "";
   for (var i = 0; i < itemfields.length; i++) {
      thisval = Lozzi.Fields.getval(itemfields[i][0]);
      if (thisval == undefined || thisval == "") {
         //
      } else {
         // if we have an alternative name then use it
         if (itemfields[i][1] == "") {
            logStr += ", \"" + itemfields[i][0] + "\":\"" + thisval + "\"";
         } else {
            logStr += ", \"" + itemfields[i][1] + "\":\"" + thisval + "\"";
         }
      }
      thisval = "";
   }
   logStr += "},";
   return logStr;
}

function onQueryError(sender, args) {
   alert("request failed " + args.get_message() + "\n" + args.get_stackTrace() + "\n" + sender);
   alert("Refresh the page to try again");
}

function setRecordLock(List, ct, ID) {
   // CHECK IF A LOCK EXISTS
   var RVal = true;
   var lockQuery = "<Query><Where><And><Eq><FieldRef Name='FormName'/><Value Type='Text'>" + ct + "</Value></Eq>" +
        "<Eq><FieldRef Name='FormID'/><Value Type='Number'>" + ID + "</Value></Eq></And></Where></Query>";
   var LockView = "<ViewFields><FieldRef Name='ID'/><FieldRef Name='FormName'/><FieldRef Name='FormID'/><FieldRef Name='Author'/><FieldRef Name='Created'/></ViewFields>";

   $().SPServices({
      operation: "GetListItems",
      async: false,
      listName: List,
      CAMLViewFields: LockView,
      CAMLQuery: lockQuery,
      completefunc: function(xData, Status) {
         var ItemCount = $(xData.responseXML).SPFilterNode("rs:data").attr("ItemCount");
         if (parseInt(ItemCount, 10) > 0) {
            RVal = false;
            jQuery(xData.responseXML).SPFilterNode("z:row").each(function() {
               $LockDetails["Author"] = $(this).attr("ows_Author").split("#")[1];
               $LockDetails["Created"] = $(this).attr("ows_Created");
               $LockDetails["LockID"] = $(this).attr("ows_ID");
               $LockDetails["Min"] = moment.duration(moment().diff(moment($LockDetails["Created"]))).asMinutes();
            });

            if ($LockDetails["Min"] > 30 || $LockDetails["Author"] == $CurrentUserName) {
               // we wont hold the lock if its the same person or its old
               deleteLock(List, $LockDetails["LockID"]);
               RVal = true;
            } else {
               var clearMessage = "This record was locked by " + $LockDetails["Author"] + " - " + Number($LockDetails["Min"]).toPrecision(3) + "min ago.\n\n Do you want to remove their Lock?";
               var clearLock = confirm(clearMessage); //process the data
               if (clearLock) {
                  deleteLock(List, $LockDetails["LockID"]);
                  RVal = true;
               }
            }
         }
      }
   });
   if (RVal) {
      // SET A LOCK
      var newItemID = null;
      $().SPServices({
         operation: "UpdateListItems",
         listName: List,
         batchCmd: "New",
         async: false,
         valuepairs: [
            ["Title", $CurrentUserName],
            ["FormName", ct],
            ["FormID", ID]
         ],
         completefunc: function(xData, Status) {
            var newId = $(xData.responseXML).SPFilterNode("z:row").attr("ows_ID");
            $LockDetails["LockId"] = newId;
         }
      });
   }
   return RVal;
}

function deleteLock(list, LockID) {
   $().SPServices({
      operation: "UpdateListItems",
      async: false,
      listName: list,
      batchCmd: "Delete",
      ID: LockID,
      completefunc: function(xData, Status) {}
   });
   return true;
}

function JSPgetUserContext() {
   var spContext = new SP.ClientContext.get_current();
   var currentUser = spContext.get_web().get_currentUser();
   spContext.load(currentUser);
   spContext.load(currentUser.get_groups());
   return spContext;
}

function JSPGetUserGroups(currentUser) {
   $CurrentUserName = currentUser.get_title();
   if (currentUser.get_isSiteAdmin()) {
      $UserGroups.push("admin");
   }
   var groupEnum = currentUser.get_groups().getEnumerator();
   while (groupEnum.moveNext()) {
      var group = groupEnum.get_current();
      $UserGroups.push(group.get_title());
   }
   return true;
}

function JSPSetPeoplePicker(pickerTitle, People) {
   var PickerDiv = $("[id$=\"ClientPeoplePicker\"][title=\"" + pickerTitle + "\"]");
   var PickerEditor = PickerDiv.find("[title=\"" + pickerTitle + "\"]");
   var PickerInstance = SPClientPeoplePicker.SPClientPeoplePickerDict[PickerDiv[0].id];
   People.forEach(function(item) {
      PickerEditor.val(item);
      PickerInstance.AddUnresolvedUserFromEditor(true);
   });
}

function JSPClearPeoplePicker(pickerTitle) {
   var PickerDiv = $("[id$=\"ClientPeoplePicker\"][title=\"" + pickerTitle + "\"]");
   var ppobject = SPClientPeoplePicker.SPClientPeoplePickerDict[PickerDiv[0].id];
   var usersobject = ppobject.GetAllUserInfo();
   usersobject.forEach(function(index) {
      ppobject.DeleteProcessedUser(usersobject[index]);
   });
}

function buildHistoryCards(wfHistory) {
   var eventtime, action, Historyblock, st, stage, counter, progresstime, age;
   Historyblock = "<div class='historyblock'>";

   counter = wfHistory.length;
   for (var i = 0; i < wfHistory.length; i++) {

      //get the key fields for this card  its a bit fiddly as some of these have old data formats
      st = parseInt(wfHistory[i]["Stage"]);

      progresstime = wfHistory[i]["_wfStatusChangeDate"];
      savetime = wfHistory[i]["_SaveTime"];
      //alert(wfHistory[i]["_wfActions"]);
      var actionClass = "progress";
      if (wfHistory[i]["_wfActions"] == "Save") {
         actionClass = "save";
      }

      age = moment.duration(moment().diff(eventtime)).humanize();

      Historyblock += "<div class='historyitem " + actionClass + "'>";
      Historyblock += "<h3 class='Stage" + st + "'>" + wfHistory[i]["Stage"] + " - (" + (counter - i) + ")</h3>";
      Historyblock += "<table>";
      fieldKeys = Object.keys(wfHistory[i]);
      fieldKeys.forEach(function(k) {
         if (k.charAt(0) == "_") {
            // its a special field dont show it
         } else {
            if (wfHistory[i][k] > "-") {
               Historyblock += "<tr><td class='right'><b>" + k + "</b> </td><td> " + wfHistory[i][k] + "</td></tr>";
            }
         }
      });

      Historyblock += "<tr><td class='right'><b>Total Age </b></td><td> " + age + "</td></tr>";
      Historyblock += "<tr><td class='right'><b>wf Action </b></td><td> " + wfHistory[i]["_wfActions"] + "</td></tr>";
      Historyblock += "<tr><td class='right'><b>Last progression </b></td><td> " + progresstime + "</td></tr>";
      Historyblock += "<tr><td class='right'><b>last save </b></td><td> " + savetime + "</td></tr></table>";

      if (i < wfHistory.length - 1) {
         Historyblock += "</div> <div class='arrow'><i class='fa fa-arrow-circle-left fa-4x'></i></div>";
      } else {
         Historyblock += "</div>";
      }
   }
   Historyblock += "<div class='historyblock'>";
   return Historyblock;
}

jQuery.fn.sortBtns = function sortBtns(datafield) {
   $("> div", this[0]).sort(dec_sort).appendTo(this[0]);

   function dec_sort(a, b) { return ($(b).data(datafield)) < ($(a).data(datafield)) ? 1 : -1; }
};

function BuildwfButtonsByStream4(isNew) {
   var bigJar = [];
   var wfLinks = [];
   var direction = 0;
   var message = "";
   if (isNew) {
      message = "Because this is a new item you can only save or cancel at this time.";
   } else {
      // part 1 fill the button jar with all the buttons you can :-)
      $currentStageStatus.forEach(function(streamData, stream) { // this is an array of workflow values
         if (streamData.StageNo > 0) { // there is some progress on this stream its "" if no progress on stream
            wfLinks = filter_lookupValues($wfLinks, "From_x003a_StageNo", streamData.StageNo, true);
            wfLinks.forEach(function(link, stream) {
               //alert2("processing link " + link.Title + "\n from:" + link.From + "\n to:" + link.To + "\n direction:" + direction);
               if (groupTest(link.AllowedGroups, $UserGroups)) {
                  //alert2(link.ID + " constraint" + link.OwnerConstraint + " suser:" + streamData.User + " current u:" + $CurrentUserName);
                  if (!(link.OwnerConstraint) || streamData.User != $CurrentUserName) {
                     fromNode = parseInt(link.From_x003a_StageNo) || 0;
                     toNode = parseInt(link.To_x003a_StageNo) || 0;
                     bigJar.push([$wf[toNode].Stream, toNode, $wf[fromNode].Stream, fromNode]);
                  } else { message += ("There is an owner constraint in place for : " + $wf[i].Stage + "<br/>"); }
               } else { message += ("To move to '" + $wf[i].Stage + "' you need to be a member of : " + link.AllowedGroups + "<br/>"); }
            });
         }
      });
   }
   return "<h4 id='buttonwarning'>" + message + "</h4>" + getButtonHTML(bigJar);
}

function getPreReqStatus(No) {
   var result = true; //only send back the failed pre requisites but assume all is good wait to be proved wrong
   for (var p = 1; p <= 3; p++) { // as doris day would say "prereq, prereq repreq" three chances to get it wrong
      preReqName = "PreReq" + p;
      destrow = getRowNoforField("Stage", $wf[No][preReqName], $wf);
      if (destrow > 0) { // test if no progress or not enough progress on this stream have we reached the pre requisite?
         if ($currentStageStatus[p - 1].StageNo < destrow || $currentStageStatus[p - 1].StageNo == "") { result = false; } // not there yet on that stream
      } //so that was ok
   } // howabout the next stream?
   return result;
}

function getButtonHTML(buttonJar) {
   var direction, before, after, prevNextButtons = ["", ""];
   direction = "right";

   // empty the jar and gussie-up each one
   buttonJar.forEach(function(bData, j) {
      before = "";
      after = "";
      if (direction == "right") { before = "<i class='fa fa-arrow-circle-right fa-2x'></i>"; } else { after = "<i class='fa fa-arrow-circle-left fa-2x'></i>"; }
      var prStatus = getPreReqStatus(bData[1]); // tell me are the pre reqs for this button met? bung that fact into the mix
      prevNextButtons[1] += "<div class='btn " + $colours[bData[0]] + " transparent' data-stageno='" + bData[1] + "' data-type='right' data-sourcenode='" + bData[3] + "' data-text='" + $wf[bData[1]].Stage + "' data-stream='" + bData[0] + "' data-prereqstatus='" + prStatus + "' data-sourcestream='" + bData[2] + "' >" + before + "<span>" + $wf[bData[1]].Stage + "</span>" + after + "</div>"; // build my button
   });
   return "<div class='buttoncontainer'><div class='wfcontainer'>" +
        "<div class='prev'>" + prevNextButtons[0] + "</div><div class='next'>" + prevNextButtons[1] + "</div>" +
        "</div><div class='formcontainer'><div class='btn exit ash-grey right transparent'>Exit<i class='fa fa-times-circle fa-2x'></i><table><tr><td></td></tr></table></div>" +
        "<div class='btn save blue left transparent'><table><tr><td><i class='fa fa-plus-circle fa-2x savemessage'></i></td><td id='savemessage'>Save</td><td id='nextstages'></td></tr></table></div></div></div>";
}

function logHistoryEvent(List, ct, ID) {
   var streamTimes = get_WorkflowStreamTimes();
   var statusdata = "";
   var changedata = "";
   // so what changed?
   $newStageStatus.forEach(function(status, k) {
      statusdata += (status.Stage + "|"); // store the current status on all streams
      if (status.Stage != $currentStageStatus[k].Stage) {
         changedata += ("From:" + $currentStageStatus[k].Stage + " to:" + status.Stage + "|"); // poitn out what changed
      }
   });
   // prepare my data this involves building the COMMON FIELDS
   // find out what fields to log and if they have any alternative names
   var itemfields = [];
   for (var l = 0; l < $wfFields.length; l++) {
      if ($wfFields[l].LogChange) {
         itemfields.push([$wfFields[l]["Title"], $wfFields[l]["AltName"]]);
      }
   }

   var action, thisval, newItemID = null;
   if (changedata == "") { action = "Save"; } else { action = "Progress"; }

   var logJSON = "{\"_ID\":\"" + ID + "\",\"_FormType\":\"" + ct + "\""; // so if we just get this JSON we know what its for
   streamTimes.forEach(function(itm, i) {
      logJSON += ", \"_StreamTime" + i + "\":\"" + itm + "\"";
   });
   for (var i = 0; i < itemfields.length; i++) {
      thisval = Lozzi.Fields.getval(itemfields[i][0]);
      if (thisval != undefined && thisval > "") {
         if (itemfields[i][1] == "") { // if we have an alternative name then use it
            logJSON += ", \"" + itemfields[i][0] + "\":\"" + thisval + "\"";
         } else {
            logJSON += ", \"" + itemfields[i][1] + "\":\"" + thisval + "\"";
         }
      }
      thisval = "";
   }
   logJSON += "}";

   $().SPServices({
      operation: "UpdateListItems",
      listName: List,
      batchCmd: "New",
      async: false,
      valuepairs: [
         ["Title", (ID + "-" + $CurrentUserName)],
         ["_wfUser", $CurrentUserName],
         ["_wfTime", (moment().format("DD/MM/YYYY HH:mm:ss"))],
         ["_wfAction", action],
         ["_wfStageChange", changedata],
         ["_wfStreamStatus", statusdata],
         ["_wfStreamTime0", streamTimes[0]],
         ["_wfStreamTime1", streamTimes[1]],
         ["_wfStreamTime2", streamTimes[2]],
         ["_wfFormType", ct],
         ["_wfFormID", ID],
         ["UserLogData", logJSON]
      ],
      completefunc: function(xData, Status) {
         var newId = $(xData.responseXML).SPFilterNode("z:row").attr("ows_ID");
         newItemID = newId;
      }
   });
   return newItemID;
}

function get_WorkflowHistory(id) {
   $fields = ["Title", "_wfAction", "_wfStreamStatus", "_wfPrevStage", "_wfStageChange", "_wfFormType", "_wfFormID", "UserLogData",
      "_wfStreamTime0", "_wfStreamTime1", "_wfStreamTime2", "_wfUser", "_wfTime", "_wfLogComment", "Attachments"
   ];
   var order = ["_wfTime"];
   var where = [
      ["Eq", "_wfFormID", "Number", id]
   ];
   var qs = buildCSOMQuery2($fields, order, where, 200);
   return qs;
}

function get_AllWorkflowHistory() {
   $fields = ["Title", "_wfAction", "_wfStreamStatus", "_wfPrevStage", "_wfStageChange", "_wfFormType", "_wfFormID",
      "_wfStreamTime0", "_wfUser", "_wfTime", "_wfLogComment"
   ];
   var order = ["_wfTime"];
   var where = [["Gt", "_wfStageChange", "Text", ""]] ;
   var qs = buildCSOMQuery2($fields, order, where, 10000);
   return qs;
}

function buildCardsfromHistoryRecords() {
   // assumes the the $wfHistory data is created
   var s1, s2, s3, age, JSONBlock;
   var Historyblock = "<div class='historyblock'>";
   var fieldKeys;
   $wfHistory.shift(); // dump the forst row as it has names we dont need.

   $wfHistory.forEach(function(record, i) {
      var Statii = record._wfStreamStatus.split("|");
      s1 = parseInt(Statii[0]);
      Historyblock += ("<div class='historyitem " + record["_wfAction"] + "'>");

      Historyblock += ("<div class='stageheader stage" + s1 + "'>" + firstNChar(Statii[0], 33) + "</div>");

      if (Statii[1] != "") { // if stream 2 has no progress ignore it
         s2 = parseInt(Statii[1]) || "";
         Historyblock += ("<div class='stageheader stage" + s2 + "'>" + firstNChar(Statii[1], 33) + "</div>");
      }
      if (Statii[2] != "") { // if stream 2 has no progress ignore it
         s3 = parseInt(Statii[2]) || "";
         Historyblock += ("<div class='stageheader stage" + s3 + "'>" + firstNChar(Statii[2], 33) + "</div>");
      }


      Historyblock += "<table>";
      age = moment.duration(moment().diff(moment(record._wfTime, "DD/MM/YYYY HH:mm:ss"))).humanize();
      try { //read the user data as a JSON object
         try {
            JSONBlock = JSON.parse(String(record.UserLogData));
         } catch (err) {
            JSONBlock = JSON.parse("[" + String(record.UserLogData) + "]");
         }
         // now render the JSON data
         fieldKeys = Object.keys(JSONBlock[0]);
         fieldKeys.forEach(function(k) {
            if (k.charAt(0) == "_") {
               // its a special field dont show it in the card
            } else {
               if (JSONBlock[0][k] > "-") {
                  Historyblock += "<tr><td class='right'><b>" + k + "</b> </td><td class='left'> " + JSONBlock[0][k] + "</td></tr>";
               }
            }
         });
      } catch (err) {
         // silent fail on this record may add in a x forthe card at another time
      }

      Historyblock += ("<tr><td class='right'><b>Action </b></td><td class='left'> " + record["_wfAction"] + "</td></tr>");
      if (record["_wfAction"] != "Save") {
         Historyblock += ("<tr><td class='right'><b>Change(s) </b></td><td class='left'> " + record["_wfStageChange"] + "</td></tr>");
      }
      Historyblock += ("<tr><td class='right'><b>last save </b></td><td class='left'> " + record["_wfTime"] + "</td></tr>");
      Historyblock += ("<tr><td class='right'><b>time since </b></td><td class='left'> " + age + "</td></tr></table>");
      Historyblock += ("<div class='cardusername'>" + record._wfUser + "</div>");
      Historyblock += ("<div class='cardnumber'>" + i + "</div></div>");
      Historyblock += ("<div class='arrow'><i class='fa fa-arrow-circle-right fa-3x'></i></div>");
   });
   Historyblock += ("<div class='historyblock'>");
   return Historyblock;
}

function get_WorkflowStreamTimes() {
   // a function to be used in analysis of the data we have arary of old and new status by stream
   // this includes times and who for each stream so if the item has changed status then subtract the time
   // the ite is to return an array with a triplet of numbers, zero if no change on that strem and x hourts if there has been a change on that stream

   // $currentStageStatus  $newStageStatus[0]
   var hoursTime = [];
   var stageTime = 0;
   $newStageStatus.forEach(function(item, k) {
      if (item.StageNo != $currentStageStatus[k].StageNo) { // has there been a change in stream status?
         // get the time from the same stream or the from stream 0 if its a new entry onto this stream
         if ($currentStageStatus[k].time != "") {
            stageTime = moment.duration(moment(item.time, "DD/MM/YYYY HH:mm:ss").diff(moment($currentStageStatus[k].time, "DD/MM/YYYY HH:mm:ss"))).asHours();
         } else {
            stageTime = moment.duration(moment(item.time, "DD/MM/YYYY HH:mm:ss").diff(moment($currentStageStatus[0].time, "DD/MM/YYYY HH:mm:ss"))).asHours();
         }
         hoursTime[k] = stageTime;
      } else {
         hoursTime[k] = 0;
      }
   });
   return hoursTime;
}

function reverseString(str) {
   return (str === "") ? "" : reverseString(str.substr(1)) + str.charAt(0);
}

function numberToDP(N, fmt) {
   var decimalBit = "";
   var number = parseFloat(N) || 0;
   var prefix = fmt[0];
   if (N < 0){prefix = prefix + " -";}
   var places = parseInt(fmt[1]) || 0;
   var val = number.toFixed(places);
   var parts = val.split(".");
   if (places > 0) { decimalBit = "." + parts[1]; }
   return prefix + parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + decimalBit;
}

function safeName(st, ch) {
   // ch is the thing to replace the characters with
   return (st.replace(/[^\w.]/g, ch));
}

function safeNumber(st, type) {
   var temp = st.replace(/[^0-9.-]/g, "");
   if (type == "int") {
      return parseInt(temp) || 0;
   } else {
      return parseFloat(temp) || 0;
   }
}

function alert2(message) {
   if ($CurrentUserName == "northwaveVPNuser") {
      alert(message);
   }
}

function get_distinctValueCount(a, fld) {
   //loop through an array and return an array of the values plus the counts
   // the first entry is the field name and the total count
   var fldData = [];
   fldData.push([fld, a.length]); // name, count,
   var indx;
   a.forEach(function(row) {
      indx = -1;
      // its a 2 d array we are searchign so i need to loop through it i cant use the index of option
      fldData.forEach(function(itm, j) { if (itm[0] == row[fld]) { indx = j; } }); // dense but sees if the item is in the field array
      if (indx == -1) { fldData.push([row[fld], 1]); } else { fldData[indx][1]++; } // add a new one or increment
   });
   return fldData;
}

function filter_lookupValues(item, fld, val, eql) {
   // pass a set of objects (associative arays ) the field to look in and the value we are lookign for
   // also true or false on search its very simple
   var temp = [];
   if (eql) {
      item.forEach(function(r) { if (r[fld] == val) { temp.push(r); } });
   } else {
      item.forEach(function(r) { if (r[fld] != val) { temp.push(r); } });
   }
   return temp;
}

function stringChunk(st, len){
   //turn an string onto an array of shorter stings
   var textchunks = [];
   if (st.length > len){   
      var words = st.split(" ");
      var counter = 0; 
      var row=0;
      while (counter < words.length){
         textchunks.push("");
         while (textchunks[row].length <= len  && counter < words.length){
            textchunks[row] = textchunks[row] + " " + words[counter];
            counter ++;
         }
         textchunks[row] = textchunks[row].trim();
         row++;
      } 
   }else { 
      textchunks.push(st);
   } 
   return textchunks;
}