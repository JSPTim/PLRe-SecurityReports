// =====================================================================================================================
// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =====================================================================================================================



function get_distinctValues(a, fld) {
   //loop through an array and return an array of the values plus the counts
   // the first entry is the field name and the total count
   var fldData = [];
   var indx;
   a.forEach(function(row) {
      // its a 2 d array we are searchign so i need to loop through it i cant use the index of option
      if(fldData.indexOf(row[fld]) == -1){fldData.push(row[fld]);} 
   });
   return fldData.sort();
}
  

function print_filter(filter) {
   var f=eval(filter);
   if (typeof(f.length) != "undefined") {}else{}
   if (typeof(f.top) != "undefined") {f=f.top(Infinity);}else{}
   if (typeof(f.dimension) != "undefined") {f=f.dimension(function(d) { return "";}).top(Infinity);}else{}
   console.log(filter+"("+f.length+") = "+JSON.stringify(f).replace("[","[\n\t").replace(/}\,/g,"},\n\t").replace("]","\n]"));
}
  

 
function barChart_Column(table, sourceCol, labelCol, destCol){
   // needs a UI table as it has a known structure and names uses the value of one col as a label
   //ill a column with a simple bar chart
   var thisVal, thisLabel, thisWidth;
   var sumVal = 0;
   $(table + " table tbody tr td[data-source='"+sourceCol+"']").each(function(){
      sumVal += (parseFloat($(this).data("value")) || 0);
   });
   sumVal = Math.max(sumVal, 1);
 
   $(table + " table tbody tr").each(function(){
      thisVal = parseFloat($(this).find("td[data-source='"+sourceCol+"']").data("value")) || 0;
      thisLabel = $(this).find("td[data-source='"+labelCol+"']").text();
      thisWidth = (parseInt(thisVal / sumVal * 95)); // set a width as a %
 
      // what is it called and lets knock up soem HTML for it 
      $(this).find("td[data-source='"+destCol+"']").html("<div class='timebaritem Stage" + (parseFloat(thisLabel) | 0) * 10 +
             "' style='width:" + thisWidth + "%;' title='" + thisLabel + " (" + parseInt(thisVal / sumVal * 100) + "%)'></div>");
   });
}
 

function populateHistoryTab(historyData, tabBar, panelName, tableLayout) {
   var thisVal, thisDays, thisWidth, actionstate, baricons = "";
   tabBar = "#" + tabBar;
   $(tabBar).after("<div id='" + panelName + "container' data-tab='" + panelName + "'><div id='" + panelName + "'></div></div>");
   panelName = "#" + panelName;
   Build_UITable(historyData, tableLayout, panelName, "ID", -1); // build the raw table  sorted by ID desc
   var sumVal = adjust_numbers(panelName, "_wfStreamTime0", " 1", 1 / 24, true, "", true); // convert it to days from hours
   var InfoCount = Iconify_Column(panelName, "_wfLogComment", "<i class='fas fa-info fa-fw fa-lg'></i>");
   var AttachmentCount = Iconify_Column(panelName, "Attachments", "<i class='fas fa-paperclip fa-fw fa-lg'></i>");
   sumVal = Math.max(sumVal, 1) * 24 ; // so its at least 1 day in duration  (in hours)
   // draw a progress bar Use the stage progress ie hidden fields Only draw progressions
   $(panelName + " tbody tr").each(function () {
      // so hide the limit on the ones that are not approvals etc
      actionstate = $(this).find("td[data-source='_wfAction']").text();
      if (actionstate.indexOf("Authorised") == -1 && actionstate.indexOf("Endorsed") == -1) {
         $(this).find("td[data-source='Limit']").text("");
      }
   });
 
   // so what is happenign with the ICONS? 
   if (InfoCount > 0) {
      baricons += ("<i  title='" + InfoCount + " user note(s)'class='fas fa-info fa-fw iBlue'></i>");
   }
   if (AttachmentCount > 0) {
      baricons += ("<i  title='" + AttachmentCount + " attachment(s)'class='fas fa-paperclip fa-fw iRed'></i>");
   }
   $(tabBar).find("#indicatoricons").html(baricons);
}
 
