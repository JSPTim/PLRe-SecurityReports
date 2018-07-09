//// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =========================================================================================================

var SiteListArray = [];
var PLP = [];
var Inv = [];
var GUIDString = "";

var name, desc, date, bkgImage, ListItem, linkType, linebreak, path, blockHTML = "";
var position, index;

$(function() {
   // Make sure the SharePoint script file 'sp.js' is loaded before our code runs.
   SP.SOD.executeFunc("sp.js", "SP.ClientContext", sharePointReady);

   function sharePointReady() {
      $("#versioninfo").html("<h4>%%GULP_INJECT_VERSION%%</h4>");


      //=====================================================
      qString = get_ITSReports();
      getListItems("", "ITSecurityReports", qString, onSOXOK, onQueryError);

      function onSOXOK(data) { //get the data from a results table and dump it into some simple HTML
         var SOXItems = buildDataRowsPlusFields(data);
         //split it into two 
         var header = SOXItems.shift();
         var inProgress = filter_lookupValues(SOXItems, "wfSubStage", "4.0 Accepted", false);
         var Completed = filter_lookupValues(SOXItems, "wfSubStage", "4.0 Accepted", true); // im gougn to have to add the initial item to the top of the row 
         inProgress.unshift(header);       
         Completed.unshift(header); 

         Build_UITable( inProgress, set_ActiveITSRTableParamaters(), "#ActivelistContent", "wfSubStage", 1);
         var barHTML = "<div class='pbar'><div class='sqr' id='b1-0'></div><div class='sqr' id='b2-0'></div><div class='sqr' id='b2-1'></div><div class='sqr' id='b3-0'></div></div>";
         var s1, s2, s3, score, wfStageName;
         $("#ActivelistContent tbody td[data-source='Progress']").html(barHTML);
         $("#ActivelistContent tbody tr").each(function(i, row) {
            wfStageName = $(row).children("td[data-source='wfSubStage']").data("value");
            s1 = wfStageName.substring(0, 3).replace(".", "-").trim();
            $(row).find("td .sqr#b" + s1).addClass("Stage" + s1);
            $(row).prop("title", wfStageName);
            $(row).children("td[data-source='Progress']").attr("data-value", s1);
         });

         Build_UITable( Completed, set_CompletedITSRTableParamaters(), "#CompletedlistContent", "ID", -1);

         $("#inputfilter").keyup(function() {
            $(".filterbtn").removeClass("active");
            filter = new RegExp($(this).val(), "i");
            $(".listoutput tbody tr").filter(function() {
               $(this).each(function() {
                  found = false;
                  $(this).children().each(function() {
                     content = $(this).html();
                     if (content.match(filter)) { found = true; }
                  });
                  if (!found) { $(this).hide(); } else { $(this).show(); }
               });
            });
            recalc_numbers("#listContent");
         });

         // implement the filter and its methods (i dont resent this code as it does a lot
         $(".listoutput thead th i").click(function(ev) {
            //$(this).addClass('active');
            var colname = $(this).closest("th").data("source"); // populate it from the data in the vicinity
            var scrollOffset = $("#s4-workspace").scrollTop();
            $("#filter" + colname).css({
               top: (0) + "px",
               left: (ev.clientX - 15) + "px" // use a bit of offset to its easy to catch the mouse out event
            }).show(300);
         });

         $(".filterpopup div").click(function() {
            var sourceCol = $(this).parent().data("source");
            if ($(this).parent().find("input:checked").length == 0) { // special case if none show en all
               $(".listoutput tbody tr").removeClass("filtered-out");
               $("thead th[data-source='" + sourceCol + "'] i").removeClass("active");
            } else {
               $(".listoutput tbody tr").addClass("filtered-out");
               $(this).parent().find("input:checked").each(function() {
                  $("thead th[data-source='" + sourceCol + "'] i").addClass("active");
                  var filterBy = $(this).parent().data("value");
                  $(".listoutput tbody td[data-source='" + sourceCol + "'][data-value='" + filterBy + "']").parent().removeClass("filtered-out");
               });
            }
            recalc_numbers("#listContent", "£2 ");
         });

         $(".filterpopup").mouseleave(function() {
            $(this).hide(150);
         });

         $(".listoutput tbody td.editLink").click(function() {
            var path = _spPageContextInfo.webAbsoluteUrl + "/ITSecurityReports/forms/EditForm.aspx?ID=" + $(this).parent().data("itemno");
            displayPopUpOptions(path, "", 900, 750, "max?"); // url, title, width, height, close, width true = max
         });

         // document click
         $(".listoutput tbody td[data-name='Title']").click(function() {
            var path = _spPageContextInfo.webAbsoluteUrl + "/ITSecurityReports/" + $(this).data("value");
            window.location.href = path;
         });
      }
   }
});
