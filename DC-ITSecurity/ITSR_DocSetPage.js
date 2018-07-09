//// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =========================================================================================================


var $CRDetail = [];
var $fields = [];
var $order = [];
var $rows = [];
var $where = "";
var $currentStageStatus = [];

$(function () {
   // /_catalogs/masterpage/bls/pagehtml/EUOPSWF_DocSetPage.html
   // Make sure the SharePoint script file 'sp.js' is loaded before our code runs.
   SP.SOD.executeFunc("sp.js", "SP.ClientContext", sharePointReady);

   function sharePointReady() {
      $("#versioninfo").html("<h4>%%GULP_INJECT_VERSION%%</h4>");
      $("#TimsTitle").text("");
      $("#DeltaPlaceHolderMain table td").first().css("width", "40%");
      $("#DeltaPlaceHolderMain table td").first().next().html("<div id='previewpanel'></div>");
      var thisID = getParameterByName("ID");
      var qString = get_ITSReport(thisID);
     
      getListItems("", "ITSecurityReports", qString, onITSROK, onQueryError);

      function onITSROK(data) { //get the data from a results table and dump it into some simple HTML	note ONE ROW	
         $rows = buildDataRowsPlusFields(data);
         var dueDate = "--/--/--",
            blockHTML = "";
         var thisCT = $rows[1]["_wfFormType"]; // dotn forget we are on row 1 as row 0 is field names 
         qString = get_WorkflowFieldControls(thisCT);

         $("#TimsTitle").text("Get field data");
         getListItems("", "_wfFieldControl", qString, FieldDataSuccess, onQueryError);

         function FieldDataSuccess(data) { //get the data from a results table and dump it into some simple HTML		
            var i = 1; // lets poitn into the data 
            $wfFields = buildDataRowsPlusFields(data); // so lead all of that into an aray of wf 
            $("#TimsTitle").text("field data ok");

            // var qString = get_wfHistoryx(thisID);
            // getListItems("", "_wfHistory", qString, wfHistoryOK, onQueryError);

            // function wfHistoryOK(data) {
            //    $wfHistory = buildDataRowsPlusFields(data); // so lead all of that into an aray of wf 
               





            /// check the dates :-( 
            blockHTML = "<h2>Details for request (" + $rows[1].Title + ")</h2>" +
                        "<table class='crtable'>" +
                        "<tbody>" +
                        "<tr>" +
                        "<td id='r7c1' class='tcol1'>Stage</td>" +
                        "<td id='r7c2' class='tcol2'>" + $rows[1].wfSubStage + "</td>" +
                        "<td id='r7c3' class='tcol3'>Rag Status</td>" +
                        "<td id='r7c4' class='tcol4'>" + $rows[1].RAGStatus + "</td>" +
                        "</tr>" +
                        "<tr>" +
                        "<td id='r5c1' class='tcol1'>System</td>" +
                        "<td id='r5c2' class='tcol2'>" + $rows[1].ITSRSystem + "</td>" +
                        "<td id='r5c3' class='tcol3'>System Component</td>" +
                        "<td id='r5c4' class='tcol4'>" + $rows[1].ITSRSystemComponent + "</td>" +
                        "</tr>" + 
                        "<tr>" +
                        "<td id='r5c1' class='tcol1'>Business Unit</td>" +
                        "<td id='r5c2' class='tcol2'>" + $rows[1].BusinessUnit + "</td>" +
                        "<td id='r5c3' class='tcol3'>Department / Team</td>" +
                        "<td id='r5c4' class='tcol4'>" + $rows[1].ReportDepartment + "</td>" +
                        "</tr>" + 
                        "<tr>" +
                        "<td id='r5c1' class='tcol1'>Report Pack Author</td>" +
                        "<td id='r5c2' class='tcol2'>" + $rows[1].AssignedTo1 + "</td>" +
                        "<td id='r5c3' class='tcol3'>Approver</td>" +
                        "<td id='r5c4' class='tcol4'>" + $rows[1].BusinessOwner + "</td>" +
                        "</tr>" + 
                        "</tbody>" +
                        "</table>" + 

                        "<h2>Description</h2>" +
                        "<p id='crreason'>" + $rows[1].Description + "</p>" +

                        "<span id='itemedit' data-id='" + thisID + "'>Edit item & workflow management</span>";

            $("#CRItemheader").html(blockHTML);

            $("#historytoggle").click(function () {
               $("#CRItemhistory").slideToggle();
               if ($(this).text() == "Click to show workflow history") {
                  $(this).text("Click to hide workflow history");
               } else {
                  $(this).text("Click to show workflow history");
               }
            });

            // // $("#onetidDoclibViewTbl0 tbody tr.ms-cellstyle.ms-vb2").click(function(){alert($(this).text());});
            $("#onetidDoclibViewTbl0 tbody tr td.ms-vb-icon").click(function(){
               var itemName = "http://sharepoint/DC/WF/BLS/ITSecurityReports/"+  $rows[1].Title+ "/" + $(this).find("img").attr("alt");
               try {
                  $("#previewpanel").html("<iframe src='"+ itemName + "' height='900' width='1000' type='application/pdf'></iframe");
               } catch (err) {
                  $("#previewpanel").html("Error loading preview for " + itemName);
               }
            });




            $("span#itemedit").click(function () {
               var path = _spPageContextInfo.webAbsoluteUrl + "/ITSecurityReports/forms/EditForm.aspx?ID=" + $(this).data("id");
               displayPopUpOptions(path, "", 800, 800, false); // url, title, width, height, close
            });
            
           $("#onetidDoclibViewTbl0 tbody tr td.ms-vb-icon").click();

         }
      }
   }
});

