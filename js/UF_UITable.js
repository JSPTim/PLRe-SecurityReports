// =====================================================================================================================
/* eslint no-unused-vars: 0 */
/* eslint no-undef: 0 */
/* eslint no-inner-declarations: 0 */
// =====================================================================================================================

function Build_UITable(a, params, container, initSort, direction) {
   a.shift(); // dump the first row we don't need it we have a more sophisticated way of getting to the names
   if (initSort > "") {
      var e, d = 1;
      if (direction == -1) {
         d = -1;
      }
      a.sort(function (a, b) {
         e = 0;
         if (a[initSort] > b[initSort]) {
            e = 1;
         } else {
            if (a[initSort] < b[initSort]) {
               e = -1;
            }
         }
         return e * d;
      });
   }
   var fldOptions;
   var pHTML = "";
   var tHTML = "<div id='table-scroll'><table class='listoutput' id='uitable'><thead><tr class ='thtmlrow'>";
   var tFOOT = "";
   // build some bits of the header and footer:
   params.forEach(function (col) {
      // build the floaty panels we will need to show the column filters
      if (col.filter == "true") {
         var icon = "<i class='fa fa-filter' aria-hidden='true'></i>";
         fldOptions = get_distinctValueCount(a, col.field);
         pHTML += "<div id = 'filter" + col.field + "' class='filterpopup' data-source='" + col.field + "'>"; // build a filter panel
         fldOptions.shift(); // get rid of the first piece
         fldOptions.sort();
         fldOptions.forEach(function (itm, n) {
            pHTML += ("<div data-value='" + itm[0] + "'><input type='checkbox'  name='itm" + n + "'/> " + itm[0] + " (" + itm[1] + ")</div>");
         });
         // should they go here or at the container that was passed in ? 
         pHTML += "</div>"; // finish off the 
      } else {
         icon = "";
      }
      tHTML += "<th style='width:" + col.width + "%;' data-source='" + col.field + "' class ='clickable " + col.type + " " + col.class + "' ><span>" + col.name + "</span>&nbsp;" + icon + "</th>";
      tFOOT += "<td data-source='" + col.field + "' class ='clickable " + col.type + " " + col.class + "' ></td>";
   });
   tHTML += "</tr></thead><tbody>";
   // ok so lets loop through each row
   var cellData;
   a.forEach(function (row) {
      tHTML += "<tr data-itemno='" + row["ID"] + "'>";
      params.forEach(function (col) {
         cellData = row[col.field];
         if (cellData === undefined) {
            cellData = "";
         }
         tHTML += "<td class='" + col.type + " " + col.class + "' data-value='" + cellData + "' data-name='" + col.name + "' data-source='" + col.field + "'>" + cellData + "</td>";
      });
      tHTML += "</tr>";
   });
   tHTML += ("</tbody><tfoot><tr>" + tFOOT + "</td></tfoot></table></div>");
   $(container).html(tHTML); // place this into the dom so its a thing not a string
   $(container).append(pHTML); // bung in the panels  
   // ok so lets do the tidying up and decoration

   // hide the zero width columns
   params.forEach(function (col) {
      if (col.width == 0) {
         $(container + " .listoutput th[data-source='" + col.field + "']").hide();
         $(container + " .listoutput td[data-source='" + col.field + "']").hide();
      }
   });

   // format the Icons (finance specific)
   $(container + " .listoutput tbody td.icon").each(function () {
      var foundObject = getRowNoforField("field", $(this).data("source"), params);
      if (foundObject > -1) {
         if ($(this).text() > "") {
            var iconHTML = "<span title='This invoice is split to " + $(this).text() + "'>" + params[foundObject].format + "</span>";
            $(this).html(iconHTML);
         }
      }
   });

   // format the dates
   $(container + " .listoutput tbody td.date").each(function () {
      var foundObject = getRowNoforField("field", $(this).data("source"), params);
      if (foundObject > -1) {
         $(this).text(moment($(this).data("value")).format(params[foundObject].format));
         $(this).attr("data-sort", moment($(this).data("value")));
         if ($(this).text() == "Invalid date") {
            $(this).text("-");
         }
      }
   });

   //format the numbers
   $(container + " .listoutput tbody td.number").each(function () {
      var foundObject = getRowNoforField("field", $(this).data("source"), params);
      if (foundObject > -1) {
         $(this).text(numberToDP($(this).data("value"), params[foundObject].format));
      }
   });
   //format the other numbers can i just add un the selector to the above ? 
   $(container + " .listoutput tbody td.numbernototal").each(function () {
      var foundObject = getRowNoforField("field", $(this).data("source"), params);
      if (foundObject > -1) {
         $(this).text(numberToDP($(this).data("value"), params[foundObject].format));
      }
   });

   // SORT table click toggle order and clear the others
   $(container + " .listoutput thead th span").click(function () {
      var col = $(this).parent();
      if (!$(col).hasClass("up") && !$(col).hasClass("down")) {
         $(col).siblings().removeClass("up down");
         $(col).addClass("up");
      } else {
         $(col).toggleClass("up down");
      }
      if ($(col).hasClass("up")) {
         sortthisbodyon(container + " .listoutput", $(col).data("source"), "value", "1");
      } else {
         sortthisbodyon(container + " .listoutput", $(col).data("source"), "value", "-1");
      }
   });
}

