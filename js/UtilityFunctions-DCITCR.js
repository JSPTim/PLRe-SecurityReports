function makeKANBANPanel(row, rowno) {

    var cardRole = "";
    if (row.AssignedTo1.indexOf($CurrentUserName) > -1) {
        cardRole = "assignee";
    } else {
        if (row.Participants1.indexOf($CurrentUserName) > -1) {
            cardRole = "participant";
        }
    }
    var rDate, dDate;
    if (moment(row.AnticipatedDate).isValid()) {
        dDate = row.AnticipatedDate.format('ddd DD/MM/YY');
    } else {
        dDate = "--/--/--";
    }
    if (moment(row.RequiredDate).isValid()) {
        rDate = row.RequiredDate.format('ddd DD/MM/YY');
    } else {
        rDate = "--/--/--";
    }

    var thisHTMLPanel = "" +
        "<div class='kanbancard' data-ct='" + row._wfFormType + "'  data-role='" + cardRole + "'>" +
        "<div class='itemtop'>" +
        "<div class ='crno' data-id='" + row.ID + "'  data-rowno='" + rowno + "' title='Edit item metadata'>" + row.ActivityNo0 + "</div>" +
        "<div class ='crstatus c" + row.StageRAGStatus + "' title='collapse/expand'>&nbsp;</div>" +
        "<div class ='crtitle' data-folder='" + row.Title + "' title='Open Request'>" + row.FileLeafRef + "</div>" +
        "</div>" +
        "<div class='itemcontent'>" +
        "<table>" +
        "<tr><td class='datatitle'>IT System:</td><td class ='dataline'><b>" + row.ITSystem + "</b></td></tr>" +
        "<tr><td class='datatitle'>Stage:</td><td class ='dataline'><b>" + row.wfSubStage + "</b></td></tr>" +
        "<tr><td class='datatitle'>Overall RAG:</td><td class ='dataline'>" + row.RAGStatus + "</td></tr>" +
        "<tr><td class='datatitle'>Description:</td><td class ='dataline'>" + firstNChar(row.SolutionDescription, 200) + "</td></tr>" +
        "<tr><td class='datatitle'>Assigned to:</td><td class ='dataline' title='" + row.Participants1 + "'>" + row.AssignedTo1 + "</td></tr>" +
        "<tr><td class='datatitle'>Priority:</td><td class ='dataline'>" + row.RequestPriority + "</td></tr>" +
        "<tr><td class='datatitle'>Requred by:</td><td class ='dataline'>" + rDate + "</td></tr>" +
        "<tr><td class='datatitle'>Anticipated:</td><td class ='dataline'>" + dDate + "</td></tr>" +
        "<tr><td class='datatitle'>Est effort:</td><td class ='dataline'>" + row.EstimatedDaysEffort + "</td></tr>" +
        "<tr><td class='datatitle'>Actual days:</td><td class ='dataline'>" + row.CumulativeHours + "</td></tr>" +
        "</table>" +
        "</div>" +
        "</div>";
    return thisHTMLPanel
}

