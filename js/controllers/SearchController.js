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

    $scope.selectGeolocation = null;

    prefixes.push('PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>');
    prefixes.push('PREFIX led: <http://www.example.org/ANU-LED#>');

    where_clauses.push('?subject a <http://purl.org/linked-data/cube#Observation>');
    where_clauses.push('. ?subject <http://www.example.org/ANU-LED#imageData> ?image');
    where_clauses.push('. ?subject <http://www.example.org/ANU-LED#etmBand> ?band');
    where_clauses.push('. ?subject <http://www.example.org/ANU-LED#bounds> ?geoSparql');
    where_clauses.push('. ?subject <http://www.example.org/ANU-LED#time> ?timePeriod');
    //where_clauses.push('. ?subject <http://www.example.org/ANU-LED#pixelHeight> 64');

    var mymap = L.map('mapid').setView([51.505, -0.09], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'duo.034p8op4',
        accessToken: 'pk.eyJ1IjoiZHVvIiwiYSI6ImNpbm52Y2lxdzB6emZ0dmx5MmNmNGZnejMifQ._yO4cALvQUPwvtVj_nUYEA'
    }).addTo(mymap);

    // Custom on hover info
    var timeSlider = L.control();

    timeSlider.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'legend'); // create a div with a class "info"
        div.innerHTML = '<p>Test</p><rzslider rz-slider-model="slider_date.value" rz-slider-options="slider_date.options"></rzslider>';
        return div;
    };

    timeSlider.addTo(mymap);

    // Custom on hover info
    var info = L.control();

    info.onAdd = function (map) {
        this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
        this.update();
        return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {
        if (props != null) {
            var subject = props.subject.value;
            this._div.innerHTML = '<h4>Image Details</h4>' + '<a href="' + subject + '">Link</a>';
        }
    };

    info.addTo(mymap);

    $scope.search = function(){
        console.log("On Click Search");
        if($scope.selectGeolocation != null) {
            prefixes.push('PREFIX spatial: <http://jena.apache.org/spatial#>');
            where_clauses.push('. ?subject ' + $scope.selectGeolocation + ' (' + $scope.geospatialQuery + ")");

            self.performQuery();
        }
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

        return [corners[0].match(/-?\d+.?\d*/g).reverse(), corners[2].match(/-?\d+.?\d*/g).reverse()]
    }

    //Slider config with steps as the distinct datestamps of the observations
    SearchService.getDistinctTime().then(function (options) {
        self.dict = [];
        self.display = [];

        for (i in options){
            self.dict[(moment(options[i]).format("DD/MM/YY, h:mm:ss a"))] = options[i];
            console.log(self.dict);
            self.display.push(moment(options[i]).format("DD/MM/YY, h:mm:ss a"));
            timePeriod = options[i];
        }

        self.performQuery();

        //Slider config with callbacks
        $scope.slider_date = {
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
                    console.log($scope.slider_date.value);
                    if (timePeriod != self.dict[$scope.slider_date.value]) {
                        console.log($scope.slider_date.value);
                        timePeriod = self.dict[self.display[$scope.slider_date.value]];
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

        console.log("Query: " + query);
        
        var encoded = encodeURIComponent(query);

        SearchService.getAll(encoded).then(function (data) {

            // Read new observations
            var observations = data.results.bindings;
            var imageDict = [];

            // Clear current overlay
            for (i in self.currentOverlay){
                mymap.removeLayer(self.currentOverlay[i]);
            }

            self.currentOverlay = [];

            // Add new overlay
            for (i in observations){
                imageDict[observations[i].image.value] = observations[i];

                var coords = getBoundingCorners(String(observations[i].geoSparql.value));
                var overlay = new L.imageOverlay(observations[i].image.value, coords).addTo(mymap).setOpacity(1);
                
                L.DomEvent.on(overlay._image, 'click', function(e){
                    // console.log(e.srcElement.currentSrc);
                    // console.log(imageDict[e.srcElement.currentSrc].subject.value);
                    info.update(imageDict[e.srcElement.currentSrc]);
                });

                self.currentOverlay.push(overlay);
                mymap.panTo(coords[0]);
            }

            var currentLayerGroup = L.layerGroup(self.currentOverlay);
        });
    };
});