// these are callable functions (i think  a namesace is the solutiin !! )
function recalc_numbers(container, fmt) {
   var col, coltotal;
   $(container + " table thead th.number").each(function (k, h) {
      coltotal = 0;
      col = $(h).data("source");
      $(container + " table tbody td[data-source='" + col + "']").each(function (i, n) {
         if ($(n).parent().css("display") !== "none") { // better test than :visible
            coltotal = coltotal + (parseFloat($(n).data("value")) || 0);
         }
      });
      $(container + " table tfoot td[data-source='" + col + "']").text(numberToDP(coltotal, fmt)).addClass("active");
   });
}

function adjust_numbers(container, col, fmt, factor, hideZero, posttext, showtotal) {
   var celltotal, coltotal = 0;
   $(container + " table tbody td[data-source='" + col + "']").each(function (i, n) {
      if ($(n).parent().css("display") !== "none") { // better test than :visible
         celltotal = parseFloat($(n).data("value")) || 0;
         if (celltotal == 0 && hideZero) {
            $(n).text("");
         } else {
            $(n).text(numberToDP((celltotal * factor), fmt) + posttext);
            coltotal = coltotal + celltotal;
         }
      }
   });
   if (showtotal) {
      $(container + " table tfoot td[data-source='" + col + "']").text(numberToDP((coltotal * factor), fmt)).addClass("active");
   }
   return (coltotal * factor); // as a nicity return the total 
}

function stack_Columns(container, dest, cols) {
   if (cols.length > 0) {
      $(container + " table tbody tr").each(function (i, row) {
         var destcell = $(row).find("td[data-source='" + dest + "']");
         cols.forEach(function (col) {
            destcell.append("<span class='stackedcell'>" + $(row).find("td[data-source='" + col + "']").text() + "</span>");
         });
      });
   }
}

function Iconify_Column(container, col, iconHTML) {
   //place the text if the column as the title of the icon 
   var cellTitle, thisCell;
   var iconcount = 0;
   $(container + " table tbody tr").each(function (i, row) {
      thisCell = $(row).find("td[data-source='" + col + "']");
      cellTitle = $(thisCell).text();
      if (cellTitle == "" || cellTitle == "false") {
         $(thisCell).html("");
      } else {
         $(thisCell).html(iconHTML);
         $(thisCell).attr("Title", cellTitle);
         iconcount++;
      }
   });
   return iconcount;
}

function JSON_replace(container, col, fld, col2) {
   // take a columns containing JSON and strip it out all apart from the one field in the JSON
   // col 2 if we want to pop it into another column
   var jsntxt = "";
   if (col2 == null) {
      col2 = col;
   } // did we get a second field?  if not use the first
   $(container + " table tbody td[data-source='" + col + "']").each(function (i, n) {
      var dCell = $(n).closest("tr").find("td[data-source='" + col2 + "']");
      try {
         jsntxt = $(n).data("value")[0][fld]; // note this is one item in the JSON 
      } catch (err) {
         try {
            var jsn = JSON.parse("[" + $(n).data("value")[0][fld] + "]");
            jsntxt = jsn[0][fld];
         } catch (err) {
            jsntxt = "";
         }
      }
      if (jsntxt === undefined) {
         jsntxt = "";
      }
      $(dCell).html(jsntxt.replace(/\|/g, "<br/>"));
      $(dCell).attr("data-value", jsntxt);
      $(dCell).attr("data-sort", jsntxt);
   });
}

function return_fieldfromJSON(jsn, fld) {
   //return a pipe separated string with all ofthe fields from a JSON block remove the last pipe
   var outStr = "";
   jsn.forEach(function (itm) {
      if (itm[fld] != "") {
         outStr += (itm[fld] + "|");
      }
   });
   return outStr.slice(0, -1);
}