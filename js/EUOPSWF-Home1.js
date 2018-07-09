var SiteListArray = [];
var PLP = [];
var CHK = [];
var GUIDString = "";
var name, desc, date, bkgImage, ListItem, linkType, linebreak, path, blockHTML = "";
var position, index;
var colours = ['#addfeb', '#22c0f1', '#b36aac', 'f49025', '#63be60', '#3681b5', '#676868'];
var allMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

$(function() {
    // Make sure the SharePoint script file 'sp.js' is loaded before our code runs.
    SP.SOD.executeFunc('sp.js', 'SP.ClientContext', sharePointReady);

    function sharePointReady() {

        // so query the PLP list and ge the items marked for this page  do a query in case any of the links poitn to a list so we need its metadata 
        getLists('', OKLists, onQueryError)

        function OKLists(data) { //Lets see what we have got in the way of lists
            var listEnumerator = data.getEnumerator();
            while (listEnumerator.moveNext()) {
                var oList = listEnumerator.get_current();
                SiteListArray.push([oList.get_id(), oList.get_title(), oList.get_description(), oList.get_itemCount(), oList.get_lastItemModifiedDate(), oList.get_hidden(), oList.get_baseType()]);
                GUIDString += oList.get_id() + ",";
            }
            var qString = get_PromotedLinksPlus("checklists");
            getListItems('', 'PromotedLinksPlus', qString, onPLPOK, onQueryError);

            function onPLPOK(data) { //get the data from a results table and dump it into some simple HTML			
                PLP = buildDataRowsPlusFields(data);
                PLP.shift() // get rid of the first row as it contains column names 
                PLP.forEach(function(link, i) {
                    // see if its preceded by a break or usign the long link
                    link.PLPSource == "" ? path = link.PLPLongLink : path = link.PLPSource.get_url();
                    link.PLPLineBreak == true ? linebreak = 'break' : linebreak = '';
                    if (link.PLPLinkType == "2. Link") { // we are always going to show this item as it not security testible so build the HTML
                        blockHTML += "<div class='PLPPanel " + linebreak + "' data-path='" + path +
                            "' data-active='" + link.PLPActive + "' data-sequence='" + link.PLPSequence + "' data-action='" + link.PLPAction + "'>" +
                            link.PLPIcon + "<p class = 'PLPTitle'>" + link.Title + "</p>" +
                            "<div class = 'PLPSlideUp top' style='background-color: rgba(" + link.PLPColor.split(":")[1] + ");'>" + firstNChar(link.PLPDescription, 130) + "</div>" +
                            "<span class = 'PLPInfo'>General Link</span>" +
                            "</div>";
                    } else {
                        // it myst be a "1. Library or List" or a  "3. Subsite" so lets see if this user can see it 
                        position = GUIDString.indexOf(link.PLPGUID);
                        if (position > -1) {
                            index = position / 37 // how long is a guid and a comma ? , this is the index into the other array
                            date = moment.duration(moment().diff(moment(SiteListArray[index][4]))).humanize();
                            blockHTML += "<div class='PLPPanel " + linebreak + "' data-path='" + path + "' data-linktype='" + link.PLPLinkType +
                                "' data-active='" + link.PLPActive + "' data-sequence='" + link.PLPSequence + "' data-action='" + link.PLPAction + "'>" +
                                link.PLPIcon + "<p class = 'PLPTitle'>" + link.Title + "</p>" +
                                "<div class = 'PLPSlideUp top' style='background-color: rgba(" + link.PLPColor.split(":")[1] + ");'>" + firstNChar(link.PLPDescription, 130) + "</div>";
                            if (link.PLPLinkType == "1. Library or List") {
                                blockHTML += "<span class = 'PLPInfo'>" + SiteListArray[index][3] + " items<br> modified " + date + " ago</span>";
                            } else {
                                blockHTML += "<span class = 'PLPInfo'>Link to Subsite</span>"
                            }
                            blockHTML += "</div>";
                        }
                    }
                });
                $("#PLPButtons").html(blockHTML);
                var qString = get_Checklists();
                getListItems('', 'Checklists', qString, onChecklistOK, onQueryError);

                function onChecklistOK(data) { //get the data from a results table and dump it into some simple HTML			
                    CHK = buildDataRowsPlusFields(data);
                    // get the values in the columns look up some optiosn to be used for filtersdo it BEFORE i slice the arrray
                    var stream1 = get_distinctValueCount(CHK, 'wfSubStage');
                    var stream2 = get_distinctValueCount(CHK, 'wfSubStage1');
                    var DocType = get_distinctValueCount(CHK, '_wfFormType');
                    $("#PLPButtons").after(build_MultiSelectHTML(DocType));
                    var months = get_distinctValueCount(CHK, 'CreationMnth');

                    // must keep all three arays in the correct order
                    var fields = ['FileLeafRef', 'Ops_x0020_Client', 'CreationYr', 'CreationMnth', 'wfSubStage', 'wfSubStage1', 'ID', '_wfFormType', 'Modified'];
                    var tableHTML = renderArrayIntoDisplayTable(CHK, fields);
                    $("#listContent").html(tableHTML); 
                    var barHTML = "<div class='pbar'><div class='sqr' id='b1'></div><div class='sqr' id='b2'></div><div class='sqr' id='b3'></div><div class='sqr' id='b4'></div><div class='sqr' id='b5'></div></div>"
                    $("#listContent tbody td[data-source='ID']").html(barHTML);
                    renderProgressBars();

                    $('#displaytable').dynatable({
                        features: { paginate: false }
                    });

                    // INTERACTION METHODS IN THE LOWEST PIT OF HELL ALL IS DRAWN NOW AND IN SCOPE SO WE CAN ATTACH METHODS 
                    $(".PLPPanel").on("click", ".PLPSlideUp, .PLPTitle", function() { // so how do we process the panel on click event?  
                        if ($(this).parent().data("linktype") == "4. Other") {
                            var newCT = $(this).parent().data("path");
                            alert("Creating a " + newCT + ".\nThis may take a few seconds please be patient.\n\nIMPORTANT - when the form appears set the 'Content Type' to " + newCT);
                            var sourceTemplate = '/EU/EUOPS/Templates/FacingSheetGBP.xlsm';
                            //http://sharepoint/EU/EUOPS/Templates/FacingSheetGBP.xlsm
                            var docID = make_document(newCT, sourceTemplate, 'Checklists');
                        } else {
                            var action = $(this).parent().data("action");
                            if (action == "3. Dialog") { // this the dialog option 
                                var PopupUrl = $(this).parent().data("path") + "&IsDlg=1";
                                displayPopUp(PopupUrl); // dont forget the source column can have any params you may need
                            } else {
                                if (action == "2. NewTab") { // this is a new tab so just do that 
                                    window.open($(this).parent().data("path"), '_blank');
                                } else { // this is the yukky default just do it in line :-)  
                                    window.location.href = $(this).parent().data("path"); // done last so if its not defined it will do this by default  
                                }
                            }
                        }
                    });

                     
                    $(".multiselect input").click(function() {        
                        $(this).parent().toggleClass("multiselect-on"); 
                        var filterBy = $(this).data('item');
                        var sourceCol = $(this).closest("div").attr('id');
                        $(".listoutput tbody td[data-source='" + sourceCol + "'][data-value='" + filterBy + "']").parent().toggleClass('filtered-out')
                    });


                    $(".listoutput tbody td.cell0").click(function() {
                        var path = _spPageContextInfo.webAbsoluteUrl + "/Checklists/forms/EditForm.aspx?ID=" + $(this).parent().data('itemno');
                        displayPopUpOptions(path, "", 800, 700, false); // url, title, width, height, close
                    });

                    // document click 
                    $(".listoutput tbody td[data-name='Title']").click(function() {
                        var path = _spPageContextInfo.webAbsoluteUrl + "/checklists/" + $(this).data('value');
                        window.location.href = path;
                    });
                }
            }
        }
    }
});