function decorateIconsColoursNumbers() {
    $(".Stage1").prepend("<i class='fa fa-edit fa-fw'></i>");
    $(".Stage2").prepend("<i class='fa fa-sitemap fa-fw'></i>");
    $(".Stage3").prepend("<i class='fa fa-cogs fa-fw'></i>");
    $(".Stage4").prepend("<i class='fa fa-group fa-fw'></i>");
    $(".Stage5").prepend("<i class='fa fa-refresh fa-fw'></i>");
    $(".Stage6").prepend("<i class='fa fa-check-square-o fa-fw'></i>");
    $(".Stage7").prepend("<i class='fa fa-trash-o fa-fw'></i>");
    $(".kanbancard[data-ct='ConfigurationChangeRequest'] .itemtop .crstatus").html("<i class='fa fa-wrench fa-fw'></i>");
    $(".kanbancard[data-ct='ApplicationWorkRequest'] .itemtop .crstatus").html("<i class='fa fa-code-fork fa-fw'></i>");
    var k
        // so lets decorate it now its on the page and add a bit of interactivity
    $(".kanbancontainer .kanbanbucket span").each(function() {
        k = $(this).parent().find('.kanbancard').length; // how many rows in the table in this is collabsible item
        var stg = $(this).attr('class');

        $(this).append(" (" + k + " items)"); // add the count to the apropriate header
        $(this).attr('data-counter', k);
        $(".bar." + stg).append(" :" + k); // add it to the side bar as well 
        var c2, c1, c0 = $(this).css('background-color');
        $(this).parent().find('.kanbancard').each(function(i, e) {
            c1 = blendColorsRGB(c0, 'rgb(200,200,200)', 0.5); // work out a colour based on the top bar   
            c2 = blendColorsRGB(c0, 'rgb(200,200,200)', 0.75); // work out a colour based on the top bar                      
            $(this).find('.itemtop').css('background-color', c1); // plop it onto the item in question 
            $(this).find('.itemtop').css('color', getTextColRGB(c1)); // plop it onto the item in question 
            $(this).find('.itemtitle').css('background-color', c2);
            $(this).find('.itemtitle').css('color', getTextColRGB(c2)); // plop it onto the item in question 
        });
    });

    k = $(".kanbancard[data-ct='ApplicationWorkRequest']").length;
    $(".barchart .awr").append(" :" + k); // add it to the side bar as well 

    k = $(".kanbancard[data-ct='ConfigurationChangeRequest']").length;
    $(".barchart .ccr").append(" :" + k); // add it to the side bar as well  
}

function buildDocSetHeader(row, thisID) {
    var dueDate = "- / - / -";
    var ReqDate = "- / - / -";
    if (moment(row.AnticipatedDate).isValid()) {
        var dueDate = row.AnticipatedDate.format('ddd DD/MM/YY');
    }
    if (moment(row.RequiredDate).isValid()) {
        var reqDate = row.RequiredDate.format('ddd DD/MM/YY');
    }
    $("#TimsTitle").text("Preparing Workflow History");
    var blockHTML = "<div class='theader'>" +
        "<div class='tleft'>" +
        "<h2><b>" + CamelSpaces(row._wfFormType) + "<b/> (" + row.ActivityNo0 + ")</h2>" +
        "<table class='crtable'>" +
        "<tbody>" +
        "<tr>" +
        "<td id='r1c1' class='tcol1'>CR Stage</td>" +
        "<td id='r1c2' class='tcol2'>" + row.wfStage + "</td>" +
        "<td id='r1c3' class='tcol3'>Sub Stage</td>" +
        "<td id='r1c4' class='tcol4'>" + row.wfSubStage + "</td>" +
        "</tr>" +
        "<tr>" +
        "<td id='r2c1' class='tcol1'>RAG Status</td>" +
        "<td id='r2c2' class='tcol2'>" + row.RAGStatus + "</td>" +
        "<td id='r2c3' class='tcol3'>Stage RAG Status</td>" +
        "<td id='r2c4' class='tcol4'>" + row.StageRAGStatus + "</td>" +
        "</tr>" +
        "<tr>" +
        "<td id='r3c1' class='tcol1'>IT System</td>" +
        "<td id='r3c2' class='tcol2'>" + row.ITSystem + "</td>" +
        "<td id='r3c3' class='tcol3'>Bus Ref</td>" +
        "<td id='r3c4' class='tcol4'>" + row.BusRef + "</td>" +
        "</tr>" +
        "<tr>" +
        "<td id='r4c1' class='tcol1'>Bus Owner</td>" +
        "<td id='r4c2' class='tcol2'>" + row.BusinessOwner + "</td>" +
        "<td id='r2c3' class='tcol3'>Priority</td>" +
        "<td id='r2c4' class='tcol4'>" + row.RequestPriority + "</td>" +
        "</tr>" +
        "<tr>" +
        "<td id='r5c1' class='tcol1'>Req date</td>" +
        "<td id='r5c2' class='tcol2'>" + reqDate + "</td>" +
        "<td id='r5c3' class='tcol3'>Est Date</td>" +
        "<td id='r5c4' class='tcol4'>" + dueDate + "</td>" +
        "</tr>" +
        "<tr>" +
        "<td id='r6c1' class='tcol1'>Assigned to</td>" +
        "<td id='r6c2' class='tcol2'>" + row.AssignedTo1 + "</td>" +
        "<td id='r6c3' class='tcol3'>Participants</td>" +
        "<td id='r6c4' class='tcol4'>" + row.Participants1 + "</td>" +
        "</tr>" +
        "<tr>" +
        "<td id='r7c1' class='tcol1'>Estimated Days</td>" +
        "<td id='r7c2' class='tcol2'>" + row.EstimatedDaysEffort + "</td>" +
        "<td id='r7c3' class='tcol3'>Days to date</td>" +
        "<td id='r7c4' class='tcol4'>" + row.CumulativeHours + "</td>" +
        "</tr>" +
        "</tbody>" +
        "</table>" +
        "<h2 id='historytoggle'>Click to show workflow history</h2>" +
        "</div>" +
        "<div class='tright'>" +
        "<h2>Reason for change</h2>" +
        "<p id='crreason'>" + row.ReasonForChange + "</p>" +
        "<h2>Solution description</h2>" +
        "<p id='crdesc'>" + row.SolutionDescription + "</p>" +
        "<span id='itemedit' data-id='" + thisID + "'>Edit item & workflow management</span>" +
        "</div>" +
        "</div>";
    return blockHTML;
}

