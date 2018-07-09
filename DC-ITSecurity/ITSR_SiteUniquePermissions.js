// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =====================================================================================================================
var $CurrentUserName = ""; // go figure
var $UserGroups = [];
var Inv = [];

$(function () {
   // Make sure the SharePoint script file 'sp.js' is loaded before our code runs.
   SP.SOD.executeFunc("sp.js", "SP.ClientContext", sharePointReady);
   function sharePointReady() {
      $("#versioninfo").html("<h4>%%GULP_INJECT_VERSION%%</h4>");
      $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | loading the security data  (Live / Archive / History)");
      var spContext = JSPgetUserContext();
      spContext.executeQueryAsync(function () {
         JSPGetUserGroups(spContext.get_web().get_currentUser());
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | User Data OK");

         // Check for the various File API support.
         if (window.File && window.FileReader && window.FileList && window.Blob) {
            // Great success! All the File APIs are supported.

         } else {
            alert("The File APIs are not fully supported in this browser.");
         }

         var txt="";
         var xmlhttp = new XMLHttpRequest();
         xmlhttp.onreadystatechange = function(){
            var txt;
            if(xmlhttp.status == 200 && xmlhttp.readyState == 4){
               txt = xmlhttp.responseText;
            }
         };
         xmlhttp.open("GET","/_catalogs/masterpage/bls/DC-ITSecurity/SiteSecurity.csv",false);
         xmlhttp.send();

         var SiteSecurity = $.csv.toObjects(xmlhttp.responseText);
         //row,item,kind,via,role,type,user

         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Obtained " + SiteSecurity.length + " items so far");
        
         var ndx = crossfilter(SiteSecurity);  
         var all = ndx.groupAll();

         var IDDimension = ndx.dimension(function (d) {return d.row;});
         // Dimensions (keep less than 8  

         var itemDimension = ndx.dimension(function (d) {return d.item;});
         var itemGroup     = itemDimension.group();
         print_filter(itemGroup);

         var viaDimension = ndx.dimension(function (d) {return d.via;});
         var viaGroup     = viaDimension.group();
         print_filter(viaGroup);

         var kindDimension = ndx.dimension(function (d) {return d.kind;});
         var kindGroup     = kindDimension.group();
         print_filter(kindGroup);

         var typeDimension = ndx.dimension(function (d) {return d.type;});
         var typeGroup     = typeDimension.group();
         print_filter(typeGroup);

         var roleDimension = ndx.dimension(function (d) {return d.role;});
         var roleGroup     = roleDimension.group();
         print_filter(roleGroup);

         var userDimension = ndx.dimension(function (d) {return d.user;});
         var userGroup     = userDimension.group();
         print_filter(userGroup);




         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | All groups built. Drawing charts 1") ;


         var folderAssignments = dc.rowChart("#ByFolder");
         
         folderAssignments.width(350)
            .height(500)
            .margins({top:10, bottom:0, right:0, left:0})
            .x(d3.scaleOrdinal().domain(itemDimension))
            .cap(12)
            .elasticX(true)
            .dimension(itemDimension)
            .group(itemGroup)
            .label(function (d) {return d.value + " : "+ d.key; })
            .title(function (d) {return "Value: "+ d.value; })
         ;
         folderAssignments.xAxis().ticks(4).tickFormat(function(d) { return d; });



         var cbox3        = dc.cboxMenu("#ByGroup");
         cbox3.width(600)
            .dimension(viaDimension)
            .group(viaGroup)
            .multiple(true)
            .controlsUseVisibility(false)
         ;
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Drawing charts 1") ;

         var cbox4 = dc.cboxMenu("#ByType");
         cbox4.width(300)
            .dimension(typeDimension)
            .group(typeGroup)
            .multiple(true)
            .controlsUseVisibility(false)
         ;
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Drawing charts 2") ;


         var pieChart    = dc.pieChart("#ByKind");
         pieChart.width(200)
            .height(200)
            .innerRadius(50)
            .radius(140)
            .cx(100)
            .minAngleForLabel(0.1)
            .dimension(kindDimension)
            .group(kindGroup)
         ;
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Drawing charts 3") ;

         var pieChart2    = dc.pieChart("#ByRole");
         pieChart2.width(200)
            .height(200)
            .innerRadius(50)
            .radius(140)
            .cx(100)
            .minAngleForLabel(0.1)
            .dimension(roleDimension)
            .group(roleGroup)
         ;
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Drawing charts 4") ;

         var cbox5        = dc.cboxMenu("#ByUser");
         cbox5.width(300)
            .dimension(userDimension)
            .group(userGroup)
            .multiple(true)
            .controlsUseVisibility(false)
         ;
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Drawing charts 5") ;


         // ========================================================================
         // TABLE 
         // =======================================================================
         // so now lets do the table of items to be exported 
         // ========================================================================
         // DRAW THE Table 
         // =======================================================================
         //   //item,kind,via,role,type,user
         var dataCount = dc.dataCount("#dc-datacount")
            .dimension(ndx)
            .group(all)
            .html({some: "List of up to 30 items - <button>Export %filter-count out of <strong>%total-count</strong>records to CSV</button>  <a href='javascript:dc.filterAll(); dc.renderAll();'>Clear filters</a>", 
               all:"List of up to 30 items - <button>Export all (%filter-count) records to CSV</button>" });

         var dataTable = dc.dataTable("#datatable");
         dataTable.width(1000)
            .height(500)
            .dimension(IDDimension)
            .group(function(d) {return d;})  
            .size(30)
            .showGroups(false) //_wfStatusChangeDate).getMonth();
            .columns([
               {label:"Title", format: function(d) {return d.item;}}, 
               {label:"Type Of Item", format: function(d) {return d.kind;}}, 
               {label:"Permission Level", format: function(d) {return d.role;}}, 
               {label:"Granted to", format: function(d) {return d.type;}}, 
               {label:"Granted through", format: function(d) {return d.via;}}, 
               {label:"Person or group", format: function(d) {return d.user;}}
                 
            ])
                     
            .sortBy(function(d){ return d.title;})
            .order(d3.ascending)
                   
         ;
         // dc.renderAll();
         //     $("#debuginfo").html("Charts for Paid expense Items");
         //     $("#debuginfo").text("Procesed OK");
         dc.renderAll();
       
         $("#Chart11 button").click(function(){ 
            var filename = "SecurityExport-"+moment().format("YYMMDD-HHMM")+"-"+safeName($CurrentUserName, "-")+".csv";
            var blob = new Blob([d3.csvFormat(IDDimension.top(Infinity))],
               {type: "text/csv;charset=utf-8"});
            saveAs(blob, filename);
         });
 
      });
   }
});

function remove_bins(source_group) { // (source_group, bins... i think this gets called when i access the group from the chart}
   var bins = Array.prototype.slice.call(arguments, 1);
   return { all: function () { return source_group.all().filter(function (d) { return bins.indexOf(d.key) === -1; }); } };
}





