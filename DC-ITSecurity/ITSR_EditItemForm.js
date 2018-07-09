// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =====================================================================================================================

var $wf = []; // general purpose workflow definition array each stage has an entry
var $wfLinks = [];
var $wfFields = []; // general purpose workflow definition array  each field has an entry
var $currentStageStatus = { };
var $newStageStatus = []; // i do know its stattuses list like its pc mouses
var $UserGroups = []; // this users groups
var $CurrentUserName = ""; // go figure
var $perm = "none"; // set a default permission level
var $LockDetails = []; // infomation about the lock held on this record
var $PressedButton;
var $RequireStageNote;
var $DestStageNo = 0;
var $colours = [
   "green",
   "light-green",
   "orange",
   "blue",
   "purple",
   "yellow",
   "grey",
   "red",
   "dark-blue",
   "ash-grey"
];

var icons = {pending:"<i class='fas fa-clock iBlue' aria-hidden='true'></i>", 
   yes:"<i class='fas fa-thumbs-up iGreen' aria-hidden='true'></i>", 
   no:"<i class='fas fa-thumbs-down iRed' aria-hidden='true'></i>", 
   more:"<i class='fas fa-question-circle iAmber' aria-hidden='true'></i>", 
   x:"<i class='fas fa-minus iGrey' aria-hidden='true'></i>"};
var $wfSubStage = "";
var $CascadeOptions1 = [];
var $CascadeOptions2 = []; // a spare one

