/* global Lozzi, moment */
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
/* eslint indent: 1 */



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




function renameFieldsAndSortForm(wfStage) {
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

    var newName, helpIcon = "";
    $wfFields.forEach(function (wfld) {
        var fieldDisplayName = wfld.Title;
        if (wfld.AltName > "" && wfld.AltName != "AltName") {
            // ignor the first row though i could jyst do a slice ont he array
            newName = CamelSpaces(wfld.AltName);
        } else {
            newName = CamelSpaces(wfld.Title);
        }
        // lets see if we have any help text if so we will make a little icon for it
        // i suppose we can also add in any inbuilt field commnets too  these sit in a span in the second column
        if (wfld.FieldHelp > "") {
            helpIcon = " <i data-fieldhelp='" + wfld.FieldHelp + "' class='fa fa-info-circle iBlue'></i>";
        } else {
            helpIcon = "";
        }

        var theRow = $("[Title='" + fieldDisplayName + "'], [Title='" + fieldDisplayName + " possible values']").closest("td.ms-formbody").parent();
        if (theRow.length == 0) {
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

        var thisItem = theRow.find(".ms-formlabel :contains('" + wfld.Title + "')");
        $(thisItem).addClass("formtitles");
        $(thisItem).html(newName);
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
                $(this).before("<tr class='formtab' id='formtab" + workingtab + "' data-tab='" + workingtab + "'><td colspan=2><span>" + tabText + "</span><span class = 'indicatoricons'></span></td></tr>");
                tabs.push(workingtab);
                // try to wrap in a div !!!! ILLEGAL HTML WE WILL SEE !!!!
            }
        }
        if (workingtab == 9) {
            $(this).hide();
        } else {
            //so how about movign shit onto the same line? this happens whrn the field nuber is a decimal  not an integer ? 
            if (fieldNo % 1 != 0) { //if the field number is not an integer? 
                // ooh we are going to rip this to pieces :-) but we will also hide the row to cover up the mess :-) 

                var destfieldrow = Math.floor(fieldNo); // firstly get the row we are goind to add stuff too
                var recipientrow = $("#sorttable tbody tr.formRow[data-fieldno='" + destfieldrow + "']");
                $(recipientrow).find("br").remove(); // who knows why MS put a BR in there its not needed as its all in a table anyway // ah it for the comment isnt it
                // now get the bits we are goign to move 
                var fieldTitle = $(this).find(".formtitles").text();
                var control = $(this).find("td.ms-formbody span").first().detach();
                $(recipientrow).find("span").last().append(" - " + fieldTitle + " ").after(control);
                // need to think aboout when the item is lozzi fields read only 
                $(this).remove(); // we stole the text and removed the control so dump it i dont want it to come back 
            }
        }
    });
    var thistab = $("textarea[title='StageNote']").closest("tr").data("tab");
    $("textarea[title='StageNote']").closest("tr").after("<tr class = 'formRow' data-tab='" + thistab + "'><td class = 'ms-formlabel'><h3 class='ms-standardheader formtitles'>Attach file to history</h3></td><td>" +
        "<input type='file' id='attachment-file-name'/></td></tr>");
    // how about clearifn th autofill fron the forms inputs 
    tabs.forEach(function (tab) {
        var tabRows = $("#sorttable tbody tr.formRow[data-tab='" + tab + "']");
        $(tabRows).wrapAll("<tr></tr>");
        $(tabRows).wrapAll("<td colspan=2></td>");
        $(tabRows).wrapAll("<div class='collapsible' id='tabpanel" + tab + "' data-tab='" + tab + "'></div>");
        $(tabRows).wrapAll("<table width='100%'></table>");
    });

    $("#formtable tbody input").attr("autocomplete", "off");
    //finally add i he history tab after the sortable DH_NOT_SUITABLE_GENERATOR
}



function adjustButtonCollection(StageNo) {
    // THE FINANCE SPECIFIC LOGIC  its fiddle to do away with the content ypes but at  
    // stage 1 with an endorser hide approve without endoresr hide endorse
    // does this instance need any after the fact logic ?
    return true;
}

function check_SRMandatoryFieldsOK(needed) {
    $("tr.formRow.mandatory").find("h3").removeClass("inputerror"); // clear all of the errors
    // needs a wrinke in it to chexk for the special cases of no checkign and forced note input
    if (!needed) {
        if (!$RequireStageNote) {
            return true;
        } else {
            if ($("textarea[title='StageNote']").text().length > 1) {
                return true;
            } else {
                $("textarea[title='StageNote']").closest("tr").find("h3").addClass("inputerror");
                return false;
            }
        }
    }
    var rowresult,
        result = true;
    $("tr.formRow.mandatory, tr[data-mode='m']").each(function (indx, row) {
        rowresult = true;
        if ($(row).find(".ms-dtinput").length > 0) {
            if ($(row).find(".ms-dtinput").find("input").val() == "") {rowresult = false;}
        } else if ($(row).find("[class^='sp-peoplepicker']").length > 0) {type = "people Picker";
        } else if ($(row).find(".ms-taxonomy-fieldeditor").length > 0) {type = "Metadata";
        } else if ($(row).find("[id*='$LookupField']").length > 0) {
            if ($(row).find("[id*='$LookupField']").val() == "" || $(row).find("[id*='$LookupField']").val() == 0) {rowresult = false;}
        } else if ($(row).find("input").length > 0) {
            if ($(row).find("input").val() == "") { rowresult = false;}
        } else if ($(row).find("textarea").length > 0) {
            if ($(row).find("textarea").val() == "") {rowresult = false;}
        } else if ($(row).find("select").length > 0) {
            if ($(row).find("select").val() == "-" || $(row).find("select").val() == 0 || $(row).find("select").val() == "") { rowresult = false;}
        }
        if (!rowresult) {
            $(row).find("h3").addClass("inputerror");
            result = false;
        }
    });
    return result;
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
 

function manageActions() {
    $wfLookups.shift();

    $("#sorttable tbody tr.formtab").first().click();



    // ========================= I Icon ACTIONS AND STUFF ==================================
    $(".formRow i").click(function (ev) {
        $("#floater h3").text(
            $(this).parent().text()
        ); // populate it from the data in the vicinity
        $("#floater span").text($(this).attr("data-fieldhelp"));
        var scrollOffset = $("#s4-workspace").scrollTop();
        $("#floater").css({
            top: ev.clientY - 15 + scrollOffset + "px",
            left: ev.clientX - 15 + "px" // use a bit of offset to its easy to catch the mouse out event
        }).show(300);
    });


    $("#topExit i").click(function () {
        deleteLock("_FormLocks", $LockDetails.LockId);
        $(".ms-toolbar input[value='Cancel']").click();
    });

    $("#floater").mouseleave(function () {
        $("#floater").hide(150);
    });

    // change to the email
    $("input[title='EmailAlert']").change(function () {
        Lozzi.Fields.getRow("To whom?").toggle(0);
    });

}