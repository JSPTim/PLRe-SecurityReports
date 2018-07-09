// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =====================================================================================================================

$(function() {
   // Make sure the SharePoint script file 'sp.js' is loaded before our code runs.
   SP.SOD.executeFunc("sp.js", "SP.ClientContext", sharePointReady);
 
   function sharePointReady() {
      $("#versioninfo").html("<h4>%%GULP_INJECT_VERSION%% d3:" + d3.version+ " dc:"+dc.version+"</h4>");
 
      // Mapping of segment labels to colors.
      var colors = {
         "R0": "#ffffff",
         "LU": "#e04303",
         "LI": "#3681b5",
         "FU": "#e27245",
         "FI": "#709cbc",
         "I0" : "#1b2952",
         "I1" : "#20aa20",
         "I2" : "#ff9e18 ",
         "I3" : "#e04303",
         "I4" : "#20eeee",
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
            var rowtitle = $(this).find("td[data-source='LNAME']").data("value")+"|LI";

            g.select("path title:contains(rowtitle)").on("click")();
           
         });
        
         function highlightthis(txt){
            $("#libs .listoutput tbody tr").removeClass("highlighted"); 
            $("#libs .listoutput tbody tr td[data-value='"+txt.trim()+"']").closest("tr").addClass("highlighted"); 
         }


         /// set uop the D3 stuff 
         // Dimensions of sunburst.
         var width = 1000;
         var height = 600;
         var radius = Math.min(width, height) / 2;

         // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
         var b = { w: 110, h: 60, s: 2, t: 5};

 
         // Total size of all segments; we set this later, after loading the data.
         var totalSize = 0; 

         var vis = d3.select("#sunburst").append("svg:svg")
            .attr("width", width)
            .attr("height", height)
            .append("svg:g")
            .attr("id", "container")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

         var partition = d3.partition()
            .size([2 * Math.PI, radius*radius]);

         var arc = d3.arc()
            .startAngle(function(d) { return d.x0; })
            .endAngle(function(d) { return d.x1; })
            .innerRadius(function(d) { return Math.sqrt(d.y0); })
            .outerRadius(function(d) { return Math.sqrt(d.y1); });


         createVisualization(json);
  
         // Main function to draw and set up the visualization, once we have the data.
         function createVisualization(json) {

            // Basic setup of page elements.
            initializeBreadcrumbTrail();

            // Bounding circle underneath the sunburst, to make it easier to detect
            // when the mouse leaves the parent g.
            vis.append("svg:circle")
               .attr("r", radius)
               .style("opacity", 0);

            // Turn the data into a d3 hierarchy and calculate the sums.
            var root = d3.hierarchy(json)
               .sum(function(d) {return d.size; })
               .sort(function(a, b) { return b.value - a.value; });
  
          
            // For efficiency, filter nodes to keep only those large enough to see.
            var nodes = partition(root).descendants()
               .filter(function(d) {
                  return (d.x1 - d.x0 > 0.005); // 0.005 radians = 0.29 degrees
               });
            // how avout this is if it's the descendents  collection? 

            var sunburst = vis.data([json]).selectAll("path")
               .data(nodes)
               .enter().append("g").attr("class", "node").append("svg:path")
               .attr("display", function(d) { return d.depth ? null : "none"; })
               .attr("d", arc)
               .style("opacity", 1)
               .style("fill", function(d) { var dtype = d.data.name.split("|")[1]; dtype = dtype.substr(0,2) ; return colors[dtype];})
               .on("click", magnify).each(stash)
               //.append("title")
               //.text(function(d) {return d.data.name + "\nDepth"+ d.depth+ "\nCount"+ d.descendants().length;})
            ;
              
            // Populate the <text> elements with our data-driven titles.
            d3.selectAll("g.node")
               .append("text")
               .attr("text-anchor", "start")
               .style("opacity", 0.3)
               .attr("transform", function(d) {return "translate(" + arc.centroid(d) + ")rotate(" + computeTextRotation(d) + ")"; })
               .attr("dx", "20") // radius margin
               .attr("dy", ".5em") // rotation align
               .text(function(d) { 
                  if(d.descendants().length == 1)  {
                     return  d.data.name; 
                  } else {
                     return "";
                  }
               })
               .on("mouseover", function(d){this.style.opacity = 1;})
               .on("mouseout",  function(d){this.style.opacity = 0.3;})
            ;

            // Add the mouseleave handler to the bounding circle.
            d3.select("#container").on("mouseleave", restore);

            // Get total size of the tree = value of root node from partition.
            totalSize = sunburst.datum().value;
        
            //====================================================================================================

            // Distort the specified node to 80% of its parent.
            function magnify(node) {
               var parent;
               if (parent = node.parent) {
                  //var parent;
                  var x = parent.x;
                  var k = .8;
                  parent.children.forEach(function(sibling) {
                     x += reposition(sibling, x, sibling === node
                        ? parent.dx * k / node.value
                        : parent.dx * (1 - k) / (parent.value - node.value));
                  });
               } else {
                  reposition(node, 0, node.dx / node.value);
               }
    
               sunburst.transition()
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

         }

         //====================================================================================================



         function computeTextRotation(d) {
            var angle = (d.x0 + d.x1) / Math.PI * 90;
            // Avoid upside-down labels
            //return (angle < 120 || angle > 270) ? angle : angle + 180;  // labels as rims
            return (angle < 180) ? angle - 90 : angle + 90;  // labels as spokes
            //return (x((d.x0 + d.x1)/2) - Math.PI / 2) / Math.PI * 180;
         }


         //Fade all but the current sequence, and show it in the breadcrumb trail.
         function dobreadcrumbs(d) {
            var percentage = (100 * d.value / totalSize).toPrecision(3);
            var percentageString = percentage + "%";
            if (percentage < 0.1) {
               percentageString = "< 0.1%";
            }

            d3.select("#percentage")
               .text(percentageString);

            d3.select("#explanation")
               .style("visibility", "");

            var sequenceArray = d.ancestors().reverse();
            sequenceArray.shift(); // remove root node from the array
            highlightthis(sequenceArray[0].data.name.split("|")[0]);
            updateBreadcrumbs(sequenceArray, percentageString);

            // Fade all the segments.
            d3.selectAll("path")
               .style("opacity", 0.4);

            // Then highlight only those that are an ancestor of the current segment.
            vis.selectAll("path")
               .filter(function(node) {
                  return (sequenceArray.indexOf(node) >= 0);
               })
               .style("opacity", 1);
         }

         //Restore everything to full opacity when moving off the visualization.
         function restore(d) {

            // Hide the breadcrumb trail
            d3.select("#trail")
               .style("visibility", "hidden");

            // Transition each segment to full opacity and then reactivate it.
            d3.selectAll("path")
               .transition()
               .duration(400)
               .style("opacity", 1)
            ;

            d3.select("#explanation")
               .style("visibility", "hidden");
         }

         function initializeBreadcrumbTrail() {
            // Add the svg area.
            var trail = d3.select("#sequence").append("svg:svg")
               .attr("width", width)
               .attr("height", 100)
               .attr("id", "trail");
               // Add the label at the end, for the percentage.
            trail.append("svg:text")
               .attr("id", "endlabel")
               .style("fill", "#000");
         }

         // Generate a string that describes the points of a breadcrumb polygon.
         function breadcrumbPoints(d, i) {
            var points = [];
            points.push("0,0");
            points.push(b.w + ",0");
            points.push(b.w + b.t + "," + (b.h / 2));
            points.push(b.w + "," + b.h);
            points.push("0," + b.h);
            if (i > 0) { // Leftmost breadcrumb; don't include 6th vertex.
               points.push(b.t + "," + (b.h / 2));
            }
            return points.join(" ");
         }

         // Update the breadcrumb trail to show the current sequence and percentage.
         function updateBreadcrumbs(nodeArray, percentageString) {

            // Data join; key function combines name and depth (= position in sequence).
            var trail = d3.select("#trail")
               .selectAll("g")
               .data(nodeArray, function(d) { return d.data.name + d.depth; });

               // Remove exiting nodes.
            trail.exit().remove();

            // Add breadcrumb and label for entering nodes.
            var entering = trail.enter().append("svg:g");

            entering.append("svg:polygon")
               .attr("points", breadcrumbPoints)
               .style("fill", function(d) { return colors[d.data.name.split("|")[1]]; });

            entering.append("svg:text").selectAll("tspan")
               .data(function(d) {return stringChunk(d.data.name.split("|")[0], 10); })
               .enter().append("tspan")
               .attr("x",  (b.w + b.t) / 2)
               .attr("y", function(d,i){ return 10+(i*20); })
               .attr("dy", "0.35em")
               .attr("text-anchor", "middle")
               .attr("dominant-baseline", "middle")
               .text(function(d) { return d;})
            ;

            // Merge enter and update selections; set position for all nodes.
            entering.merge(trail).attr("transform", function(d, i) {
               return "translate(" + i * (b.w + b.s) + ", 0)";
            });

            // Now move and update the percentage at the end.
            // d3.select("#trail").select("#endlabel")
            //    .attr("x", (nodeArray.length + 0.5) * (b.w + b.s))
            //    .attr("y", b.h / 2)
            //    .attr("dy", "0.35em")
            //    .attr("text-anchor", "end")
            //    .attr("dominant-baseline", "middle")
            //    .text(percentageString);

            // Make the breadcrumb trail visible, if it's hidden.
            d3.select("#trail")
               .style("visibility", "");

         }

         var ndx = crossfilter(permsObj);  
         //   // var all = ndx.groupAll();

         var IDDimension = ndx.dimension(function (d) {return d.row;});

         var kindDimension = ndx.dimension(function (d) {return d.kind;});
         var kindGroup     = kindDimension.group();
         print_filter(kindGroup);

         var typeDimension = ndx.dimension(function (d) {return d.type;});
         var typeGroup     = typeDimension.group();
         print_filter(typeGroup);

         var viaDimension = ndx.dimension(function (d) {return d.via;});
         var viaGroup     = viaDimension.group();
         print_filter(viaGroup);

         var roleDimension = ndx.dimension(function (d) {return d.role;});
         var roleGroup     = roleDimension.group();
         print_filter(roleGroup);

         var userDimension = ndx.dimension(function (d) {return d.user;});
         var userGroup     = userDimension.group();
         print_filter(userGroup);


         $("#debuginfo").html("<i class='fa fa-spinner fa-spin'></i> | All groups built. Drawing charts 1") ;

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


         dc.renderAll();

      }
   }
});


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

