/*
Created by David Lozzi, @davidlozzi, www.davidlozzi.com, 1/10/2014, last modified 10/23/2015
Requires jQuery, you can include: <script src="//ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
Lozzi.Fields
This script is really simple to use, include jQuery and the Lozzi.Fields.js file, and then start using it!

<script type="text/javasccript">
$(document).ready(function(){
Lozzi.Fields.disableWithAllowance("Start Date", ["Project Managers"]);
Lozzi.Fields.disable("Task Status");
Lozzi.Fields.hideWithAllowance("Predess");
Lozzi.Fields.hide("% Complete");
});
</script>

Lozzi.Fields.disable(fieldname)

Simply disables the field, for all users. It hides all controls in the field and displays the value instead.

Lozzi.Fields.disableWithAllowance(fieldname, groups)

Disables the field, but enables it for the users in the groups specified. Also, 
Site Collection Administrators are included automatically, so they can always edit the field. 
You can send the groups in an array, like "Group One", "Group Two".

Lozzi.Fields.hide(fieldname)

Simply hides the field, for all users.

Lozzi.Fields.hideWithAllowance(fieldname, groups)

Hides the field, but shows it for the users in the groups specified. Also, 
Site Collection Administrators are included automatically, so they can always edit the field.
You can send the groups in an array, like "Group One", "Group Two".

*/

var Lozzi = window.Lozzi || {};