function adjustButtonCollection(Stage, people) {
   // the OCR specific logic
   // will show buttons of the user is in the list . 
   if (Stage == "4.0 CAB Approval"){
      if (people.indexOf($CurrentUserName) == -1){
         $(".wfcontainer").hide();
         $("#buttonwarning").html("You are not in the CAB list or have already responsed to this item...");
      }
   }
}
 

 
function logActionFromForm(List, ct, ID, fromStage, toStage, note, logmsg, lastupdate) {
   // this is a version of the log function can be called from a live form  so we have 
   // ($wfFields, $wfLinks, $CurrentUserName and all the lozzi stuff)
 
   var streamtime, statusdata = "";
   var action, newItemID = null;
   var logJSON = [];
   var logData = {};
 
   if (toStage === undefined || toStage == "") { 
      streamtime = 0;
      logmsg = "<i class=\"far fa-save fa-fw fa-2x iBlue\"></i> Saved";
   } else {
      streamtime =  moment.duration(moment().diff(moment((lastupdate), "DD/MM/YYYY HH:mm:ss"))).asHours();
   }
   action = logmsg.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#039;").replace(/"/g, "&quot;");
   //action="action";
   // prepare my data this involves buildign the COMMON FIELDS find out what fields to log and if they have any alternative names
   var itemfields = [];
   for (var l = 1; l < $wfFields.length; l++) {
      if ($wfFields[l].LogChange) {
         itemfields.push([$wfFields[l]["Title"], $wfFields[l]["AltName"]]);
      }
   }
 
   logData["_ID"] = ID;
   logData["_FormType"] = ct;
   // this is fiddly but its an array of objects and i think it stringifies ok
 
   for (var i = 0; i < itemfields.length; i++) {
      thisval = Lozzi.Fields.getval(itemfields[i][0]);
      if (thisval != undefined && thisval > "") {
         if (itemfields[i][1] == "") {
            // if we have an alternative name then use it
            logData[itemfields[i][0]] = thisval;
         } else {
            logData[itemfields[i][1]] = thisval;
         }
      }
      thisval = "";
   }
 
   logJSON.push(logData);
 
   $().SPServices({
      operation: "UpdateListItems",
      listName: List,
      batchCmd: "New",
      async: false,
      valuepairs: [
         ["Title", ID + "-" + $CurrentUserName],
         ["_wfUser", $CurrentUserName], 
         ["_wfTime", moment().toISOString()],
         ["_wfAction", action],
         ["_wfStageChange", toStage],
         ["_wfStreamStatus", (fromStage + "||")],
         ["_wfPrevStage", fromStage ],
         ["_wfStreamTime0",streamtime],
         ["_wfStreamTime1", 0],
         ["_wfStreamTime2", 0],
         ["_wfFormType", ct],
         ["_wfFormID", ID],
         ["_wfLogComment", firstNCharSafe(note, 255)],
         ["UserLogData", JSON.stringify(logJSON)]
      ],
      completefunc: function (xData) {
         var newId = $(xData.responseXML)
            .SPFilterNode("z:row")
            .attr("ows_ID");
         newItemID = newId;
      }
   });
   return newItemID;
}
 
function buildDataRowsPlusFields_OCR(data) {
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
               if (thisVar instanceof Array) {
                  rw[fields[j]] = thisVar.join("|");
               } else { 
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
  
      }
      rows.push(rw);
   }
   return rows;
}

