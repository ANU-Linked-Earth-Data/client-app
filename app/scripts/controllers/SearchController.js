'use strict';

/**
 * Created by Duo on 22-Mar-16.
 */

angular.module('LEDApp')
        .controller('SearchController', function(SearchService, $scope){
    var self = this;
    this.hasSearched = false;
    var prefixes = [];
    var whereClauses = [];
    var select = 'SELECT ?subject ?geoSparql ?timePeriod ?band ?image ?resolution ?lon ?lat';
    var timePeriod;
    var closing = 'ORDER BY DESC(?timePeriod) LIMIT 25';

    self.currentOverlay = [];

    $scope.selectGeolocation = null;

    prefixes.push('PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>');
    prefixes.push('PREFIX led: <http://www.example.org/ANU-LED#>');
    prefixes.push('PREFIX geo: <http://www.w3.org/2003/01/geo/wgs84_pos#>');

    whereClauses.push('?subject a <http://purl.org/linked-data/cube#Observation>');
    whereClauses.push('. ?subject <http://www.example.org/ANU-LED#imageData> ?image');
    whereClauses.push('. ?subject <http://www.example.org/ANU-LED#etmBand> ?band');
    whereClauses.push('. ?subject <http://www.example.org/ANU-LED#bounds> ?geoSparql');
    whereClauses.push('. ?subject <http://www.example.org/ANU-LED#time> ?timePeriod');
    whereClauses.push('. ?subject <http://www.example.org/ANU-LED#resolution> ?resolution');
    whereClauses.push('. ?subject <http://www.example.org/ANU-LED#location> ?location');
    whereClauses.push('. ?location <http://www.w3.org/2003/01/geo/wgs84_pos#lat> ?lat');
    whereClauses.push('. ?location <http://www.w3.org/2003/01/geo/wgs84_pos#lon> ?lon');

    var mymap = L.map('mapid').setView([51.505, -0.09], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'duo.034p8op4',
        accessToken: 'pk.eyJ1IjoiZHVvIiwiYSI6ImNpbm52Y2lxdzB6emZ0dmx5MmNmNGZnejMifQ._yO4cALvQUPwvtVj_nUYEA'
    }).addTo(mymap);

    // Custom on hover info
    var info = L.control();

    info.onAdd = function () {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        if (props !== undefined) {
            var subject = props.subject.value;
            var lat = Number(props.lat.value);
            var lon = Number(props.lon.value);

            this._div.innerHTML = '<h4>Image Details</h4>';
            this._div.innerHTML += '<a href="' + subject + '">Link</a>';
            this._div.innerHTML += '<p>Band:' + props.band.value +'</p>';
            this._div.innerHTML += '<p>Resolution:' + props.resolution.value +'</p>';
            this._div.innerHTML += '<p>Location: (' + (Math.round((lat + 0.00001) * 100) / 100) + ', ' + (Math.round((lon + 0.00001) * 100) / 100) + '(</p>';
        } else {
            this._div.innerHTML = '<h4>Image Details</h4><p>None Selected</p>';
        }
    };

    info.addTo(mymap);

    $scope.search = function(){
        console.log("On Click Search");
        if($scope.selectGeolocation !== null) {
            prefixes.push('PREFIX spatial: <http://jena.apache.org/spatial#>');
            whereClauses.push('. ?subject ' + $scope.selectGeolocation + ' (' + $scope.geospatialQuery + ")");

            self.performQuery();
        }
    };

    self.getMessage = function() {
    };

    /*  Get the top left and bottom right corners of polygon definition:
        e.g POLYGON(-35.368 149.016, -35.384 149.016, -35.384 149.032, -35.368 149.032, -35.368 149.016) -> [[-35.368, 149.016], [-35.384, 149.032]]
    */
    function getBoundingCorners(polygonText){
        var corners = polygonText.match(/-?\d+.?\d* -?\d+.?\d*,/g);

        return [
            corners[0].match(/-?\d+.?\d*/g).reverse(),
            corners[2].match(/-?\d+.?\d*/g).reverse()
        ];
    }

    //Slider config with steps as the distinct datestamps of the observations
    SearchService.getDistinctTime().then(function (options) {
        self.dict = [];
        self.display = [];

        for (var i in options){
            self.dict[(moment(options[i]).format("DD/MM/YY, h:mm:ss a"))] = options[i];
            console.log(self.dict);
            self.display.push(moment(options[i]).format("DD/MM/YY, h:mm:ss a"));
            timePeriod = options[i];
        }

        self.performQuery();

        //Slider config with callbacks
        $scope.sliderDate = {
            value: self.display.length-1,
            showTicks: true,
            options: {
                stepsArray: self.display,
                //stepsArray: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split(''),
                onStart: function () {

                },
                onChange: function () {

                },
                onEnd: function () {
                    //TODO: Only update if end date is different
                    console.log($scope.sliderDate.value);
                    if (timePeriod !== self.dict[$scope.sliderDate.value]) {
                        console.log($scope.sliderDate.value);
                        timePeriod = self.dict[self.display[$scope.sliderDate.value]];
                        self.performQuery();
                    }
                }
            }
        };

        //$scope.$broadcast('rzSliderForceRender');
    });

    self.performQuery = function(){

        //Construct query:
        var query = "";

        for (var i in prefixes) {
            query += prefixes[i] + ' ';
        }

        query += select;
        query += " WHERE {";

        for (i in whereClauses) {
            query += whereClauses[i];
        }

        query += '. Filter(?timePeriod = \"' + timePeriod + '\"^^xsd:dateTime)}';
        query += closing;

        console.log("Query: " + query);
        
        var encoded = encodeURIComponent(query);

        SearchService.getAll(encoded).then(function (data) {

            // Read new observations
            var observations = data.results.bindings;
            var imageDict = [];

            // Clear current overlay
            for (var i in self.currentOverlay){
                mymap.removeLayer(self.currentOverlay[i]);
            }

            self.currentOverlay = [];

            // Add new overlay
            var updateFunction = function(e) {
                info.update(imageDict[e.target.src]);
            };

            for (i in observations){
                imageDict[observations[i].image.value] = observations[i];

                var coords = getBoundingCorners(String(observations[i].geoSparql.value));
                var overlay = new L.imageOverlay(observations[i].image.value, coords).addTo(mymap).setOpacity(1);

                L.DomEvent.on(overlay._image, 'click', updateFunction);

                self.currentOverlay.push(overlay);
                mymap.panTo(coords[0]);
            }

            // var currentLayerGroup = L.layerGroup(self.currentOverlay);
        });
    };
});
