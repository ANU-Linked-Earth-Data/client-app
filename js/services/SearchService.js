/**
 * Created by Duo on 22-Mar-16.
 */

app.factory('SearchService', function($http){
    var SearchService = {};

    SearchService.result = function() {
        $http.defaults.useXDomain = true;

        //Example: http://144.6.235.235/standalone/accidents?_where=%3Fitem+lde%3Alocation+%3Floc+.+%3Floc+lde%3AsuburbName+%22Belconnen%22+

        /* Example to get fetch  all of the dataset attributes (including the "components" which define the axes:
            CONSTRUCT {<http://example.com/landsat#landsatDSD> ?p ?o.} WHERE {<http://example.com/landsat#landsatDSD> ?p ?o .} */

        return $http.get('http://144.6.235.235/standalone/accidents.rdf?_construct=&lt;http://example.com/landsat#landsatDSD&gt;+?p+?o.+_where+&lt;http://example.com/landsat#landsatDSD&gt;+?p+?o+.')
            .then(function success(res) {
                // return the enveloped data
                console.log("Response: " + res.data);

                if (res.data.status > 200) {
                    return res.data.statusText;
                } else {
                    console.log("Getting response: " + res.data);
                    return res.data;
                }
            }, function failed(res){
                alert(res);
            });
    };

    return SearchService;
});

