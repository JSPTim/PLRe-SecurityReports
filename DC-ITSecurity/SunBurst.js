// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =====================================================================================================================

$(function() {
   // Make sure the SharePoint script file 'sp.js' is loaded before our code runs.
   SP.SOD.executeFunc("sp.js", "SP.ClientContext", sharePointReady);

   function sharePointReady() {
      $("#versioninfo").html("<h4>%%GULP_INJECT_VERSION%%</h4>");


      var width = 960,
         height = 700,
         radius = (Math.min(width, height) / 2) - 10;

               // Breadcrumb dimensions: width, height, spacing, width of tip/tail.
      var b = {
            w: 125, h: 30, s: 3, t: 10
         };
   
   

      var formatNumber = d3.format(",d");

      var x = d3.scaleLinear()
         .range([0, 2 * Math.PI]);

      var y = d3.scaleSqrt()
         .range([0, radius]);


      var colors = {
         "R0": "#ffffff",
         "LU": "#C10B1B",
         "LI": "#A2E099",
         "FU": "#f10B1B",
         "FI": "#D7E6CB",
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

      var partition = d3.partition();

      var arc = d3.arc()
         .startAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x0))); })
         .endAngle(function(d) { return Math.max(0, Math.min(2 * Math.PI, x(d.x1))); })
         .innerRadius(function(d) { return Math.max(0, y(d.y0)); })
         .outerRadius(function(d) { return Math.max(0, y(d.y1)); });

      var svg = d3.select("#sunburst").insert("svg")
         .attr("width", width)
         .attr("height", height)
         .append("g")
         .attr("transform", "translate(" + width / 2 + "," + (height / 2) + ")");

      var typekey = {"LI":"Library", "LU":"Library - Broken Inheritance", "FI":"Folder", "FU":"Folder - Broken Inheritance"};

      var serverRelativeUrlOfMyFile = "/SiteAuditLogs/DC_DCIT-sunburst.csv";
      $("#sitename").text(serverRelativeUrlOfMyFile);
      $.ajax({
         url: serverRelativeUrlOfMyFile,
         type: "GET"
      }).done(handler);
      function handler(data){
         $("footer").html(data);
         var csv = d3.csvParseRows(data);
         var root = buildHierarchy(csv);


         root = d3.hierarchy(root);
         root.sum(function(d) { return d.size; });
         svg.selectAll("path")
            .data(partition(root).descendants())
            .enter().append("path")
            .attr("stroke", "#005511")
            .attr("stroke-width", 1.5)
            .attr("d", arc)
            .style("fill", function(d) {var dtype = d.data.name.split("|")[1]; dtype = dtype.substr(0,2) ; return colors[dtype]; })
            .on("click", click)
            .on("mouseover", mouseover)
            .append("title")
            .text(function(d) {
               var dname,dtemp, dtype, ddetails;
               dname  = d.data.name.split("|")[0];
               if (dname != "root") {
                  dtemp = d.data.name.split("|")[1];
                  if(dtemp.length > 2){
                     dtype = dtemp.split("~")[0];
                     ddetails = dtemp.split("~")[1];
                     ddetails = ddetails.replace("&","\n").replace("&","\n");
                  } else {
                     ddetails = "";
                  }
               }
               if (dtype > ""){ 
                  if(dtype.charAt(0) == "I"){
                     typedesc = formatNumber(d.value) + " " + dname+ " documents";
                     dname = dtype;
                  } else {
                     if(dtype.charAt(0) == "U" ){
                        typedesc = formatNumber(d.value) +" " +dname+ " documents with broken inheritance";
                        dname = dtype;
                     } else { 
                        typedesc = "Item: " +dname + "\nType: " +typekey[dtype] + " Containing " +  formatNumber(d.value) +" items"; 
                     }
                  }
               } else { typedesc = d.data.name;}
               return "name: " + typedesc + "\ndtype: " + dtype + "\n"+ddetails +"\nfolder depth: " + formatNumber(d.depth); });
         // return typedesc + "\nfolder depth: " + formatNumber(d.depth); });
     


         function click(d) {
            svg.transition()
               .duration(750)
               .tween("scale", function() {
                  var xd = d3.interpolate(x.domain(), [d.x0, d.x1]),
                     yd = d3.interpolate(y.domain(), [d.y0, 1]),
                     yr = d3.interpolate(y.range(), [d.y0 ? 20 : 0, radius]);
                  return function(t) { x.domain(xd(t)); y.domain(yd(t)).range(yr(t)); };
               })
               .selectAll("path")
               .attrTween("d", function(d) { return function() { return arc(d); }; });
         }

         d3.select(self.frameElement).style("height", height + "px");
      }
      //});
   }
});



function buildHierarchy(csv) {
   var root = {"name": "root|R0", "children": []};
   for (var i = 0; i < csv.length; i++) {
      var sequence = csv[i][0];
      var size = +csv[i][1];
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
   return root;
}

