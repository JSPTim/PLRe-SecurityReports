
var baseUrl =   "http://sharepoint/Shared/_api/search/";
var accordionContentIds = "0x0101005AD5F39AD12A1F44810143054354B8FA010300337067FFE5DD4D4BB9C823C533E54649";
  //extract from HTML into a flat list
        $(function () {
        	var baseUrl =   "http://sharepoint/Shared/_api/search/";
			var ContentIds = "0x0101005AD5F39AD12A1F44810143054354B8FA010300337067FFE5DD4D4BB9C823C533E54649";
			//build a URL
            var searchApiUrl = baseUrl + 'query?querytext=%27'  + ContentIds + '%27' + '&trimduplicates=false';
			$.ajax({url: searchApiUrl, method: "GET", headers: { "Accept": "application/json; odata=verbose" }, 
				success: onQuerySuccess, 
				error: onQueryError 
			});	
		});
		
		
		function onQuerySuccess(data) {
		    var allItems = [];  //contains the source data
			var results = data.d.query.PrimaryQueryResult.RelevantResults.Table.Rows.results
			$.each(results, function( key, val ) {
				alert(key);
			});
		}
		
		function onQueryError (data) {
		    alert("Error");
		}
