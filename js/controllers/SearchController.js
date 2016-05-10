/**
 * Created by Duo on 22-Mar-16.
 */

app.controller('SearchController', function(SearchService, $scope){
    var self = this;
    this.hasSearched = false;
    var prefixes = [];
    var select = 'SELECT ?subject ?geoSparql ?timePeriod ?band ?image';
    var where_clauses = [];
    var timePeriod;
    var closing = 'ORDER BY DESC(?timePeriod) LIMIT 25';

    self.currentOverlay = [];

    prefixes.push('PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>');

    where_clauses.push('?subject a <http://purl.org/linked-data/cube#Observation>');
    where_clauses.push('. ?subject <http://www.example.org/ANU-LED#imageData> ?image');
    where_clauses.push('. ?subject <http://www.example.org/ANU-LED#etmBand> ?band');
    where_clauses.push('. ?subject <http://www.opengis.net/ont/geosparql#asWKT> ?geoSparql');
    where_clauses.push('. ?subject <http://purl.org/linked-data/sdmx/2009/dimension#timePeriod> ?timePeriod');
    where_clauses.push('. ?subject <http://www.example.org/ANU-LED#pixelHeight> 64');

    var mymap = L.map('mapid').setView([51.505, -0.09], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'duo.034p8op4',
        accessToken: 'pk.eyJ1IjoiZHVvIiwiYSI6ImNpbm52Y2lxdzB6emZ0dmx5MmNmNGZnejMifQ._yO4cALvQUPwvtVj_nUYEA'
    }).addTo(mymap);

    $scope.search = function(){
        console.log("On Click Search");
    };

    self.getMessage = function() {
        /* example for rdflib

        var RDF = Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#")
        var RDFS = Namespace("http://www.w3.org/2000/01/rdf-schema#")
        var FOAF = Namespace("http://xmlns.com/foaf/0.1/")
        var XSD = Namespace("http://www.w3.org/2001/XMLSchema#")

        var store = $rdf.graph();
        var timeout = 5000; // 5000 ms timeout
        var fetcher = new $rdf.Fetcher(store, timeout);

        fetcher.nowOrWhenFetched(url, function(ok, body, xhr) {
            if (!ok) {
                console.log("Oops, something happened and couldn't fetch data");
            } else {
                // do something with the data in the store (see below)
            }
        })*/
    };

    /*  Get the top left and bottom right corners of polygon definition:
        e.g POLYGON(-35.368 149.016, -35.384 149.016, -35.384 149.032, -35.368 149.032, -35.368 149.016) -> [[-35.368, 149.016], [-35.384, 149.032]]
    */
    function getBoundingCorners(polygonText){
        var corners = polygonText.match(/-?\d+.?\d* -?\d+.?\d*,/g);

        return [corners[0].match(/-?\d+.?\d*/g), corners[2].match(/-?\d+.?\d*/g)]
    }

    //Slider config with steps as the distinct datestamps of the observations
    SearchService.getDistinctTime().then(function (options) {
        self.dict = {};
        self.display = []

        for (i in options){
            self.dict[(moment(options[i]).format("DD/MM/YY, h:mm:ss a"))] = options[i];
            self.display.push(moment(options[i]).format("DD/MM/YY, h:mm:ss a"));
            timePeriod = options[i];
        }

        self.performQuery();

        //Slider config with callbacks
        $scope.slider_date = {
            value: 0,
            options: {
                stepsArray: self.display,
                //stepsArray: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
                onStart: function () {

                },
                onChange: function () {

                },
                onEnd: function () {
                    //TODO: Only update if end date is different
                    if (timePeriod != self.dict[$scope.slider_date.value]) {
                        timePeriod = self.dict[$scope.slider_date.value]
                        self.performQuery();
                    }
                }
            }
        };
    });

    self.performQuery = function(){

        //Construct query:
        var query = "";

        for (i in prefixes){
            query += prefixes[i] + ' ';
        }

        query += select;
        query += " WHERE {";

        for (i in where_clauses){
            query += where_clauses[i];
        }

        query += '. Filter(?timePeriod = \"' + timePeriod + '\"^^xsd:dateTime)}';
        query += closing;
        
        var encoded = encodeURIComponent(query);

        SearchService.getAll(encoded).then(function (data) {
            //Clear current overlay
            for (i in self.currentOverlay){
                mymap.removeLayer(self.currentOverlay[i]);
            }

            self.currentOverlay = [];

            // Read new observations
            var observations = data.results.bindings;

            for (i in observations){
                var coords = getBoundingCorners(String(observations[i].geoSparql.value));

                var overlay = new L.imageOverlay(observations[i].image.value, coords).addTo(mymap).setOpacity(1);
                L.DomEvent.on(overlay._image, 'click', function(e){
                    console.log(e);
                });

                self.currentOverlay.push(overlay);
                mymap.panTo(coords[0]);
            }
        });
    };
});