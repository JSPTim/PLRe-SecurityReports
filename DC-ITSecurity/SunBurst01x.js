// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =====================================================================================================================


// <script src="/_catalogs/masterpage/bls/js/d3.js"></script>
// <script src="/_catalogs/masterpage/bls/js/crossfilter.js"></script>
// <script src="/_catalogs/masterpage/bls/js/dc.js"></script>



$(function() {
   // Make sure the SharePoint script file 'sp.js' is loaded before our code runs.
   SP.SOD.executeFunc("sp.js", "SP.ClientContext", sharePointReady);
 
   function sharePointReady() {
      $("#versioninfo").html("<h4>%%GULP_INJECT_VERSION%% d3:" + d3.version+"</h4>");
 
      // Dimensions of sunburst.
      var width = 1000;
      var height = 600;
      var radius = Math.min(width, height) / 2;

      // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
      var b = { w: 150, h: 60, s: 3, t: 10};

      // Mapping of segment labels to colors.
      var colors = {
         "R0": "#ffffff",
         "LU": "#e04303",
         "LI": "#3681b5",
         "FU": "#e27245",
         "FI": "#709cbc",
         "I0" : "#1B2952",
         "I1" : "#273961",
         "I2" : "#334970",
         "I3" : "#3F597F",
         "I4" : "#4B698E",
         "I5" : "#57799D",
         "I6" : "#6389AC",
         "I7" : "#6F99BB",
         "I8" : "#7BA9CA",
         "I9" : "#87B9D9",
         "I10" : "#93C9E8",
         "U0" : "#C82C00",
         "U1" : "#CD3701",
         "U2" : "#D24202",
         "U3" : "#D74D03",
         "U4" : "#DC5804",
         "U5" : "#E16305",
         "U6" : "#E66E06",
         "U7" : "#EB7907",
         "U8" : "#F08408",
         "U9" : "#F58F09",
         "U10" : "#FA9A0A",
      };


      // Total size of all segments; we set this later, after loading the data.
      //   var totalSize = 0; 

      //   var vis = d3.select("#chart").append("svg:svg")
      //      .attr("width", width)
      //      .attr("height", height)
      //      .append("svg:g")
      //      .attr("id", "container")
      //      .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      //   var partition = d3.partition()
      //      .size([2 * Math.PI, radius * radius]);

      //   var arc = d3.arc()
      //      .startAngle(function(d) { return d.x0; })
      //      .endAngle(function(d) { return d.x1; })
      //      .innerRadius(function(d) { return Math.sqrt(d.y0); })
      //      .outerRadius(function(d) { return Math.sqrt(d.y1); });

     
      var color = d3.scale.category20c();
     
      var partition = d3.layout.partition()
         .size([2 * Math.PI, radius])
         .value(function(d) { return d.size; });
     
      var arc = d3.svg.arc()
         .startAngle(function(d) { return d.x; })
         .endAngle(function(d) { return d.x + d.dx; })
         .innerRadius(function(d) { return d.y; })
         .outerRadius(function(d) { return d.y + d.dy; });
     
      var svg = d3.select("body").append("svg")
         .attr("width", width)
         .attr("height", height)
         .append("g")
         .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");
     



      // Use d3.text and d3.csvParseRows so that we do not need to have a header
      // row, and can receive the csv as an array of arrays.

      var typekey = {"LI":"Library", "LU":"Library - Broken Inheritance", "FI":"Folder", "FU":"Folder - Broken Inheritance"};

      var serverRelativeUrlOfMyFile = "/SiteAuditLogs/DC_DCIT-sunburst.csv";
      $("#sitename").text(serverRelativeUrlOfMyFile);
      $.ajax({url: serverRelativeUrlOfMyFile, type: "GET" }).done(handler);

      function handler(data){
            
         var lines = data.split("\r");
         // build the data collections we need firstly turn the input into lines it has three parts so process each in turn 
         // get the data source and built the correct objects or json to begin to render  them 
         var libs = [];
         for (var i = 0; i<lines.length; i++){
            if (lines[i].indexOf("[PART") > -1) {break;} else {libs.push(lines[i]);}
         }
         var libsObj = csvArrayToObjects(libs);

         var structure = [];
         for (var j = i+1; j<lines.length; j++){
            if (lines[j].indexOf("[PART") > -1){break;} else { structure.push(lines[j]);}
         }
         var json = buildHierarchy(structure);

         var perms = [];
         for (var k = j+1; k<lines.length; k++) {perms.push(lines[k]);}
         perms.splice(-1); // remove the last empty line
         var permsObj = csvArrayToObjects(perms);

         // PART 2
         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | Obtained " + perms.length + " items so far");

         Build_UITable(libsObj, set_ListInfoTableParamaters(), "#libs", "name", 1);
         $("#libs .listoutput tbody td[data-source='LHIDDEN'][data-value='True']").closest("tr").hide(); 
         $("#libs .listoutput tbody td[data-source='LTYPE'][data-value='GenericList']").closest("tr").hide(); 

         $("#libs .listoutput tbody tr").click(function(r){
            alert ($(this).find("td[data-source='LNAME']").data("value")+"|LI");
         });
             
         


        
         var root = d3.hierarchy(json)
            .sum(function(d) {return d.size; })
            .sort(function(a, b) { return b.value - a.value; });

       
         // For efficiency, filter nodes to keep only those large enough to see.
        //  var nodes = partition(root).descendants()
        //     .filter(function(d) {
        //        return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
        //     });

        
         path = svg.data([root]).selectAll("path")
            .data(partition.nodes)
            .enter().append("path")
            .attr("d", arc)
            .style("fill", function(d) { return colors["U2"];})
            .on("click", magnify)
            .each(stash);

        
         // Distort the specified node to 80% of its parent.
         function magnify(node) {
            if (parent = node.parent) {
               var parent,
                  x = parent.x,
                  k = .8;
               parent.children.forEach(function(sibling) {
                  x += reposition(sibling, x, sibling === node
                     ? parent.dx * k / node.value
                     : parent.dx * (1 - k) / (parent.value - node.value));
               });
            } else {
               reposition(node, 0, node.dx / node.value);
            }
        
            path.transition()
               .duration(750)
               .attrTween("d", arcTween);
         }
        
         // Recursively reposition the node at position x with scale k.
         function reposition(node, x, k) {
            node.x = x;
            if (node.children && (n = node.children.length)) {
               var i = -1, n;
               while (++i < n) x += reposition(node.children[i], x, k);
            }
            return node.dx = node.value * k;
         }
        
         // Stash the old values for transition.
         function stash(d) {
            d.x0 = d.x;
            d.dx0 = d.dx;
         }
        
         // Interpolate the arcs in data space.
         function arcTween(a) {
            var i = d3.interpolate({x: a.x0, dx: a.dx0}, a);
            return function(t) {
               var b = i(t);
               a.x0 = b.x;
               a.dx0 = b.dx;
               return arc(b);
            };
         }
        
        
           



         //====================================================================================================




         //====================================================================================================




         //  //Fade all but the current sequence, and show it in the breadcrumb trail.
         //  function dobreadcrumbs(d) {

         //     var percentage = (100 * d.value / totalSize).toPrecision(3);
         //     var percentageString = percentage + "%";
         //     if (percentage < 0.1) {
         //        percentageString = "< 0.1%";
         //     }

         //     d3.select("#percentage")
         //        .text(percentageString);

         //     d3.select("#explanation")
         //        .style("visibility", "");

         //     var sequenceArray = d.ancestors().reverse();
         //     sequenceArray.shift(); // remove root node from the array
         //     updateBreadcrumbs(sequenceArray, percentageString);

         //     // Fade all the segments.
         //     d3.selectAll("path")
         //        .style("opacity", 0.4);

         //     // Then highlight only those that are an ancestor of the current segment.
         //     vis.selectAll("path")
         //        .filter(function(node) {
         //           return (sequenceArray.indexOf(node) >= 0);
         //        })
         //        .style("opacity", 1);
         //  }

         //  //Restore everything to full opacity when moving off the visualization.
         //  function restore(d) {

         //     // Hide the breadcrumb trail
         //     d3.select("#trail")
         //        .style("visibility", "hidden");

         //     // Transition each segment to full opacity and then reactivate it.
         //     d3.selectAll("path")
         //        .transition()
         //        .duration(1000)
         //        .style("opacity", 1)
         //     ;

         //     d3.select("#explanation")
         //        .style("visibility", "hidden");
         //  }

         //  function initializeBreadcrumbTrail() {
         //     // Add the svg area.
         //     var trail = d3.select("#sequence").append("svg:svg")
         //        .attr("width", width)
         //        .attr("height", 120)
         //        .attr("id", "trail");
         //        // Add the label at the end, for the percentage.
         //     trail.append("svg:text")
         //        .attr("id", "endlabel")
         //        .style("fill", "#000");
         //  }

         //  // Generate a string that describes the points of a breadcrumb polygon.
         //  function breadcrumbPoints(d, i) {
         //     var points = [];
         //     points.push("0,0");
         //     points.push(b.w + ",0");
         //     points.push(b.w + b.t + "," + (b.h / 2));
         //     points.push(b.w + "," + b.h);
         //     points.push("0," + b.h);
         //     if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
         //        points.push(b.t + "," + (b.h / 2));
         //     }
         //     return points.join(" ");
         //  }

         //  // Update the breadcrumb trail to show the current sequence and percentage.
         //  function updateBreadcrumbs(nodeArray, percentageString) {

         //     // Data join; key function combines name and depth (= position in sequence).
         //     var trail = d3.select("#trail")
         //        .selectAll("g")
         //        .data(nodeArray, function(d) { return d.data.name + d.depth; });

         //        // Remove exiting nodes.
         //     trail.exit().remove();

         //     // Add breadcrumb and label for entering nodes.
         //     var entering = trail.enter().append("svg:g");

         //     entering.append("svg:polygon")
         //        .attr("points", breadcrumbPoints)
         //        .style("fill", function(d) { return colors[d.data.name.split("|")[1]]; });

         //     entering.append("svg:text").selectAll("tspan")
         //        .data(function(d) {return stringChunk(d.data.name.split("|")[0], 12); })
         //        .enter().append("tspan")
         //        .attr("x",  (b.w + b.t) / 2)
         //        .attr("y", function(d,i){ return 20+(i*20); })
         //        .attr("dy", "0.35em")
         //        .attr("text-anchor", "middle")
         //        .attr("dominant-baseline", "middle")
         //        .text(function(d) { return d;})
         //     ;

         //     // Merge enter and update selections; set position for all nodes.
         //     entering.merge(trail).attr("transform", function(d, i) {
         //        return "translate(" + i * (b.w + b.s) + ", 0)";
         //     });

         //     // Now move and update the percentage at the end.
         //     // d3.select("#trail").select("#endlabel")
         //     //    .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
         //     //    .attr("y", b.h / 2)
         //     //    .attr("dy", "0.35em")
         //     //    .attr("text-anchor", "end")
         //     //    .attr("dominant-baseline", "middle")
         //     //    .text(percentageString);

         //     // Make the breadcrumb trail visible, if it's hidden.
         //     d3.select("#trail")
         //        .style("visibility", "");

         //  }
      }
   }
});



