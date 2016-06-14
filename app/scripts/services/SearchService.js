'use strict';

angular.module('LEDApp')
    .factory('SearchService', function($http, SPARQLEndpoint) {
        var SearchService = {};

        //TODO: Allow this to be variable
        var dggsLevel = 5;

        var prefixes = [
            'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>',
            'PREFIX led: <http://www.example.org/ANU-LED#>',
            'PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>',
            'PREFIX qb:  <http://purl.org/linked-data/cube#>'
        ];

        var whereClauses = [
            '?subject led:etmBand ?band .',
            '?subject led:bounds ?geoSparql .',
            '?subject led:time ?timePeriod .',
            '?subject led:resolution ?resolution .',
            '?subject led:location ?location .',
            '?subject led:dggsLevelPixel ?dggsLevelPixel .',
            '?subject led:dggsLevelSquare ?dggsLevelSquare .',
            '?subject led:dggsCell ?dggsCell .',
            '?location geo:lat ?lat .',
            '?location geo:lon ?lon .'
        ];

        //TODO: Only select relevent things
        var select = 'SELECT ?subject ?geoSparql ?timePeriod ?band ?value ?resolution ?lon ?lat ?dggsLevelSquare ?dggsLevelPixel ?dggsCell';
        var selectDistinct = 'SELECT DISTINCT ?subject ?geoSparql ?timePeriod ?band ?value ?resolution ?lon ?lat ?dggsLevelSquare ?dggsLevelPixel';
        var closing = 'ORDER BY ASC(?timePeriod)';

        //$scope.selectGeolocation = null;

        var getDistinctTimeStamps = [
            'SELECT DISTINCT ?timePeriod WHERE {',
            '?subject a qb:Observation .',
            '?subject led:time ?timePeriod',
            '} ORDER BY ASC(?timePeriod)'
        ].join('\n');

        var getDistinctBands = [
            'SELECT DISTINCT ?band WHERE {',
            '?subject a qb:Observation .',
            '?subject led:etmBand ?band',
            '} ORDER BY ASC(?band)'
        ].join('\n');

        SearchService.getDistinctTime = function() {
            return SPARQLEndpoint.query(prefixes.join('\n') + '\n' + getDistinctTimeStamps);
        };

        SearchService.getDistinctBands = function() {
            return SPARQLEndpoint.query(prefixes.join('\n') + '\n' + getDistinctBands).then(function(data) {
                var retVal = [];

                for (var i in data.results.bindings){
                    retVal.push(data.results.bindings[i].band.value);
                }

                return retVal;
            });
        };

        SearchService.performQueryLimitLocation = function (cell) {
            var query = prefixes.join('\n') +
                selectDistinct + '\n' +
                'WHERE {\n ?subject a led:Pixel .' +
                '?subject led:value ?value . \n' +
                whereClauses.join('\n') + '\n' +
                'FILTER(?dggsCell = \"' +
                cell +
                '\" && ?dggsLevelPixel = ' +
                dggsLevel +
                ')}' +
                closing;

            var response = SPARQLEndpoint.query(query);

            response.then(function(data){
                var observations = data.results.bindings;
                observations.toString();
            });

            return response;
        };
        /*
         && ?dggsLevelPixel = ' +
         dggsLevel +
         ' && ?dggsLevelSquare = ' +
         dggsLevel +
         */

        SearchService.performQueryLimitTime = function(timePeriod){
            //Construct query:
            var query = prefixes.join('\n') +
                select + '\n' +
                'WHERE {\n ?subject a led:GridSquare .' +
                '?subject led:imageData ?value .  \n' +
                whereClauses.join('\n') + '\n' +
                'FILTER(?timePeriod = \"' +
                timePeriod +
                '\"^^xsd:datetime && ?dggsLevelSquare = ' +
                dggsLevel +
                ')}' +
                closing;

            var response = SPARQLEndpoint.query(query);

            return response;
        };
        return SearchService;
    });

