
class UtilityFunctionsJSP {
         camelSpaces(string) {
                string = string.replace(/([a-z])([A-Z])/g, "$1 $2");
                string = string.replace(/([A-Z])([A-Z][a-z])/g, "$1 $2");
                return string;
             }

             getSPListItemCollection(data){
                const obj = data.find(f => f["_ObjectType_"] === 'SP.ListItemCollection');
                return obj["_Child_Items_"];
             }

             buildDataRowsPlusFields(data) {
                //so an introspective function that builds an array from the data with the first row being the column names
                //saves on global variables
                
                var rw = [];
                var fields = [];
                var thisVar;
                var ListItem;
                var rows = []; // im goign to return this array
                // im using a pattern of building an array of values from the query
                //but Firstly lets examine the  item to get its field names
             
                for (var i = 0; i < data.get_count(); i++) {
                   ListItem = data.getItemAtIndex(i);
             
                   if (i == 0) { // first time through lets just do soem JSON fiddling andf get an array of fields
                      rw = [];
                      var intFieldList = JSON.stringify(ListItem.get_fieldValues());
                      intFields = JSON.parse("[" + intFieldList + "]");
                      fieldKeys = Object.keys(intFields[0]);
                      fieldKeys.forEach(function(k) {
                         fields.push(k); // build an array of field names
                         rw[k] = k; // start the associative array of field names it will become the first row of data
                      });
                      rows.push(rw);
                   }
             
                   //foreach(ListItem in data) {
                   rw = [];
             
                   for (var j = 0; j < fields.length; j++) {
                      thisVar = ListItem.get_fieldValues()[fields[j]];
                      //if(i==0){ thisVar );}
                      if (thisVar == null) {
                         // its a start but lets test for no value or null
                         rw[fields[j]] = ""; // get the easy case out of the way
                      } else {
                         // so what else may it be?
                         if (thisVar instanceof Date) { // so turn it into a moment
                            rw[fields[j]] = moment(thisVar); // we can use format when rendering now
                         } else { // so the anticipation mounts
                            if (thisVar instanceof Object) { // object the bloody catch all
                               try { // still may have a nasty or two
                                  rw[fields[j]] = thisVar.get_lookupValue(); // see if its not an aray just a sigle value then get it
                               } catch (err) {
                                  rw[fields[j]] = stringifyCSOMItem(thisVar); // so turn it into a string so i can print it easilly  or split it
                               }
                            } else { // what a let down but its easy and safe
                               rw[fields[j]] = thisVar; // Nothign to do it must be a primitive number of a string
                            }
                         }
                      }
             
                   }
                   rows.push(rw);
                }
                return rows;
             }

             
}

export default UtilityFunctionsJSP;