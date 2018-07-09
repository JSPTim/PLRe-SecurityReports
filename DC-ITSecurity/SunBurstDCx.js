// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =====================================================================================================================

$(function () {
   // Make sure the SharePoint script file 'sp.js' is loaded before our code runs.
   SP.SOD.executeFunc("sp.js", "SP.ClientContext", sharePointReady);

   function sharePointReady() {
      $("#versioninfo").html("<h4>%%GULP_INJECT_VERSION%% d3:" + d3.version + " dc:" + dc.version + "</h4>");

      // Mapping of segment labels to colors.
      var colorNames = {
         "LU": 0,
         "LI": 1,
         "FU": 2,
         "FI": 3,
         "I0": 4,
         "I1": 5,
         "I2": 6,
         "I3": 7,
         "I4": 8,
         "U0": 9,
         "U1": 10,
         "U2": 11,
         "U3": 12,
         "U4": 13
      };

      var ocolors = [
         "#e04303",
         "#3681b5",
         "#e27245",
         "#709cbc",
         "#1b2952",
         "#20aa20",
         "#ff9e18",
         "#e04303",
         "#20eeee",
         "#C82C00",
         "#CD3701",
         "#D24202",
         "#D74D03",
         "#DC5804"
      ];

      var b = { w: 110, h: 60, s: 2, t: 5};

 
      // Total size of all segments; we set this later, after loading the data.
      var totalSize = 0; 
      var $filter;

      var typekey = {
         "LI": "Library",
         "LU": "Library - Broken Inheritance",
         "FI": "Folder",
         "FU": "Folder - Broken Inheritance"
      };

      var serverRelativeUrlOfMyFile = "/SiteAuditLogs/EU_EUFINANCE-sunburst.csv";
      $("#sitename").text(serverRelativeUrlOfMyFile);
      $.ajax({
         url: serverRelativeUrlOfMyFile,
         type: "GET"
      }).done(handler);

      function handler(data) {

         var lines = data.split("\r");
         // build the data collections we need firstly turn the input into lines it has three parts so process each in turn 
         // get the data source and built the correct objects or json to begin to render  them 
         var libs = [];
         for (var i = 0; i < lines.length; i++) {
            if (lines[i].indexOf("[PART") > -1) {
               break;
            } else {
               libs.push(lines[i]);
            }
         }
         var libsObj = csvArrayToObjects(libs);

         var structure = [];
         for (var j = i + 1; j < lines.length; j++) {
            if (lines[j].indexOf("[PART") > -1) {
               break;
            } else {
               structure.push(lines[j].substr(1));
            }
         }
         var json = buildHierarchy(structure);

         var perms = [];
         for (var k = j + 1; k < lines.length; k++) {
            perms.push(lines[k]);
         }
         perms.splice(-1); // remove the last empty line
         var permsObj = csvArrayToObjects(perms);
         permsObj.shift(); // get rid of the titles

         // PART 2
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Obtained " + perms.length + " items so far");

         Build_UITable(libsObj, set_ListInfoTableParamaters(), "#libs", "name", 1);
         $("#libs .listoutput tbody td[data-source='LHIDDEN'][data-value='True']").closest("tr").hide();
         $("#libs .listoutput tbody td[data-source='LTYPE'][data-value='GenericList']").closest("tr").hide();

         

         //  function highlightthis(txt) {
         //     $("#libs .listoutput tbody tr").removeClass("highlighted");
         //     $("#libs .listoutput tbody tr td[data-value='" + txt.trim() + "']").closest("tr").addClass("highlighted");
         //  }









         var ndx0 = crossfilter(structure);
         var filesDimension = ndx0.dimension(function (d) {
            return d.split("¬")[0].split("/");
         });

         var filesGroup = filesDimension.group().reduceSum(function (d) {
            return d.split("¬")[1];
         });
         //print_filter(filesGroup);

         var LibDimension = ndx0.dimension(function (d) {
            return d.split("¬")[0].split("/")[0];
         });
         //print_filter(LibDimension);

         var LibGroup = LibDimension.group().reduceSum(function (d) {
            return d.split("¬")[1];
         });
         //print_filter(LibGroup);

         //initializeBreadcrumbTrail();

         var fileChart = dc.sunburstChart("#sunburst");

         fileChart
            .width(700)
            .height(550)
            .cx(350)
            .dimension(filesDimension)
            .group(filesGroup)
            .innerRadius(90)
            .ordinalColors(ocolors)
            .colorAccessor(function (d, i) {
               return colorNames[d.key.split("|")[1]];
            })
            .minAngleForLabel(0.1)
            .label(function (d) {
               if (d.depth == 1) {
                  return d.key.split("|")[0];
               } else {
                  if (d.height == 0) {
                     return (d.key.split("|")[0] + "(" + d.value + ")");
                  } else {
                     return "";
                  }
               }
            })
            
            // .on("filtered.monitor", function(chart, filter) {
            //     updateBreadcrumbs(filter);// report the filter applied
            // })
         // .legend(dc.legend())
         ;

         $("#libs .listoutput tbody tr").click(function (r) {
            var rowtitle = $(this).find("td[data-source='LNAME']").data("value") + "|LI";
            alert(rowtitle);
           
         });


         var LibChart = dc.cboxMenu("#test2");
         LibChart.width(350)
            .dimension(LibDimension)
            .group(LibGroup)
            .multiple(true)
            .controlsUseVisibility(false);

         dc.renderAll();

         var ndx = crossfilter(permsObj);
         //   // var all = ndx.groupAll();

         var IDDimension = ndx.dimension(function (d) {
            return d.row;
         });

         var kindDimension = ndx.dimension(function (d) {
            return d.kind;
         });
         var kindGroup = kindDimension.group();
         print_filter(kindGroup);

         var typeDimension = ndx.dimension(function (d) {
            return d.type;
         });
         var typeGroup = typeDimension.group();
         print_filter(typeGroup);

         var viaDimension = ndx.dimension(function (d) {
            return d.via;
         });
         var viaGroup = viaDimension.group();
         print_filter(viaGroup);

         var roleDimension = ndx.dimension(function (d) {
            return d.role;
         });
         var roleGroup = roleDimension.group();
         print_filter(roleGroup);

         var userDimension = ndx.dimension(function (d) {
            return d.user;
         });
         var userGroup = userDimension.group();
         print_filter(userGroup);


         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | All groups built. Drawing charts 1");

         var cbox3 = dc.cboxMenu("#ByFolder");
         cbox3.width(600)
            .dimension(viaDimension)
            .group(viaGroup)
            .multiple(true)
            .controlsUseVisibility(false);
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Drawing charts 1");

         var cbox4 = dc.cboxMenu("#ByType");
         cbox4.width(300)
            .dimension(typeDimension)
            .group(typeGroup)
            .multiple(true)
            .controlsUseVisibility(false);
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Drawing charts 2");

         var pieChart = dc.pieChart("#ByKind");
         pieChart.width(200)
            .height(200)
            .innerRadius(50)
            .radius(140)
            .cx(100)
            .minAngleForLabel(0.1)
            .dimension(kindDimension)
            .group(kindGroup);
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Drawing charts 3");



         var roleChart = dc.cboxMenu("#ByRole");
         roleChart.width(350)
            .dimension(roleDimension)
            .group(roleGroup)
            .multiple(true)
            .controlsUseVisibility(false);



         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Drawing charts 4");

         var cbox5 = dc.cboxMenu("#ByUser");
         cbox5.width(300)
            .dimension(userDimension)
            .group(userGroup)
            .multiple(true)
            .controlsUseVisibility(false)
            // .on("filtered.monitor", function () {  

            //    $("#versioninfo").click();
            // })
         ;

         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Drawing charts 5");
         //filesDimension.filter(["", "4.0"]);
         //   ndx2.remove();
         //   stageDimension.filterRange(["9.9", "Z"]);
         //    ndx2.remove();
         //    stageDimension.filterAll();

         var dcfilter = dc.textFilterWidget("#inputfilter");
         dcfilter.dimension(userDimension)
            .placeHolder("enter a name");

         dc.dataTable("#Chart11")
     
            .dimension(IDDimension)
            .group(function (d) {return "Jazz"; })
            .columns([
               function (d) {return d.kind;},
               function (d) { return d.item;},
               function (d) { return d.role;},
               function (d) { return d.via;},
               function (d) { return d.type;},
               function (d) { return d.user;},
            ])
         ;

         $("#debuginfo").html("Done.");

         dc.renderAll();
         var requiredFields = ["item", "kind", "role", "type", "user", "via"];
         var FieldNames =["item", "kind", "role", "type", "user", "via"];

         $("#versioninfo").click(function () {
            var SubSet = [];
            var temp = [];
            var dimData = IDDimension.top(Infinity);
            dimData.forEach(function (x) {
               requiredFields.forEach(function (f, i) {
                  temp[FieldNames[i]] = x[f];
               });
               SubSet.push(temp);
               temp = [];
            });
            Build_UITable(SubSet, set_SecurityDetailTableParamaters(), "#datatable", "name", 1);
         });
      }
   }
});



// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
   var root = {
      "name": "root|R0",
      "children": []
   };
   for (var i = 0; i < csv.length; i++) {
      var sequence = csv[i].split(",")[0];
      var size = +csv[i].split(",")[1];
      if (isNaN(size)) { // e.g. if this is a header row
         continue;
      }
      var parts = sequence.split("/");
      var currentNode = root;
      for (var j = 0; j < parts.length; j++) {
         var children = currentNode["children"];
         var nodeName = parts[j];
         var childNode;
         if (j + 1 < parts.length) {
            // Not yet at the end of the sequence; move down the tree.
            var foundChild = false;
            for (var k = 0; k < children.length; k++) {
               if (children[k]["name"] == nodeName) {
                  childNode = children[k];
                  foundChild = true;
                  break;
               }
            }
            // If we don't already have a child node for this branch, create it.
            if (!foundChild) {
               childNode = {
                  "name": nodeName,
                  "children": []
               };
               children.push(childNode);
            }
            currentNode = childNode;
         } else {
            // Reached the end of the sequence; create a leaf node.
            childNode = {
               "name": nodeName,
               "size": size
            };
            children.push(childNode);
         }
      }
   }
   return root;
}

function csvArrayToObjects(csv) {
   //accets a CSV file brought in as an  array of lines the first row are the column names
   var retObj = [];
   var thisObj = [];
   var fields = csv[0].split(",");
   //csv.shift();
   csv.forEach(function (p, i) {
      thisObj = [];
      thisObj["ID"] = i;
      var p1 = p.split(",");
      p1.forEach(function (f, j) {
         thisObj[fields[j]] = f.trim();
      });
      retObj.push(thisObj);
   });
   return retObj;
}

function remove_bins(source_group) { // (source_group, bins... i think this gets called when i access the group from the chart}
   var bins = Array.prototype.slice.call(arguments, 1);
   return {
      all: function () {
         return source_group.all().filter(function (d) {
            return bins.indexOf(d.key) === -1;
         });
      }
   };
}

function stringChunk(st, len) {
   var textchunks = [];
   if (st.length > len) {
      var words = st.split(" ");
      var counter = 0;
      var row = 0;
      while (counter < words.length) {
         textchunks.push("");
         while (textchunks[row].length <= len && counter < words.length) {
            textchunks[row] = textchunks[row] + " " + words[counter];
            counter++;
         }
         textchunks[row] = textchunks[row].trim();
         row++;
      }
   } else {
      textchunks.push(st);
   }
   return textchunks;
}