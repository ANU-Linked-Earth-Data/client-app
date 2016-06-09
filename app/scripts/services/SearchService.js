'use strict';

angular.module('LEDApp')
    .factory('SearchService', function($http, SPARQLEndpoint) {
        var SearchService = {};

        var prefixes = [
            'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
            'PREFIX led: <http://www.example.org/ANU-LED#>',
            'PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>'
        ];

        var whereClauses = [
            '?subject a <http://purl.org/linked-data/cube#Observation> .',
            '?subject <http://www.example.org/ANU-LED#imageData> ?image .',
            '?subject <http://www.example.org/ANU-LED#etmBand> ?band .',
            '?subject <http://www.example.org/ANU-LED#bounds> ?geoSparql .',
            '?subject <http://www.example.org/ANU-LED#time> ?timePeriod .',
            '?subject <http://www.example.org/ANU-LED#resolution> ?resolution .',
            '?subject <http://www.example.org/ANU-LED#location> ?location .',
            '?location <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat .',
            '?location <http://www.w3.org/2003/01/geo/wgs84_pos#lon> ?lon .'
        ];

        var select = 'SELECT ?subject ?geoSparql ?timePeriod ?band ?image ?resolution ?lon ?lat';
        var selectDistinct = 'SELECT DISTINCT ?subject ?geoSparql ?timePeriod ?band ?image ?resolution ?lon ?lat';
        var closing = 'ORDER BY DESC(?timePeriod) LIMIT 25';

        //$scope.selectGeolocation = null;

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

                /*for(var i in observations){
                    console.log(observations[i].lat.value);
                    console.log(observations[i].lon.value);
                    console.log(observations[i].subject.value);
                    console.log(observations[i].timePeriod.value);
                    console.log(observations[i].band.value);
                    console.log(observations[i].resolution.value);
                    console.log(observations[i].image.value);
                    console.log(observations[i].geoSparql.value);
                }*/
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
                '\"^^xsd:dateTime)}' +
                closing;

            var response = SPARQLEndpoint.query(query);

            SPARQLEndpoint.query(query).then(function (data) {
                data.getMessage();
            });

            return response;
        };
        return SearchService;
    });

