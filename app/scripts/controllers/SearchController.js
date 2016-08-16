'use strict';

angular.module('LEDApp')
    .controller('SearchController', function(SearchService, $scope, $compile){
        var self = this;
        this.hasSearched = false;
        var timePeriod;

        self.currentOverlay = [];
        self.bandLayer = 0;

        var defaultDggsLevel = 5;

        //$scope.selectGeolocation = null;

        var mymap = L.map('mapid').setView([-34.6, 148.33], 9);

        mymap.on('zoomend', function(){
            self.performQueryLimitTime();
        });

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'duo.034p8op4',
            accessToken: 'pk.eyJ1IjoiZHVvIiwiYSI6ImNpbm52Y2lxdzB6emZ0dmx5MmNmNGZnejMifQ._yO4cALvQUPwvtVj_nUYEA'
        }).addTo(mymap);

        // Custom on hover info
        var info = L.control({position:"topright"});

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

                //console.log("Clicked: \n" + JSON.stringify(props));

                this._div.innerHTML = '<h4>Image Details</h4>';
                this._div.innerHTML += '<a href="' + subject + '">Link</a>';
                this._div.innerHTML += '<p>Band:' + props.band.value +'</p>';
                this._div.innerHTML += '<p>Pixel:' + props.dggsLevelPixel.value +'</p>';
                this._div.innerHTML += '<p>Square:' + props.dggsLevelSquare.value +'</p>';
                this._div.innerHTML += '<p>Resolution:' + props.resolution.value +'</p>';
                this._div.innerHTML += '<p>Location: (' + (Math.round((lat + 0.00001) * 100) / 100) + ', ' + (Math.round((lon + 0.00001) * 100) / 100) + ')</p>';

            } else {
                this._div.innerHTML = '<h4>Image Details</h4><p>None Selected</p>';
            }
        };

        info.addTo(mymap);

        var graph = L.control({position:"bottomright"});

        graph.onAdd = function () {
            var div = L.DomUtil.create('div');
            var container = L.DomUtil.create('div','',div);
            container.setAttribute('ng-include','\'views/charts/barchart.html\'');

            var newScope = $scope.$new();
            $compile(div)(newScope);

            return div;
        };

        graph.update = function(props){
            if (props !== undefined){

            } else {

            }
        };

        // method that we will use to update the control based on feature properties passed
        /*graph.update = function (props) {
            if (props !== undefined) {
                var div = L.DomUtil.create('div');
                var container = L.DomUtil.create('div','',div);
                container.setAttribute('ng-include','\'views/charts/timeSeries.html\'');

                var newScope = $scope.$new();
                $compile(div)(newScope);
                console.log("Compiled");
            } else {
                this._div.innerHTML = '<h4>Image Details</h4><p>None Selected</p>';
            }
        };*/

        graph.addTo(mymap);

        $scope.search = function(){
            //console.log("On Click Search");
            /*if($scope.selectGeolocation !== null) {
             prefixes.push('PREFIX spatial: <http://jena.apache.org/spatial#>');
             whereClauses.push('. ?subject ' + $scope.selectGeolocation + ' (' + $scope.geospatialQuery + ")");

             self.performQuery();
             }*/
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
        SearchService.getDistinctTime().then(function (data) {
            var options = [];
            self.dict = [];
            self.display = [];

            for (var i in data.results.bindings){
                options.push(data.results.bindings[i].timePeriod.value);
            }

            for (i in options){
                self.dict[(moment(options[i]).format("DD/MM/YY, h:mm:ss a"))] = options[i];
                self.display.push(moment(options[i]).format("DD/MM/YY, h:mm:ss a"));
                timePeriod = options[i];
            }

            self.performQueryLimitTime();

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
                        if (timePeriod !== self.dict[$scope.sliderDate.value]) {
                            timePeriod = self.dict[self.display[$scope.sliderDate.value]];
                            self.performQueryLimitTime();
                        }
                    }
                }
            };

            //$scope.$broadcast('rzSliderForceRender');
        });



        // Add new overlay
        var updateFunction = function(e) {
            if(e==null)
                return;

            info.update(e);

            //$scope.coord.lat = Number(imageDict[e.target.src].lat.value);
            //$scope.coord.lon = Number(imageDict[e.target.src].lon.value);

            console.log(e.dggsCell.value);
            $scope.$broadcast('onSelectRegion', e.dggsCell.value, e.band.value);
        };

        self.performQueryLimitTime = function(){
            SearchService.getDistinctBands().then(function (bands){
                var images = [];
                self.bands = bands;

                for(var x in bands){
                    x.toString();
                    images.push([]);
                }

                var zoomLevel = mymap.getZoom() - 5;

                SearchService.performQueryLimitTime(zoomLevel, timePeriod).then(function (data) {
                    // Read new observations

                    var observations = data.results.bindings;
                    if(self.imageDict == null){
                        self.imageDict = [];
                    }

                    // Clear current overlay
                    for (var i in self.currentOverlay){
                        mymap.removeLayer(self.currentOverlay[i]);
                    }

                    self.currentOverlay = [];

                    var onClick = function(e){
                        updateFunction(self.imageDict[e.target.src]);
                    };

                    for (i in observations){

                        self.imageDict[observations[i].value.value] = observations[i];

                        var coords = getBoundingCorners(String(observations[i].geoSparql.value));
                        var overlay = new L.imageOverlay(observations[i].value.value, coords, {interactive: true});

                        //overlay.on('click', onClick);
                        //L.DomEvent.on(overlay._image, 'click', onClick);

                        self.currentOverlay.push(overlay);
                        images[Number(observations[i].band.value)].push(overlay);

                        //mymap.panTo(coords[0]);
                    }

                    var layers = {};

                    for(i in bands){
                        layers[i] = L.featureGroup(images[i]);
                    }

                    if(self.layer != null && self.layers != null){
                        for(var l in self.layers){
                            self.layer.removeLayer(self.layers[l]);
                        }

                        for(l in layers){
                            self.layer.addBaseLayer(layers[l], l);
                        }

                        //Make a layer visible
                        if(self.bandLayer < layers.length){
                            layers[self.bandLayer].addTo(mymap);
                        } else {
                            layers[0].addTo(mymap);
                        }

                    } else {
                        self.layer = L.control.layers(layers, null);
                        mymap.on('baselayerchange', function(e){
                            self.bandLayer = Number(e.name);
                            e.layer.on('click', function() { console.log('Clicked on a group!'); });
                        });

                        self.layer.addTo(mymap);
                        layers[0].addTo(mymap);

                        mymap.on('click', function(e) {
                            onClick(e.originalEvent);
                        });
                    }

                    self.layers = layers;


                    // var currentLayerGroup = L.layerGroup(self.currentOverlay);
                    //addTo(mymap).setOpacity(1);
                    //
                });
            });

        };
    });
