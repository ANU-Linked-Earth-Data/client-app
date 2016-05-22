'use strict';

/**
 * Created by Duo on 22-Mar-16.
 */

angular.module('LEDApp')
        .factory('SearchService', function($http){
    var SearchService = {};

    SearchService.result = function() {
        $http.defaults.useXDomain = true;

        var req = {
            method: 'GET',

            // TODO: Change this hardcoded query
            url: 'http://144.6.231.77/landsat/query?query=SELECT+%3Fsubject+%3FtimePeriod+%0AWHERE+%7B%0A++%3Fsubject+a+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fcube%23Observation%3E%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fsdmx%2F2009%2Fdimension%23timePeriod%3E+%3FtimePeriod%0A%7D%0AORDER+BY+DESC(%3FtimePeriod)%0ALIMIT+1',
            headers: {
                'Accept': 'application/sparql-results+json,*/*;q=0.9'
            }
        };

        return $http(req)
            .then(function success(res) {
                // return the enveloped data
                if (res.data.status > 200) {
                    return res.data.statusText;
                } else {
                    return res.data;
                }
            }, function failed(res){
                console.error(res);
            });
    };

    return SearchService;
});

