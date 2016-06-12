'use strict';

angular.module('LEDApp')
    .factory('SearchService', function($http, SPARQLEndpoint) {
        var SearchService = {};

        var prefixes = [
            'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
            'PREFIX led: <http://www.example.org/ANU-LED#>',
            'PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>',
            'PREFIX qb:  <http://purl.org/linked-data/cube#>'
        ];

        var whereClauses = [
            '?subject a led:GridSquare .',
            '?subject led:imageData ?image .',
            '?subject led:etmBand ?band .',
            '?subject led:bounds ?geoSparql .',
            '?subject led:time ?timePeriod .',
            '?subject led:resolution ?resolution .',
            '?subject led:location ?location .',
            '?location geo:lat ?lat .',
            '?location geo:lon ?lon .'
        ];

        var select = 'SELECT ?subject ?geoSparql ?timePeriod ?band ?image ?resolution ?lon ?lat';
        var selectDistinct = 'SELECT DISTINCT ?subject ?geoSparql ?timePeriod ?band ?image ?resolution ?lon ?lat';
        var closing = 'ORDER BY DESC(?timePeriod) LIMIT 25';

        //$scope.selectGeolocation = null;

        var getDistinctTimeStamps = [
            'SELECT DISTINCT ?timePeriod WHERE {',
            '?subject a qb:Observation .',
            '?subject led:time ?timePeriod',
            '} ORDER BY DESC(?timePeriod)'
        ].join('\n');

        SearchService.getDistinctTime = function() {
            return SPARQLEndpoint.query(prefixes.join('\n') + '\n' + getDistinctTimeStamps).then(function(data) {
                var retVal = [];
                for (var i in data.results.bindings){
                    var timeStamp = data.results.bindings[i].timePeriod.value;
                    retVal.push(timeStamp);
                }

                return retVal;
            });
        };

        SearchService.performQueryLimitLocation = function (lat, lon) {
            console.log("Getting Query for (" + lat + "," + lon + ")");

            var query = prefixes.join('\n') +
                selectDistinct + '\n' +
                'WHERE {\n' +
                whereClauses.join('\n') + '\n' +
                'FILTER(?lon = ' +
                lon +
                ' && ?lat = ' +
                lat +
                ')}' +
                closing;

            var response = SPARQLEndpoint.query(query);

            response.then(function(data){
                var observations = data.results.bindings;
                observations.toString();
            });

            return response;
        };

        SearchService.performQueryLimitTime = function(timePeriod){
            //Construct query:
            var query = prefixes.join('\n') +
                select + '\n' +
                'WHERE {\n' +
                whereClauses.join('\n') + '\n' +
                'FILTER(?timePeriod = \"' +
                timePeriod +
                '\"^^xsd:datetime)}' +
                closing;

            var response = SPARQLEndpoint.query(query);

            /*response.then(function (data) {

            });*/

            return response;
        };
        return SearchService;
    });