$(function() {
   // Make sure the SharePoint script file 'sp.js' is loaded before our code runs.
   SP.SOD.executeFunc("sp.js", "SP.ClientContext", sharePointReady);

   function sharePointReady() {
      $("#s4-ribbonrow").hide();
      $("<div id='floater'><h3></h3><div></div></div>").insertBefore("#hidZone"); // to support the IICONS
      $("<h2 id='FormTitle'>Preparing</h2>").insertBefore("#DeltaPlaceHolderMain");

      // lets put the page structure on the page
      $("#DeltaPlaceHolderMain").after("<span id=buttonarea></span><div id='versioninfo'><h4>%%GULP_INJECT_VERSION%%</h4></div>");

      var $thisCT = "ITSecurityReportPack"; 
      
      if (Lozzi.Fields.getval("_wfFormType") != $thisCT) {
         Lozzi.Fields.setDefaultValue("_wfFormType", $thisCT);
         $("select[title='Content Type'] option:contains(" + $thisCT + ")").attr("selected", "true");
      }
      var thisVariant = "";
      var itemID = parseInt(getParameterByName("ID")); // what item are we dealign with
     

      $("#FormTitle").text("identified CT getting user groups");
      var spContext = JSPgetUserContext();
      spContext.executeQueryAsync(function() {
         JSPGetUserGroups(spContext.get_web().get_currentUser());
         if (setRecordLock("_FormLocks", $thisCT, itemID)) {
            // if there is a lock return false  also returns the lock details
            $("#FormTitle").text("User data OK");
            // come out of that with an array of the users groups :-)
            var qString = get_wfNodesx($thisCT, thisVariant);
            getListItems("", "_wfNodes", qString, wfNodeSuccess, onQueryError);

            function wfNodeSuccess(data) {
               $wf = buildDataRowsPlusFields(data); // so lead all of that into an aray of wf
               $("#FormTitle").text("WF Node data OK");
               qString = get_wfConnectionsx($thisCT, thisVariant);
               getListItems("", "_wfConnections", qString, wfLinksSuccess, onQueryError);

               function wfLinksSuccess(data) {
                  //get the data from a results table and dump it into some simple HTML
                  $wfLinks = buildDataRowsPlusFields(data); // so lead all of that into an aray of wf
                  $("#FormTitle").text("WF Links data OK");
                  qString = get_wfFieldControlsx($thisCT, thisVariant);
                  getListItems("", "_wfFieldControl", qString, FieldDataSuccess, onQueryError);

                  function FieldDataSuccess(data) {
                     //get the data from a results table and dump it into some simple HTML
                     $wfFields = buildDataRowsPlusFields(data); // so lead all of that into an aray of wf
                     $("#FormTitle").text("wf Field data OK");

                     qString = get_WorkflowHistory(itemID);
                     getListItems("", "_wfHistory", qString, historySuccess, onQueryError);

                     function historySuccess(data) {
                        $wfHistory = buildDataRowsPlusFields(data); // so lead all of that into an aray of wf
                        $("#FormTitle").text("Item History Loaded");

                        // SO NOW DO THE WORK WE HAVE IT ALL - HA HA HA NOTE THE ARRAYS HAVE a ROW 0 WHICH IS THE FIELD NAMES
                        $wfSubStage = Lozzi.Fields.getval("wfSubStage");
                        if ($wfSubStage == "1.0 Request") {
                           Lozzi.Fields.setDefaultValue("wfSubStage", $wf[1].Stage);
                           $wfSubStage = $wf[1].Stage;
                           $("input[title='EmailAlert']").attr("checked", false); // check
                           Lozzi.Fields.setDefaultValue("RAGStatus", "Green");
                          
                        }
                        var stageNo = getRowNoforField("Stage", $wfSubStage, $wf);
                        // clear out the old stage note we dotn need it any more 
                        $("textarea[title='StageNote']").text("");
                        checkName();

                        // but very firstly lets give the form main table an ID we know there is a content type selector in the table
                        // $("select[title='Content Type']").closest("table").attr('id', "sorttable"); // give the parent an (ID
                        $(".ms-formtable").attr("id", "sorttable"); //
                        // SET UP THE FORM firstly lets give the TRs a row number and change the labels
                        renameFieldsTabAndSortForm(stageNo);

                        $("#sorttable").closest("span").closest("table").css("width", "98%");

                        $("#sorttable").after("<div id='historytab' class ='formtab'><span>Workflow History, attachments & notes</span><span id='indicatoricons'></span></div>");
                        populateHistoryTab($wfHistory, "historytab", "historypanel", set_historyTableParamaters());
                        barChart_Column("#historypanel", "_wfStreamTime0", "_wfPrevStage", "progress");

                        // CLICK BIT AND BOBS 

                        $("#historypanel tbody tr").click(function () {
                           var AttachmentURLs = getAttachedFiles("_wfHistory", $(this).data("itemno"));
                           if (AttachmentURLs.length > 0) {
                              window.open(AttachmentURLs[0], "Note Attachment", "height=700,width=800");
                           }
                        });

                        $("#sorttable .formtab").click(function () {
                           var thistab = $(this).data("tab");
                           $("#sorttable tbody .collapsible:not([data-tab='" + thistab + "'])").slideUp(300);
                           $("#sorttable tbody .collapsible[data-tab='" + thistab + "']").slideDown(300);
                           $("#historypanelcontainer").slideUp(300);
                        });

                        $("#historytab").click(function () {
                           var thistab = $(this).data("tab");
                           $("#sorttable tbody tr .collapsible").slideUp(300);
                           $("#historypanelcontainer").slideDown(300);
                        });

                        $("#formtab0").click();
                        // so now can we build the buttons?
                        $("#FormTitle").text("building Buttons");
                        // ================== BUTTONS AND ACTIONS AND STUFF ==================================

                        buildPageButtons($thisCT, $wfSubStage);
                        $("input[value='Save']").closest("table").hide(); //  in the mode of the new item 
                        $(".ms-formtoolbar").hide(); // when its on an existing Doc set 
                        //$("#part1").hide(); // nuisance alert bar about authorising
                        $("#FormTitle").html("<div id='titleblock'><div id='ctname'>" + CamelSpaces($thisCT) + " - " + thisVariant + " stage</div><div id='wfstages'>"+$wfSubStage +"</div></div>");

                        // =========================  AND ACTIONS AND STUFF ==================================
                        $(".formRow i").click(function(ev) {
                           $("#floater h3").text($(this).parent().text()); // populate it from the data in the vicinity
                           $("#floater div").html($(this).attr("data-fieldhelp"));
                           var scrollOffset = $("#s4-workspace").scrollTop();
                           $("#floater").css({
                              top: ev.clientY - 15 + scrollOffset + "px",
                              left: ev.clientX - 15 + "px" // use a bit of offset to its easy to catch the mouse out event
                           }).show(300);
                        });

                        $("#floater").mouseleave(function() {
                           $("#floater").hide(150);
                        });

                        $("#topExit i").click(function() {
                           deleteLock("_FormLocks", $LockDetails["LockId"]);
                           $(".ms-toolbar input[value='Cancel']").click();
                        });

                        // and what happens if they get clicked firstly deal with the exit thingy
                        $(".buttoncontainer .wfcontainer .btn").click(function() {
                           $PressedButton = $(this).data("link"); //store the ID of the link the button is derived from
                           $PressedButton = $PressedButton  -1;
                           $DestStageNo = $(this).data("stageno"); // /where is it headed?
                        
                           // do we demanD a note? 
                           $RequireStageNote = $wfLinks[$PressedButton].RequireStageNote;
                           if ($RequireStageNote) {
                              $("textarea[title='StageNote']").closest("tr").addClass("mandatory");
                              $("textarea[title='StageNote']").closest("tr").find(".ms-accentText").closest("td").addClass("mandatory");
                           }
                           // this button may be telling me it doesnt need validation
                           $needValidation = $wfLinks[$PressedButton].ApplyValidation;
                           $(".buttoncontainer .formcontainer .btn.save").click();
                        });


                        $(".buttoncontainer .formcontainer .btn").click(
                           function () {
                              $(this).removeClass("transparent");
                              if ($(this).hasClass("save")) {
                                 var save = true;

                                 if ($PressedButton > 0) { // so we are not just savign we are going places  - woo hoo!! 
                                    if (check_SRMandatoryFieldsOK($needValidation, $RequireStageNote)) {
                                       save = confirm("Progress to: " + $wf[$DestStageNo].Stage + "\n\n   PLEASE NOTE: This action will be recorded in the items\n   history and will be attributable to yourself.");
                                    } else {
                                       save = false;
                                       alert("One or more mandatory fields are not complete!");
                                       $("#formtab0").click();
                                    }
                                 }
                                 if (save) {
                                    checkName(); // rename if needed
                                    // do the things we need to do to get to the next stage 
                                    var oldStage = Lozzi.Fields.getval("wfSubStage");
                                    var oldDate =  Lozzi.Fields.getval("_wfStatusChangeDate");
                                    if ($DestStageNo != 0) { // was there a change?
                                       Lozzi.Fields.setDefaultValue("wfSubStage", $wf[$DestStageNo].Stage);
                                       Lozzi.Fields.setDefaultValue("_wfStatusChangeDate", moment().format("DD/MM/YYYY HH:mm")); // only update the change date if the workflow changed
                                       if ($wf[$DestStageNo].StartRAG != "x") { // finally what to do with the status
                                          Lozzi.Fields.setDefaultValue("StageRAGStatus", $wf[$DestStageNo].StartRAG);
                                       }
                                    }
                                    var to = "", from = "", logmsg = "<i class=\"far fa-save fa-fw fa-2x iBlue\"></i> Saved";

                                    if($PressedButton > 0){
                                       logmsg = $wfLinks[$PressedButton]["LogText"];
                                       to = $wfLinks[$PressedButton]["To"].split(":")[1];
                                    }
                                        
                                    var lastChange = Lozzi.Fields.getval("_wfStatusChangeDate");
                                    var note = $("textarea[title='StageNote']").text();
                                    var HistoryID =  logActionFromForm("_wfHistory", $thisCT, itemID, oldStage, to, note, logmsg, oldDate);
                                
                                    // let it go - let it go  - turn away and slam the door 
                                    deleteLock("_FormLocks", $LockDetails.LockId);
                                    $("input[value='Save']").click();
                                 }
                              } else {
                                 deleteLock("_FormLocks", $LockDetails.LockId);
                                 $("input[value='Cancel']").click();
                              }
                           }
                        );
                     //manageActions();
                     }
                  }
               }
            }
         } else {
            $(".ms-toolbar input[value='Cancel']").click();
         }
      });
   }
}, onQueryError);