function renderProgressBars() {

    $("#listContent tbody tr").each(function(i, row) {
        var s1 = parseInt($(row).children("td[data-source='wfSubStage']").data('value')) || 0;
        $(row).children("td[data-source='wfSubStage']").text('');
        $(row).find("td .sqr#b" + s1).addClass("b" + s1);
        var s2 = parseInt($(row).children("td[data-source='wfSubStage1']").data('value')) || 0;
        $(row).children("td[data-source='wfSubStage1']").text('');
        $(row).find("td .sqr#b" + s2).addClass("b" + s2);
        $(row).children("td[data-source='ID']").attr("data-value", Math.max(s1, s2));
    });

}

function make_document(CT, template, destlist) {
    var seed = parseInt(Math.random() * 10000);
    var newDocString = destlist + '/' + CT + seed + '.xlsm';
    var docID = "";
    var docProperties = { 'ContentTypeID': CT };
    copyTo(template, newDocString)
        .done(function(data) {
            var oDataUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/GetFileByServerRelativeUrl('/EU/EUOPS/" + newDocString + "')/ListItemAllFields?$select=Id";
            $.ajax({
                url: oDataUrl,
                type: "GET",
                headers: {
                    "Accept": "application/json; odata=verbose",
                    "X-RequestDigest": $("#__REQUESTDIGEST").val()
                },
                success: function(data) {
                    docID = data.d.ID;
                    var path = _spPageContextInfo.webAbsoluteUrl + "/" + destlist + "/forms/EditForm.aspx?ID=" + docID + "&CT=" + CT;
                    displayPopUpOptions(path, "", 800, 700, false); // url, title, width, height, close
                },
                error: function(error2) { console.log('error in gettign the ID: ' + JSON.stringify(error2)); }
            });
        })
        .fail(function(error) { console.log('error: ' + JSON.stringify(error)); });
    return docID;
}