// Take a 2-column CSV and transform it into a hierarchical structure suitable
// for a partition layout. The first column is a sequence of step names, from
// root to leaf, separated by hyphens. The second column is a count of how 
// often that sequence occurred.
function buildHierarchy(csv) {
   var root = {"name": "root|R0", "children": []};
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
               childNode = {"name": nodeName, "children": []};
               children.push(childNode);
            }
            currentNode = childNode;
         } else {
            // Reached the end of the sequence; create a leaf node.
            childNode = {"name": nodeName, "size": size};
            children.push(childNode);
         }
      }
   }
   return JSON.stringify(root);
} 

function csvArrayToObjects(csv){
   //acceots a CSV file brough in as an  array of lines 
   var retObj = [];
   var thisObj = [];
   var fields = csv[0].split(",");
   //csv.shift();
   csv.forEach(function (p,i) {
      thisObj = [];
      thisObj["ID"] = i;
      var p1=p.split(",");
      p1.forEach(function (f,j) {
         thisObj[fields[j]] = f.trim();
      });
      retObj.push(thisObj);
   });
   return retObj;
}

function remove_bins(source_group) { // (source_group, bins... i think this gets called when i access the group from the chart}
   var bins = Array.prototype.slice.call(arguments, 1);
   return { all: function () { return source_group.all().filter(function (d) { return bins.indexOf(d.key) === -1; }); } };
}

function stringChunk(st, len){
   var textchunks = [];
   if (st.length > len){   
      var words = st.split(" ");
      var counter = 0; 
      var row=0;
      while (counter < words.length){
         textchunks.push("");
         while (textchunks[row].length <= len  && counter < words.length){
            textchunks[row] = textchunks[row] + " " + words[counter];
            counter ++;
         }
         textchunks[row] = textchunks[row].trim();
         row++;
      } 
   }else { 
      textchunks.push(st);
   } 
   return textchunks;
}