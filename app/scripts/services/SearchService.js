'use strict';

angular.module('LEDApp')
        .factory('SearchService', function($http, SPARQLEndpoint) {
    var SearchService = {};

    var getDistinctTimeStamps = [
        'SELECT DISTINCT ?timePeriod WHERE {',
          '?subject a <http://purl.org/linked-data/cube#Observation> .',
          '?subject <http://www.example.org/ANU-LED#time> ?timePeriod',
        '} ORDER BY DESC(?timePeriod)'
    ].join('\n');

    SearchService.getDistinctTime = function() {
        return SPARQLEndpoint.query(getDistinctTimeStamps).then(function(data) {
            var retVal = [];
            for (var i in data.results.bindings){
                var timeStamp = data.results.bindings[i].timePeriod.value;
                retVal.push(timeStamp);
            }

            return retVal;
        });
    };

    return SearchService;
});