function get_PromotedLinksPlus(page) {
    var fields = ['PLPSequence', 'PLPActive', 'PLPLongLink', 'PLPRender', 'PLPpage', 'Title', 'PLPLinkType', 'PLPAction', 'PLPSource', 'PLPIcon', 'PLPColor', 'PLPDescription', 'PLPGUID', 'PLPLineBreak'];
    var order = ['PLPSequence'];
    var where = [
        ['Eq', 'PLPActive', 'Boolean', 0],
        ['Eq', 'PLPpage', 'text', page]
    ]; // triplets of name type value this is VERY simple Where
    return get_CSOMQueryString(fields, order, where, 200, false);
}

function get_Checklists() {
    var fields = ['ID', 'Ops_x0020_Client', 'OpsTreaty', 'CreationYr', 'CreationMnth', 'wfSubStage', 'wfSubStage1', '_wfStreamStatus', '_wfFormType', 'Modified'];
    var order = ['OpsTreaty'];
    var where = [
        ['Neq', 'ContentType', 'Computed', 'General Doc'],
        ['Neq', 'ContentType', 'Computed', 'Document']
    ];
    return get_CSOMQueryString(fields, order, where, 200, false);
}

function get_distinctValueCount(a, fld) {
    //loop through an array and return an array of the values plus the counts the first entry is the field name
    var fldData = []; // name, count, 
    var indx;
    a.forEach(function(row) {
        indx = -1;
        // its a 2 d array we are searchign so i need to loop through it i cant use the index of option
        fldData.forEach(function(itm, j) { if (itm[0] == row[fld]) { indx = j; } }); // dense but sees if the item is in the field array
        if (indx == -1) { fldData.push([row[fld], 1]); } else { fldData[indx][1]++; } // add a new one or increment
    });
    fldData[0][1] = a.length;
    return fldData;
}

