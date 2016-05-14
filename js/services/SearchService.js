/**
 * Created by Duo on 22-Mar-16.
 */

app.factory('SearchService', function($http){
    var SearchService = {};
    var server = 'http://144.6.231.77/landsat/query?query=';
    var getAll = server + 'query=PREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0APREFIX+geosparql%3A+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23%3E%0APREFIX+geos%3A+%3Chttp%3A%2F%2Fwww.telegraphis.net%2Fontology%2Fgeography%2Fgeography%23%3E%0APREFIX+geosp%3A+%3Chttp%3A%2F%2Frdf.geospecies.org%2Font%2Fgeospecies%23%3E%0A%0ASELECT+%3Fsubject+%3FgeoSparql+%3FtimePeriod+%3Fimage%0AWHERE+%7B%0A++%3Fsubject+a+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fcube%23Observation%3E%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fwww.example.org%2FANU-LED%23imageData%3E+%3Fimage%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23asWKT%3E+%3FgeoSparql%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fsdmx%2F2009%2Fdimension%23timePeriod%3E+%3FtimePeriod%0A%7D%0ALIMIT+25';
    var getFirstTimeStamp = server + 'query=SELECT+%3Fsubject+%3FtimePeriod+%0AWHERE+%7B%0A++%3Fsubject+a+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fcube%23Observation%3E%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fsdmx%2F2009%2Fdimension%23timePeriod%3E+%3FtimePeriod%0A%7D%0AORDER+BY+DESC(%3FtimePeriod)%0ALIMIT+1';
    var getLastTimeStamp = 'http://144.6.231.77/landsat/query?query=SELECT+%3Fsubject+%3FtimePeriod+%0AWHERE+%7B%0A++%3Fsubject+a+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fcube%23Observation%3E%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fsdmx%2F2009%2Fdimension%23timePeriod%3E+%3FtimePeriod%0A%7D%0AORDER+BY+ASC(%3FtimePeriod)%0ALIMIT+1'
    var getDistinctTimeStamps = 'http://144.6.231.77/landsat/query?query=SELECT+DISTINCT+%3FtimePeriod+%0AWHERE+%7B%0A++%3Fsubject+a+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fcube%23Observation%3E%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fsdmx%2F2009%2Fdimension%23timePeriod%3E+%3FtimePeriod%0A%7D%0AORDER+BY+DESC(%3FtimePeriod)'

    SearchService.getAll = function(query) {
        $http.defaults.useXDomain = true;

        //Example: http://144.6.235.235/standalone/accidents?_where=%3Fitem+lde%3Alocation+%3Floc+.+%3Floc+lde%3AsuburbName+%22Belconnen%22+

        /* Example to get fetch  all of the dataset attributes (including the "components" which define the axes:
         CONSTRUCT {<http://example.com/landsat#landsatDSD> ?p ?o.} WHERE {<http://example.com/landsat#landsatDSD> ?p ?o .} */

        console.log("Getting query: " + query);

        var req = {
            method: 'GET',
            url: server+query,
            headers: {
                'Accept': 'application/sparql-results+json,*/*;q=0.9'
            }
        };

        return $http(req)
            .then(function success(res) {
                // return the enveloped data

                if (res.data.status > 200) {
                    return res.statusText;
                } else {
                    //console.log("Data: " + res.data.toString());
                    //console.log("Headers: " + res.data.head);
                    //console.log("Bindings: " + res.data.results.bindings);
                    return res.data;
                }
            }, function failed(res){
                alert(res);
            });

        /*store.execute('LOAD <http://144.6.231.77/landsat/>\
         INTO GRAPH <lisp>', function(err){
         if(err) {
         /*var query = 'PREFIX foaf:<http://xmlns.com/foaf/0.1/> SELECT ?o \
         FROM NAMED <lisp> { GRAPH <lisp> { ?s foaf:page ?o} }';
         store.execute(query, function(err, results) {
         // process results
         });

         var query = "http://144.6.231.77/dataset.html?tab=query&ds=%2Flandsat&query=PREFIX+geo%3A+%3Chttp%3A%2F%2Fwww.w3.org%2F2003%2F01%2Fgeo%2Fwgs84_pos%23%3E%0APREFIX+geosparql%3A+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23%3E%0APREFIX+geos%3A+%3Chttp%3A%2F%2Fwww.telegraphis.net%2Fontology%2Fgeography%2Fgeography%23%3E%0APREFIX+geosp%3A+%3Chttp%3A%2F%2Frdf.geospecies.org%2Font%2Fgeospecies%23%3E%0A%0ASELECT+%3Fsubject+%3FgeoSparql+%3FtimePeriod+%3Fimage%0AWHERE+%7B%0A++%3Fsubject+a+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fcube%23Observation%3E%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fwww.example.org%2FANU-LED%23imageData%3E+%3Fimage%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fwww.opengis.net%2Font%2Fgeosparql%23asWKT%3E+%3FgeoSparql%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fsdmx%2F2009%2Fdimension%23timePeriod%3E+%3FtimePeriod%0A%7D%0ALIMIT+25";

         store.execute(query, function(err, results){
         if(!err) {
         // process results
         console.log("Found results");
         console.log(results[0].s.value);
         if(results[0].s.token === 'uri') {

         }
         } else {
         console.log(err);
         }
         });
         }
         })

         return store;*/
    };

    SearchService.getFirstTime = function() {
        queryServer(getFirstTimeStamp).then(function (data) {
            return data.results.bindings[0].timePeriod.value;
        });
    };
    SearchService.getLastTime = function() {
        queryServer(getLastTimeStamp).then(function (data) {
            return data.results.bindings[0].timePeriod.value;
        });
    };
    SearchService.getDistinctTime = function() {
        return this.queryServer(getDistinctTimeStamps, function(data){
            var retVal = [];
            for (i in data.results.bindings){
                var timeStamp = data.results.bindings[i].timePeriod.value;
                retVal.push(timeStamp);
            }

            return retVal;
        });
    };

    SearchService.queryServer = function (url, callback) {
        $http.defaults.useXDomain = true;

        var req = {
            method: 'GET',

            // TODO: Change this hardcoded query
            url: url,
            headers: {
                'Accept': 'application/sparql-results+json,*/*;q=0.9'
            }
        };

        return $http(req)
            .then(function success(res) {
                // return the enveloped data

                if (res.status > 200) {
                    return res.data.statusText;
                } else {
                    return callback(res.data);
                }
            }, function failed(res){
                alert(res);
            });
    };

    return SearchService;
});