function renameFieldsTabAndSortForm(wfStage) {
   // maybe we can use th generic one if needed
   // var tabHTML =  "<div id = 'tabBlock@N'><h5 id = 'tabHeader@N' data-tabno='@N'></h5><div class='tabPanel' id = 'tabPanel@N' data-tabno='@N'><table id = tabTable@N><tbody><tr></tr></tbody></table></div></div>";
   $("#onetIDListForm").attr("width", "100%");
   $("#sorttable").css("margin-top", "0px");
   $("td.ms-formlabel").attr("width", "20%");
   $("td.ms-formbody").attr("width", "80%");
 
   var thisStage = "wfStage" + wfStage; // so we have some columns called stage 1 to 24 we need a string to reference them so here goes
   for (var j = 2; j < $wfFields.length; j++) {
      // tootle down the array of fields (one ROW per field one COLUMN per stage)
      switch ($wfFields[j][thisStage]) { // should we hide it?
      case "x":
         Lozzi.Fields.hide($wfFields[j].Title);
         break;
      case "r":
         Lozzi.Fields.disable($wfFields[j].Title);
         break;
      }
   }
 
   var newName, existingHelp, helpIcon = "";
   $wfFields.forEach(function (wfld) {
      var fieldDisplayName = wfld.Title;
 
      if (wfld.AltName > "" && wfld.AltName != "AltName") {
         // ignor the first row though i could jyst do a slice ont he array
         newName = CamelSpaces(wfld.AltName);
      } else {
         newName = CamelSpaces(wfld.Title);
      }
 
      // so why does this not have a comment !! now im goign to have to figure it out month later
      // i think its finds the form item with the title we want , then dinfs the td its in (form body) then finds the row ! 
      var theRow = $("[Title='" + fieldDisplayName + "'], [Title='" + fieldDisplayName + " possible values']").closest("td.ms-formbody").parent();
      if (theRow.length == 0) { // so if that didnt find what we need lets try one more thing 
         theRow = $(".ms-formlabel").filter(function () {
            return ($(this).text().trim() == fieldDisplayName || $(this).text().trim() == fieldDisplayName + " *");
         }).parent();
      }
      theRow.attr({
         "data-tab": wfld.TabNo,
         "data-order": wfld.TabNo * 100 + wfld.FieldNo,
         "data-fieldno": wfld.FieldNo,
         "data-mode": wfld[thisStage]
      });
      theRow.addClass("formRow");
 
      theRow.find(".ms-accentText").closest("td").addClass("mandatory");
      if (wfld[wfStage] == "m" || wfld[wfStage] == "M") {
         theRow.addClass("mandatory");
      }
      // ALL NEW FEATURE DEFINABLE WIDTHS !!! i know its a kludge but here goes furst lets limit it to text areas 
      // we have the row so find the text area - so far not too field type sensitive im going for text areas, inputs #
      // so PEOPLW PICKERS ! complex nasty things lets test for them 
      var thisItem;
      if(wfld.Width > 0){
         thisItem = $(theRow).find("div.sp-peoplepicker-topLevel");
         if(thisItem.length > 0){  // it was a people picker we found so set its container to the width 
            $(thisItem).width(wfld.Width); 
         } else  {
            $(theRow).find("textarea, input").width(wfld.Width); // try to find the more mundane things and do them
         }
      }
 
      thisItem = theRow.find(".ms-formlabel :contains('" + wfld.Title + "')");
      $(thisItem).addClass("formtitles");
      $(thisItem).html(newName);
 
 
      // lets see if we have any help text if so we will make a little icon for it
      // but we can do it in the row as there may be an existign comment the hand entered help takes priority
      existingHelp = "";
      existingHelp = $(theRow).find("span.ms-metadata").text();
      $(theRow).find("span.ms-metadata").hide();
      if (wfld.FieldHelp > "" || existingHelp > "") {
         if(wfld.FieldHelp > ""){ existingHelp = wfld.FieldHelp;}
         helpIcon =" <i data-fieldhelp='" + existingHelp +"' class='fa fa-info-circle iBlue'></i>";
      } else {
         // i suppose we can also add in any inbuilt field commnets too  these sit in a span in the second column
         helpIcon = "";
      }
 
 
 
      $(thisItem).prepend(helpIcon); // replace . tidy up the the names
   });
 
   // /now do the sort
   var srows = $("table#sorttable > tbody > tr.formRow");
   srows.sort(function (a, b) {
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
 
   $.each(srows, function (index, srow) {
      $("table#sorttable > tbody").append(srow);
   });
 
   // now insert soem tabs 
   var tabs = [],
      tabText, fieldNo, workingtab = -1;
   $("#sorttable tbody tr.formRow").each(function () {
      fieldNo = $(this).data("fieldno"); // get the field in the row coz we are goign to find out what tab it uses 
      if ($(this).data("tab") != workingtab) {
         workingtab = $(this).data("tab");
         if (workingtab < 9) { // only do this when we are going to be usign the tab 
            // because the fieldID name is not the index indeed the field numbers can be duplicated or even decimal so go find the first one
            tabText = $wfFields[getRowNoforField("FieldNo", fieldNo, $wfFields)].TabName;
            $(this).before("<tr class='formtab' id='formtab" + workingtab + "' data-tab='" + workingtab + "'><td><div>" + tabText + "</div><div class = 'indicatoricons'></div></td></tr>");
            tabs.push(workingtab);
            // try to wrap in a div !!!! ILLEGAL HTML WE WILL SEE !!!!
         }
      }
      if (workingtab == 9) {
         $(this).hide();
      } else {
         //so how about movign shit onto the same line? this happens whrn the field nuber is a decimal  not an integer ? 
         // if i'd known how fiddly i never would have bothered - how hard can it be :=)
         if (fieldNo % 1 != 0) { //if the field number is not an integer? 
            // ooh we are going to rip this to pieces :-) but we will also hide the row to cover up the mess :-) 
            var destfieldrow = Math.floor(fieldNo); // firstly get the row number of the field we are goind to add stuff too ) spoiler - its the integer version of thios one
            var recipientrow = $("#sorttable tbody tr.formRow[data-fieldno='" + destfieldrow + "']"); // get the row
            $(recipientrow).find("br").remove(); // who knows why MS put a BR in there its not needed as its all in a table anyway // ah it for the comment isnt it
            // now get the bits we are goign to move 
            var fieldTitle = $(this).find(".formtitles").text(); // the title 
            var control = $(this).find("td.ms-formbody span")
               .first().addClass("formcellfield")
               .detach(); // the good stuff
            // is this dependant on the field type :-() i thoink date firlds are not so cool as they are a horrid stucture  and person pickers are divs
            // at the moment we just need to get them to all vertical align in a line so over to the css
            $(recipientrow).find("span").first()
               .addClass("formcellfield")
               .after(control)
               .after("<span class='formcellfield celltitle'> " + fieldTitle + " </span>"); // they stack in in revere order
            // need to think aboout when the item is lozzi fields read only 
            $(this).remove(); // we stole the text and removed the control so dump this husk of a row - i dont want it to come back or mess up my page 
         } else {
            //the field number is an integer so if its a text thing make it wide 
         }
      }
   });
 
   // so lets add in the file imput box after the stage note as this is fairly standard behaviour for our framework 
 
      
   // how about clearifn th autofill fron the forms inputs 
   tabs.forEach(function (tab) {
      var tabRows = $("#sorttable tbody tr.formRow[data-tab='" + tab + "']");
      $(tabRows).wrapAll("<tr></tr>");
      $(tabRows).wrapAll("<td colspan=2></td>");
      $(tabRows).wrapAll("<div class='collapsible' id='tabpanel" + tab + "' data-tab='" + tab + "'></div>");
      $(tabRows).wrapAll("<table width='100%'></table>");
   });
 
   // JEBUS ! you think id bve bored of this already but one more go -  are there any collabsibles that have NO visibe content? if so lets hide the parent tab row
   // not sure if this can be in the loop above as i hate looping when i dotn need to (not that you woudl guess) but for simplicity ill do it on its own
   $("#sorttable tbody tr.formtab").each(function () {
      if($(this).next("tr").find(".collapsible tr:visible").length == 0 ) { // if the row after the tab contains nothing visible dont show it at all 
         $(this).hide();
      }
   });
 
   $("#formtable tbody input").attr("autocomplete", "off");
   //finally add i he history tab after the sorttable DH_NOT_SUITABLE_GENERATOR // what is that comment 
}
 
function filter_dropdown(dropdown, masterlist, valuename, value, displayfields) {
   // we have one of my data arrays, it has an ID and soem field names we want to filter on it and use wghats left in the dropdown.
   var thisrow, UsedItems = "";
   var OkChoices = filter_lookupValues(masterlist, valuename, value, true);
 
   var thisval = $(dropdown).val(); // store this value for later on
   $(dropdown).empty(); // so lets clear it to start with then look at the array and build out from there
   OkChoices.forEach(function(ch, i) {
      thisrow = "";
      displayfields.forEach(function(itm, i) { thisrow += (ch[itm] + " : "); }); // trim the final bit
      thisrow = thisrow.slice(0, -2);
      if (UsedItems.indexOf(thisrow) == -1) {
         $(dropdown).append(new Option(thisrow, ch.ID, false, false));
         UsedItems += (thisrow + " |"); // remember this one as we let it in --- not so lucky for its followers#
      }
   });
   $(dropdown).val(thisval); // try to set it correctly back to its earlier value no biggie if we can't
}
 
 
function GetBusinessData() {
   //  we can have this same fuinction  but implement differently
   // here i want to know who the owner is
 
   return "";
 
}
 
function executeBusinessLogic(str) {
   // in the case of finance the wrikle is about giving a specific person rsponsibility for a stage, so here we take the
   // currentstage status array and plug in the 'who' its all now on stream 0 so quite easy
   // NOTE this is dependant names or the workflows usign the SAME names  (Invoice A,B,C)
 
   return true; // for this implementation we are only interested in stream 0
}
 
function sortthisbodyon(tabl, col, datafield, dir) { // note dir = 1 0r -1
   // is there a special sort datafield? if so use that
   var sortable = $(tabl + " tbody tr td[data-source='" + col + "']").attr("data-sort");
   if (typeof sortable !== typeof undefined && sortable !== false) { datafield = "sort"; }
 
   $(tabl + " tbody tr").sort(function(a, b) {
      var aText = $(a).find("td[data-source='" + col + "']").data(datafield);
      var bText = $(b).find("td[data-source='" + col + "']").data(datafield);
      if (aText > bText) return (1 * dir);
      else if (aText < bText) return (-1 * dir);
      return 0;
   }).appendTo(tabl + " tbody");
}
 
function checkName() {
   // a quick check
   
   var name = Lozzi.Fields.getval("BusinessUnit") + "_"+ Lozzi.Fields.getval("ReportDepartment") + "_"+ Lozzi.Fields.getval("ITSRSystem") + "("+Lozzi.Fields.getval("ITSRSystemComponent") + ")";

   if (Lozzi.Fields.getval("Title") != name) {
      Lozzi.Fields.setDefaultValue("Title", name);
   }
}
 

function get_specificUser(st, ppl){
   return "";
}
 
function buildPageButtons(CT, Stage) {
   $("#FormTitle").text("building Buttons"); // so now can we build the buttons?
   var endorser = false;
   var secAuthorise = false;
   var isButtons = true; // assume im goign to return soem buttons 
   var bigJar = [];
   var wfLinks = [];
   var fromNode, toNode, who, message = "";
   who = get_specificUser(Stage, "");
   if (!(who > "" && who != $CurrentUserName)) { // if there is a who and its you then draw but if no who then draw anyway
      wfLinks = filter_lookupValues($wfLinks, "From", CT + ":" + Stage, true); //alert("stream:" + stream + " links filtered on [" + streamData.StageNo + "] has " + wfLinks.length + " entries")
      wfLinks.forEach(function (link) {
         fromNode = parseInt(link.From_x003a_StageNo) || 0;
         toNode = parseInt(link.To_x003a_StageNo) || 0;
         if (groupTest(link.AllowedGroups, $UserGroups)) {
            if (!link.OwnerConstraint || who != $CurrentUserName) { // not an or not b  == !(A or B)
               bigJar.push({tostream:$wf[toNode].Stream, to:toNode, fromstream:$wf[fromNode].Stream, from:fromNode, Label:link.Title, link:link.LinkID, color:link.ButtonColor, direction:link.direction});
            } else {
               message += "There is an owner constraint in place for : " + link.Title + "<br/>";
            }
         } else {
            message += ("You aren't a member of :" + link.AllowedGroups + ". '" + link.Title +"' is disabled.<br/>");
         }
      });
   } else {
      message += "Waiting on action by " + who + ".";
   }
   $("#buttonarea").append("<h4 id='buttonwarning'>" + message + "</h4>" + getButtonHTML(bigJar));
   $(".wfcontainer .next .btn").prepend("<i class='fa fa-arrow-circle-right fa-2x'></i>");
   $(".wfcontainer .prev .btn").append("<i class='fa fa-arrow-circle-left fa-2x'></i>");
   if (bigJar.length == 0) {
      isButtons = false; // af after all that we didnt manage to scrape up a single bitton best say so 
   }
   return isButtons;
}
 
function getButtonHTML(buttonJar) {
   var color,
      direction,
      prevNextButtons = ["", ""];
   buttonJar.forEach(function (bData) {
      // empty the jar and gussie-up each one
     
      if (bData.color.length < 2) {
         color = $colours[bData.color];
      } else {
         color = bData.color;
      }
      prevNextButtons[bData.direction] +=
           "<div class='btn " + color + " transparent' data-stageno='" + bData.to + "' data-direction='" + bData.direction + "' data-sourcenode='" + bData.from + "' data-text='" + 
           $wf[bData.to].Stage + "' data-stream='" + bData.tostream + "' data-link='" + bData.link + "' data-prereqstatus='true' data-sourcestream='" + bData.fromstream + 
           "' ><span>" + bData.Label + "</span></div>"; // build my button
   });
   return (
      "<div class='buttoncontainer'><div class='wfcontainer'>" +
       "<div class='prev'>" +
       prevNextButtons[0] +
       "</div><div class='next'>" +
       prevNextButtons[1] +
       "</div>" +
       "</div><div class='formcontainer'><div class='btn exit ash-grey right transparent'>Exit<i class='fa fa-times-circle fa-2x'></i><table><tr><td></td></tr></table></div>" +
       "<div class='btn save blue left transparent'><table><tr><td><i class='fa fa-plus-circle fa-2x savemessage'></i></td><td id='savemessage'>Save</td><td id='nextstages'></td></tr></table></div></div></div>"
   );
}