function build_MonthFilterButtons(a) {
    // expects an array of unique values note its got 2 bits in it the bane and the count
    var bHTLM = "<div class = 'filters btn" + a[0][0] + "'>";
    bHTLM += ("<div class ='filterbtn' id='99' data-value='-99'>Clear Filter</div>");
    a.shift();
    a.forEach(function(row) {
        bHTLM += ("<div class ='filterbtn' id='" + row[0] + "' data-value='" + allMonths.indexOf(row[0]) + "'>" + row[0] + " (" + row[1] + ")</div>");
    });
    return bHTLM + "</div>";
}

function build_MultiSelectHTML(a) {
    // a is an array of names and numbers
    // look to see if there ia an alternative name on this one? to use in the title
    var msHTML = "<div class='multiselect' id='" + a[0][0] + "'>";
    msHTML += "<h2>Filter by :" + a[0][0] + "</h2>";
    a.shift();
    a.forEach(function(j, k) {
        msHTML += "<label class='multiselect-on'><input type='checkbox' name='option[]' data-item='" + j[0] + "' value=" + k + " checked /> " + j[0] + " (" + j[1] + ")</label>";
    });
    return msHTML + "</div>";
}

function sortByColumn(a, colIndex) {
    a.sort(sortFunction);

    function sortFunction(a, b) {
        if (a[colIndex] === b[colIndex]) { return 0; } else { return (a[colIndex] < b[colIndex]) ? -1 : 1; }
    }
    return a;
}

function renderArrayIntoDisplayTable(a, flds) {
    a.shift() // dump the first row we don't need it we have a more sophisticated way of getting to the names
    var names = [];
    var nRow = "<th></th>"; // the first empty row 
    var indx = -1;
    var fieldKeys = Object.keys(a[0]);
    fieldKeys.forEach(function(k) {
        indx = flds.indexOf(k); // are we interested in this column? if do build a data structure for it 
        if (indx > -1) {
            names.push([k, indx]); /// store the name and sequence
        }
    });
    var sorted_names = sortByColumn(names, 1); // get it into the correct order 
    sorted_names.forEach(function(name) { //nothign too complex just build the header row
        nRow += "<th data-source='" + name[0] + "'>" + name[0] + "</th>";
    });
    var vHTML = "<table class='listoutput' id='displaytable'><thead><tr>" + nRow + "</tr></thead></tbody>";
    a.forEach(function(row) {
        vHTML += "<tr data-itemno='" + row['ID'] + "'><td title='Edit Metadata'><i class='fa fa-pencil-square-o fa-1x'></i> </td>";
        sorted_names.forEach(function(name) {
            vHTML += "<td data-value='" + row[name[0]] + "' data-source='" + name[0] + "'>" + row[name[0]] + "</td>";
        });
        vHTML += "</tr>";
    });
    return vHTML + "</tbody></table>";
}

jQuery.fn.sortBtns = function sortBtns(datafield) {
    $("> div", this[0]).sort(dec_sort).appendTo(this[0]);

    function dec_sort(a, b) { return ($(b).data(datafield)) < ($(a).data(datafield)) ? 1 : -1; }
}

function copyTo(sourceFileUrl, targetFileUrl, success, error) {
    var endpointUrl = _spPageContextInfo.webAbsoluteUrl + "/_api/web/getfilebyserverrelativeurl('" + sourceFileUrl + "')/copyto(strnewurl='" + targetFileUrl + "',boverwrite=false)";
    return $.ajax({
        url: endpointUrl,
        method: "POST",
        contentType: "application/json;odata=verbose",
        headers: {
            "Accept": "application/json;odata=verbose",
            "X-RequestDigest": $("#__REQUESTDIGEST").val()
        },
    });
}
/*
{
    "pageLength": 50,
    "lengthChange": false,
    "columns": [
        { "width": "2%" },
        { "width": "38%", "title": "Title" },
        { "width": "15%", "title": "Client" },
        { "width": "5%", "title": "Year" },
        { "width": "5%", "title": "Month" },
        { "width": "0%", "title": "", "visible": false },
        { "width": "0%", "title": "", "visible": false },
        { "width": "15%", "title": "Workflow Progress" },
        { "width": "10%", "title": "Type" },
        { "width": "10%", "title": "Changed" }
    ]

}
*/