function tabifyAndPrepareform() {

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

    // but very firstly lets gibe it an ID
    $("[Title='Title']").closest("table").attr('id', "sorttable"); // give the parent an (ID
    // SET UP THE FORM firstly lets give the TRs a row number and change the labels 
    $wfFields.forEach(function(wfld) {
        //alert(wfld.Title + " : " + wfld.AltName + " : " + wfld.FieldNo + "");
        var fieldDisplayName = wfld.Title
        if (wfld.AltName > "" && wfld.AltName != "AltName") {
            newName = CamelSpaces(wfld.AltName)
        } else {
            newName = CamelSpaces(wfld.Title)
        }
        var theRow = $("[Title='" + fieldDisplayName + "'], [Title='" + fieldDisplayName + " possible values']").closest("td.ms-formbody").parent();
        if (theRow.length == 0) {
            theRow = $(".ms-formlabel").filter(function(index) {
                return $(this).text().trim() == fieldDisplayName || $(this).text().trim() == fieldDisplayName + " *";
            }).parent();
        }
        theRow.attr({
            'data-tab': wfld.TabNo,
            'data-order': (wfld.TabNo * 100 + wfld.FieldNo)
        });
        theRow.addClass('formRow');
        theRow.find(".ms-formlabel :contains('" + wfld.Title + "')").addClass("formtitles");
        theRow.find(".ms-formlabel :contains('" + wfld.Title + "')").text(newName); // replace . tidy up the the names 
    });

    if ($CurrentUserName == "nxorthwaveVPNuser") {
        // plop the functions im testing in here 
        var srows = $('table#sorttable > tbody > tr.formRow:visible'); 
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
            $('table#sorttable > tbody').append(srow);  
        });
    }
    var tabHTML = "<ul>";

    for (var k = 0; k <= tabCount; k++) {
        rowset = $('tr[data-tab=' + k + ']');
        $(rowset).wrapAll("</tbody></table><div class='formtab tab" + k + "'><table><tbody>");
        tabHTML += ("<li>tab" + k + "</li>");
    }
    tabHTML += "</ul>";
    $('table#sorttable').prepend(tabHTML);  

    // can we change its width?
    $("#onetIDListForm").width("100%");
    $("#onetIDListForm table").width("100%");
    $("#onetIDListForm .ms-formtable tr td.ms-formbody").width("600px !important");
}