Lozzi.Fields = function() {
    var spContext;
    var currentUser;
    var peoplePickerCell;
    var disable = function(fieldDisplayName) {
        var theCell = getCell(fieldDisplayName);
        var value = "";
        var theControls;
        if (theCell.find("[class^='sp-peoplepicker']").length > 0) {
            disablePeoplePicker(theCell);
        } else if (theCell.find(".ms-taxonomy-fieldeditor").length > 0) {
            disableMetadata(theCell);
        } else if (theCell.find("[id*='$LookupField']").length > 0) {
            disableLookupField(theCell);
        } else if (theCell.find("input[type='radio']").length > 0) {
            disableRadioField(theCell);
        } else {
            theControls = theCell.find("input,select,textarea,img");
            value = "<span class='readonly'>" + theControls.val() + "<span>";
            theControls.hide();
            theCell.prepend(value);
            theCell.find("div.ms-inputBox").hide();
        }
    }
    var peopleLoopCount = 0;
    var peoplePickerBorder = "";
    var disablePeoplePicker = function(theCell) {
        if ($(".sp-peoplepicker-topLevel", theCell).css("border") != "none") {
            //console.log("disablePeoplePicker")
            $(".sp-peoplepicker-editorInput", theCell).attr("disabled", "true")
            peoplePickerBorder = $(".sp-peoplepicker-topLevel", theCell).css("border");
            $(".sp-peoplepicker-topLevel", theCell).css("border", "none");
            $(".sp-peoplepicker-delImage", theCell).hide();

            peopleLoopCount++;
            //hate this loop, not sure how else to handle waiting for the objs 
            if (peopleLoopCount < 3) {
                setTimeout(function() { disablePeoplePicker(theCell) }, 350);
            } else {
                peopleLoopCount = 0;
            }
        }
    }
    var metadataLoop = 0;
    var disableMetadata = function(theCell) {
        if ($(".valid-text", theCell).length > 0 || metadataLoop == 5) {
            //console.log("found " + $(".valid-text",theCell).length + " with text " + $(".valid-text",theCell).text());
            var metaValue = $(".valid-text", theCell).text();
            var theControls = theCell.find("input,select,textarea,img");
            var value = "<span class='readonly'>" + metaValue + "<span>";
            theControls.hide();
            theCell.prepend(value);
            theCell.find("div.ms-inputBox").hide();
            metadataLoop = 0;
        } else {
            metadataLoop++;
            //yup, hate looping to wait for the DOM to load. Must. Find. Fix.
            if (metadataLoop <= 5) {
                setTimeout(function() { disableMetadata(theCell) }, 350);
            }
        }
    }

    var disableLookupField = function(theCell) {
        theControls = theCell.find("select");
        var selectedValue = theControls.find("option:selected");
        value = "<span class='readonly'>" + selectedValue.text() + "<span>";
        theControls.hide();
        theCell.prepend(value);

    }

    var disableRadioField = function(theCell) {
        //debugger
        var theControls = theCell.find("table");
        var selectedValue = theCell.find("input:checked").val();
        theControls.hide();
        theCell.prepend(selectedValue);

    }

    var enable = function(fieldDisplayName) {
        var theCell = getCell(fieldDisplayName);
        if (theCell.find("[class^='sp-peoplepicker']").length > 0) {
            enablePeoplePicker(theCell);
        } else if (theCell.find(".ms-taxonomy-fieldeditor").length > 0) {
            enableMetadata(theCell);
        } else {
            var theControls = theCell.find("input,select,textarea,img");
            var value = theCell.find("span.readonly")
            theControls.show();
            value.remove();
        }
    }
    var enablePeoplePicker = function(theCell) {
        if ($(".sp-peoplepicker-topLevel", theCell).css("border") != peoplePickerBorder) {
            //console.log("enablePeoplePicker")
            $(".sp-peoplepicker-editorInput", theCell).removeAttr("disabled")
            $(".sp-peoplepicker-topLevel", theCell).css("border", peoplePickerBorder);
            $(".sp-peoplepicker-delImage", theCell).show();
            $("span.readonly", theCell).remove();
            peopleLoopCount++;
            if (peopleLoopCount < 7) {
                setTimeout(function() { enablePeoplePicker(theCell) }, 350);
            } else {
                peopleLoopCount = 0;
            }
        }
    }
    var enableMetadata = function(theCell) {
        console.log("enableMetadata");
        if (metadataLoop == 0) {
            //console.log("found " + $(".valid-text",theCell).length + " with text " + $(".valid-text",theCell).text());
            var metaValue = $(".valid-text", theCell).text();
            var theControls = theCell.find("input,select,textarea,img");
            theControls.show();
            $("div.ms-inputBox", theCell).show();
            $("span.readonly", theCell).remove();
        } else {
            setTimeout(function() { enableMetadata(theCell) }, 350);
        }
    }

    var getval = function(fieldDisplayName) {
        var theCell = getCell(fieldDisplayName);
        var theControls = theCell.find("input,select,textarea,img");
        var thisval = theControls.val();
        // if its a date then is there a date time part too? 
        if (moment(thisval, "DD/MM/YYYY", true).isValid()) { // so this will just be the year part look for the others bits 
            var wfHour = "000" + $(".ms-dttimeinput label:contains('" + fieldDisplayName + " Hours')").next("select").val();
            var wfMin = "000" + $(".ms-dttimeinput label:contains('" + fieldDisplayName + " Minutes')").next("select").val();
            var tempval = theControls.val() + " " + wfHour.substr(wfHour.length - 2) + ":" + wfMin.substr(wfMin.length - 2);
            if (moment(tempval, "DD/MM/YYYY HH:mm", true).isValid()) {
                thisval = tempval
            }
        }
        return thisval;
    }

    var hide = function(fieldDisplayName) {
        var theRow = getRow(fieldDisplayName);
        theRow.hide();
    }

    var show = function(fieldDisplayName) {
        var theRow = getRow(fieldDisplayName);
        theRow.show();
    }

    var getRow = function(fieldDisplayName) {
        var theRow = $("[title='" + fieldDisplayName + "'], [title='" + fieldDisplayName + " possible values']").closest("td.ms-formbody").parent();
        if (theRow.length == 0) {
            theRow = $(".ms-formlabel").filter(function(index) {
                return $(this).text().trim() == fieldDisplayName || $(this).text().trim() == fieldDisplayName + " *";
            }).parent();
        }
        return theRow;
    }

    var getCell = function(fieldDisplayName) {
            var theCell = $("[title='" + fieldDisplayName + "'], [title='" + fieldDisplayName + " possible values']").closest("td.ms-formbody");
            if (theCell.length == 0) {
                theCell = $(".ms-formlabel").filter(function(index) {
                    return $(this).text().trim() == fieldDisplayName || $(this).text().trim() == fieldDisplayName + " *";
                }).parent().find("td.ms-formbody");
            }
            return theCell;
        }
        //group names in an array of strings, i.e. ["Group One","Group Two"]

    var disableWithAllowance = function(fieldName, groups) {
        disable(fieldName);

        spContext = new SP.ClientContext.get_current();
        currentUser = spContext.get_web().get_currentUser();

        spContext.load(currentUser);
        spContext.load(currentUser.get_groups());
        spContext.executeQueryAsync(function() {
            getGroupsAndEnable(fieldName, groups)
        }, asyncFailed);

    }

    var getGroupsAndEnable = function(fieldName, groups) {
        if (currentUser.get_isSiteAdmin()) {
            allowedToEdit = true;
        } else {
            var groupEnum = currentUser.get_groups().getEnumerator();
            var allowedToEdit = false;
            while (groupEnum.moveNext()) {
                var group = groupEnum.get_current();
                if ($.inArray(group.get_title(), groups) > -1) {
                    allowedToEdit = true;
                    break;
                }
            }
        }
        if (allowedToEdit) {
            enable(fieldName);
        }

    }

    //group names in an array of strings, i.e. ["Group One","Group Two"]
    var hideWithAllowance = function(fieldName, groups) {
        hide(fieldName);
        spContext = new SP.ClientContext.get_current();
        currentUser = spContext.get_web().get_currentUser();
        spContext.load(currentUser);
        spContext.load(currentUser.get_groups());
        spContext.executeQueryAsync(function() {
            getGroupsAndShow(fieldName, groups);
        }, asyncFailed)

    }

    var getGroupsAndShow = function(fieldName, groups) {
        if (currentUser.get_isSiteAdmin()) {
            allowedToEdit = true;
        } else {
            var groupEnum = currentUser.get_groups().getEnumerator();
            var allowedToEdit = false;
            while (groupEnum.moveNext()) {
                var group = groupEnum.get_current();
                if ($.inArray(group.get_title(), groups) > -1) {
                    allowedToEdit = true;
                    break;
                }
            }
        }
        if (allowedToEdit) {
            show(fieldName);
        }
    }

    var asyncFailed = function(sender, args) {
        alert('request failed ' + args.get_message() + '\n' + args.get_stackTrace());
    }

    var setDefaultValue = function(fieldDisplayName, stringValue) {
        //TODO flush out the many field type options
        var theCell = getCell(fieldDisplayName);
        var selectObj = theCell.find("SELECT,input");
        selectObj.val(stringValue);
    }

    return {
        disable: disable,
        disableWithAllowance: disableWithAllowance,
        hide: hide,
        show: show,
        hideWithAllowance: hideWithAllowance,
        setDefaultValue: setDefaultValue,
        getval: getval,
        getRow: getRow
    }
}()