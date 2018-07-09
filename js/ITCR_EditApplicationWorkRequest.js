document.write("<h2 id = 'FormTitle' > ready to get overwritten < /h2>");

var $wf = []; // general purpose workflow definition array each stage has an entry 
var $wfFields = []; // general purpose workflow definition array  each field has an entry 
var $UserGroups = []; // this users groups
var $CurrentUserName = ""; // go figure
var $workflowActions = [
    [],
    [],
    []
]; //array of strings one per possible stream this is a workflow form
var $wfSubStage, $wfSubStage1, $wfSubStage2, $ModifiedBy;
var $perm = 'none'; // set a default permission level 
var $colours = ['green', 'light-green', 'orange', 'blue', 'purple', 'yellow', 'grey', 'red', 'dark-blue', 'ash-grey'];
var $CascadeOptions1 = [];
var $CascadeOptions2 = []; // a spare one 

$(function() {
    // Make sure the SharePoint script file 'sp.js' is loaded before our code runs.
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', sharePointReady);

    function sharePointReady() {

        var thisCT = $("select[title='Content Type'] :selected").text();
        if (thisCT == "") {
            thisCT = $('#pageTitle #DeltaPlaceHolderPageTitleInTitleArea').text().split(":")[1];
            thisCT = thisCT.trim();
        }
        if (Lozzi.Fields.getval("_wfFormType") != thisCT) {
            Lozzi.Fields.setDefaultValue("_wfFormType", thisCT);
        }

        if (thisCT != 'NONE') {
            $("#s4-ribbonrow").hide();
            $("#FormTitle").text("identified CT - now getting user groups");
            // do the data preamble  lets get the users Groups
            $wfSubStage = Lozzi.Fields.getval("wfSubStage");
            $wfSubStage1 = Lozzi.Fields.getval("wfSubStage1");
            $wfSubStage2 = Lozzi.Fields.getval("wfSubStage2");
            // horribe but this does temm me who last changed it not the current yse thats easy :-)
            $ModifiedBy = $("#onetIDListForm td#onetidinfoblock2 a.ms-subtleLink").text();

            $("input[title='EmailAlert']").attr('checked', true); // check
            var spContext = JSPgetUserContext();
            spContext.executeQueryAsync(function() {
                JSPGetUserGroups(spContext.get_web().get_currentUser());
                $("#FormTitle").text("User data OK");
                // come out of that with an array of the users groups :-) 
                var qString = get_WorkflowLookups(thisCT);
                $("#FormTitle").text("Get WF data");
                getListItems('', '_WorkflowLookups', qString, wfDataSuccess, onQueryError);

                function wfDataSuccess(data) {
                    $wf = buildDataRowsPlusFields(data); // so lead all of that into an aray of wf 
                    $("#FormTitle").text("WF data compiled");
                    qString = get_WorkflowFieldControls(thisCT);
                    $("#FormTitle").text("Get field data");
                    getListItems('', '_WorkflowFieldControls', qString, FieldDataSuccess, onQueryError);

                    function FieldDataSuccess(data) { //get the data from a results table and dump it into some simple HTML		
                        $wfFields = buildDataRowsPlusFields(data); // so lead all of that into an aray of wf 
                        $("#FormTitle").text("Field data Compiled");
                        // SO NOW DO THE WORK WE HAVE IT ALL - HA HA HA -  

                        // lets see if we decorated everything 
                        $wfSubStage = Lozzi.Fields.getval("wfSubStage");
                        var wfStageno = getRowNoforField('Stage', $wfSubStage, $wf); // go look it up of its -1 then its a new record 
                        // its going to be nothing for a new form so lets choose the first iten and set it 
                        if (wfStageno == -1) {
                            wfStageno = 1; // this must the the first one as its ordered by stage 
                            Lozzi.Fields.setDefaultValue("wfSubStage", $wf[wfStageno].Stage); // Start by settign the items workflow stage
                            Lozzi.Fields.setDefaultValue("wfStage", $wf[wfStageno].ParentStage); // and parent stage
                            $("textarea[Title='_wfStatusChangeHistory']").text("");
                            Lozzi.Fields.setDefaultValue("StageRAGStatus", "Green");
                            $wfSubStage = $wf[wfStageno].Stage;
                        }

                        // do we need to rename this item? 
                        if (Lozzi.Fields.getval("ActivityNo") != "x") {
                            var thisItemsActNo = Lozzi.Fields.getval("Name").split("[")[1]; // look at the current name see if it has a number after a square bracket
                            thisItemsActNo = parseInt(thisItemsActNo, 10);
                            if (isNaN(thisItemsActNo)) {
                                Lozzi.Fields.setDefaultValue("Name", (Lozzi.Fields.getval("ITSystem") + "-" + Lozzi.Fields.getval("Name") + " [" + Lozzi.Fields.getval("ActivityNo").split("-")[0] + "]"));
                            }
                        }

                        // so lets show / hide the fields as required  NOTE THE ARRAYS HAVE a ROW 0 WHICH IS THE FIELD NAMES 
                        $wfSubStage = $wf[wfStageno].Stage;
                        var thisStage = "wfStage" + (wfStageno); // so we have some columns called stage 1 to 24 we need a string to reference them so here goes
                        for (var j = 2; j < $wfFields.length; j++) { // tootle down the array of fields (one ROW per field one COLUMN per stage)
                            switch ($wfFields[j][thisStage]) { // should we hide it?  
                                case 'x':
                                    Lozzi.Fields.hide($wfFields[j]['Title']);
                                    break;
                                case 'r':
                                    Lozzi.Fields.disable($wfFields[j]['Title']);
                                    break;
                            }
                        }

                        // but very firstly lets gibe it an ID we know there is a content type selector in the table 
                        $("select[title='Content Type']").closest("table").attr('id', "sorttable"); // give the parent an (ID
                        // SET UP THE FORM firstly lets give the TRs a row number and change the labels 
                        renameFieldsAndSortForm();

                        // can we change its width?
                        $("#onetIDListForm").width("100%");
                        $("#onetIDListForm table").width("100%");
                        $("#onetIDListForm .ms-formtable tr td.ms-formbody").width("600px !important");

                        // so now can we build the buttons? 
                        $("#FormTitle").text("building Buttons");

                        var buttonBlockHTML = BuildwfButtonsNew(wfStageno);
                        $(buttonBlockHTML).insertBefore('#hidZone');
                        $('.ms-formtoolbar').css('display', 'none');
                        $("#FormTitle").html("<h3>" + thisCT + " - Stage: " + $wfSubStage + "</h3>");

                        $("input[title='EmailAlert']").click(function() {
                            $(this).closest("tr").next().slideToggle();
                        });

                        $(".buttoncontainer .wfcontainer .btn").click(function() {
                            var proposedStage = $(this).text();
                            var stream = $(this).data("stream");
                            var multiStream = false;
                            var wfButtons = $(".buttoncontainer .wfcontainer .btn").each(function(bt) {
                                if ($(this).data("stream") != stream) {
                                    multiStream = true;
                                }
                            });
                            if (multiStream) {
                                // so if its selected we unselect else we process it 
                                if ($(this).hasClass("transparent")) {
                                    // firstly trash the selected one :-)
                                    var streambuttons = $(".buttoncontainer .wfcontainer .btn[data-stream='" + stream + "']").not("transparent");
                                    $(streambuttons).addClass('transparent');
                                    //then select this one and update the wfActions
                                    $(this).removeClass("transparent");
                                    $workflowActions[stream - 1] = [$(this).data("stageno"), $(this).data("text"), $(this).data("stream")];
                                } else {
                                    $(this).addClass("transparent");
                                    $workflowActions[stream - 1] = [];
                                }
                                // ok lets reflect that in the SAVE button
                                var textblock = "";
                                $workflowActions.forEach(function(wfAction) {
                                    if (wfAction[1] > "") {
                                        textblock += wfAction[1] + "<br/>"; // get the text of the wfAction
                                    }
                                });
                                if (textblock.length > 0) {
                                    $(".btn #savemessage").text("Progress to |");
                                    $(".btn #nextstages").html(textblock);
                                } else {
                                    $(".btn #savemessage").text("Save (without workflow progression)");
                                    $(".btn #nextstages").html("");
                                }
                            } else { //-  just the one stream so enact it 
                                $(this).removeClass("transparent");
                                $workflowActions[stream - 1] = [$(this).data("stageno"), $(this).data("text"), $(this).data("stream")];
                                $(".buttoncontainer .formcontainer .btn.save").click();
                            }
                        });

                        $(".buttoncontainer .formcontainer .btn").click(function() {
                            if ($(this).hasClass("save")) {
                                var textblock = "";
                                $workflowActions.forEach(function(wfAction) {
                                    if (wfAction[1] > "") {
                                        textblock += "\t" + wfAction[1] + "\n"; // get the text of the wfAction
                                    }
                                });
                                var save = true;
                                if (textblock.length > 0) {
                                    save = confirm("Are you SURE you want to progress to:- \n" + textblock);
                                }
                                if (save) {
                                    $("#DeltaPlaceHolderMain").fadeTo('slow', 0.5);
                                    $(".buttoncontainer").prepend("<h2> PLEASE WAIT - Updating Audit data</h2><p></p>");
                                    if (textblock.length > 0) { // there is something to do 
                                        // do the workflow progression here its too simple i think but here goes - im sure there is pain later on 
                                        if ($workflowActions[0][1] > "") {
                                            Lozzi.Fields.setDefaultValue("wfSubStage", $workflowActions[0][1]);
                                            wfStageno = getRowNoforField('Stage', $workflowActions[0][1], $wf); // go look it up of its -1 then its a new record 
                                            Lozzi.Fields.setDefaultValue("wfStage", $wf[wfStageno].ParentStage); // and parent stage
                                        }
                                        if ($workflowActions[1][1] > "") {
                                            Lozzi.Fields.setDefaultValue("wfSubStage1", $workflowActions[1]);
                                        }
                                        if ($workflowActions[2][1] > "") {
                                            Lozzi.Fields.setDefaultValue("wfSubStage2", $workflowActions[2]);
                                        }
                                        // finally what to do with the status 
                                        switch (parseInt($wf[wfStageno].StartRAG)) {
                                            case 1:
                                                Lozzi.Fields.setDefaultValue("StageRAGStatus", "Green");
                                                break;
                                            case 2:
                                                Lozzi.Fields.setDefaultValue("StageRAGStatus", "Amber");
                                                break;
                                            case 3:
                                                Lozzi.Fields.setDefaultValue("StageRAGStatus", "Red");
                                                break;
                                            case 5:
                                                Lozzi.Fields.setDefaultValue("StageRAGStatus", "-");
                                                break;
                                        }
                                        // only update the change date if the workflow changed
                                        Lozzi.Fields.setDefaultValue("_wfStatusChangeDate", moment().format("DD/MM/YYYY HH:mm"));
                                    } else {
                                        // also lets untick the email if the user just saved and didnt progress
                                        $("input[title='EmailAlert']").attr('checked', false); // nanny state n all that 
                                    }

                                    // now lets work on that-there accured time thingie if we need to
                                    var tdays = parseFloat(Lozzi.Fields.getval("Days Effort"));
                                    if (!isNaN(tdays)) { // dont bother if its not a number
                                        if (tdays != 0) { // is there anything to do ?
                                            var odays = parseFloat(Lozzi.Fields.getval("CumulativeDays"));
                                            odays += tdays;
                                            Lozzi.Fields.setDefaultValue("Days Effort", 0); // reset the current one
                                            Lozzi.Fields.setDefaultValue("CumulativeDays", odays); // update the new total
                                        }
                                    } else {
                                        // set it to zero as it want a number and it should be ! 
                                        Lozzi.Fields.setDefaultValue("Days Effort", 0);
                                        tdays = 0; // going to use it in logging
                                    }

                                    // find out what fields to log and if they have any alternative names
                                    var logFields = [];
                                    for (var l = 0; l < $wfFields.length; l++) {
                                        if ($wfFields[l].LogChange) {
                                            logFields.push([$wfFields[l]["Title"], $wfFields[l]["AltName"]]);
                                        }
                                    }

                                    var wfHistory = logtoJSON($CurrentUserName, logFields, $workflowActions) + Lozzi.Fields.getval("_wfStatusChangeHistory"); // Get the machine version of the workflow history  

                                    $("textarea[Title='_wfStatusChangeHistory']").text(wfHistory); // save it back into the item NOTE ITS RETROSPECTIVE (item at this stage readched this RAG and stayed for N days) 
                                    Lozzi.Fields.setDefaultValue("StageNote", ""); // reset the stage note so its ready for the next time
                                    $(".buttoncontainer").prepend("<h2> Saving</h2><p></p>");
                                    $(".ms-toolbar input[value='Save']").click();
                                }
                            } else {
                                $(".ms-toolbar input[value='Cancel']").click();
                            }
                        });
                    }
                }
            });
        }
    }
}, onQueryError);