'use strict';

angular.module('LEDApp')
        .factory('SearchService', function($http, config) {
    var SearchService = {};
    var server = config['sparql-endpoints'][0] + '?query=';

    var getFirstTimeStamp = server + 'SELECT+%3Fsubject+%3FtimePeriod+%0AWHERE+%7B%0A++%3Fsubject+a+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fcube%23Observation%3E%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fsdmx%2F2009%2Fdimension%23timePeriod%3E+%3FtimePeriod%0A%7D%0AORDER+BY+DESC(%3FtimePeriod)%0ALIMIT+1';
    var getLastTimeStamp = server + 'SELECT+%3Fsubject+%3FtimePeriod+%0AWHERE+%7B%0A++%3Fsubject+a+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fcube%23Observation%3E%0A++++.+%3Fsubject+%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fsdmx%2F2009%2Fdimension%23timePeriod%3E+%3FtimePeriod%0A%7D%0AORDER+BY+ASC(%3FtimePeriod)%0ALIMIT+1';
    var getDistinctTimeStamps = server + 'SELECT%20DISTINCT%20%3FtimePeriod%20%0AWHERE%20%7B%0A%20%20%3Fsubject%20a%20%3Chttp%3A%2F%2Fpurl.org%2Flinked-data%2Fcube%23Observation%3E%0A%20%20%20%20.%20%3Fsubject%20%3Chttp%3A%2F%2Fwww.example.org%2FANU-LED%23time%3E%20%3FtimePeriod%0A%7D%0AORDER%20BY%20DESC(%3FtimePeriod)';

    SearchService.getAll = function(query) {
        $http.defaults.useXDomain = true;

        console.log("Getting query: " + server+query);

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
                    return res.data.statusText;
                } else {
                    return res.data;
                }
            }, function failed(res){
                console.error(res);
            });
    };

    SearchService.getFirstTime = function() {
        this.queryServer(getFirstTimeStamp).then(function (data) {
            return data.results.bindings[0].timePeriod.value;
        });
    };
    
    SearchService.getLastTime = function() {
        this.queryServer(getLastTimeStamp).then(function (data) {
            return data.results.bindings[0].timePeriod.value;
        });
    };
    
    SearchService.getDistinctTime = function() {
        return this.queryServer(getDistinctTimeStamps, function(data){
            var retVal = [];
            for (var i in data.results.bindings){
                var timeStamp = data.results.bindings[i].timePeriod.value;
                retVal.push(timeStamp);
            }

            return retVal;
        });
    };

    SearchService.queryServer = function (url, callback) {
        $http.defaults.useXDomain = true;

        // console.log("Getting query: " + url);

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

                if (res.data.status > 200) {
                    return res.data.statusText;
                } else {
                    return callback(res.data);
                }
            }, function failed(res){
                console.error(res);
            });
    };

    return SearchService;
});

