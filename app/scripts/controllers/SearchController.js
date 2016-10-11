'use strict';

angular.module('LEDApp')
    .controller('SearchController', function(SearchService, $scope, $compile, filterFilter)
    {
        var self = this;
        this.hasSearched = false;
        var cachedTimePeriod;
        var cachedZoomLevel;
        self.bands = null;

        var cachedImages = [];
        var cachedSubjects = [];

        self.currentOverlay = [];
        self.imageDict = [];
        self.bandLayer = 0;
        self.addedListener = false;

        $scope.color_picker_options = {
            format: 'hex'
        };

        $scope.bandList = [];
        $scope.selected_bands = [];
        self.savedSelectedBands = [];

        var defaultDggsLevel = 5;

        //$scope.selectGeolocation = null;

        var mymap = L.map('mapid',{
            zoomControl: true
        }).setView([-34.6, 148.33], 9);

        mymap.zoomControl.setPosition('topright');

        mymap.on('zoomend', function(){
            self.performQueryLimitTime(mymap.getZoom()-5, cachedTimePeriod);
        });

        mymap.on('moveend', function(){
            self.onMoveMap(cachedZoomLevel, cachedTimePeriod);
        });

        mymap.on('click', function (e) {
            console.log(e.originalEvent);
            self.onClick(e.originalEvent);
        });


        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'duo.034p8op4',
            accessToken: 'pk.eyJ1IjoiZHVvIiwiYSI6ImNpbm52Y2lxdzB6emZ0dmx5MmNmNGZnejMifQ._yO4cALvQUPwvtVj_nUYEA'
        }).addTo(mymap);

        var sidebar = L.control.sidebar('sidebar').addTo(mymap);

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


        mymap.spin(true);
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
                //cachedTimePeriod = options[i];
            }

            if(options.length > 0) {
                self.performQueryLimitTime(mymap.getZoom() - 5, options[options.length - 1]);
            }

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
                        if (cachedTimePeriod !== self.dict[$scope.sliderDate.value]) {
                            self.performQueryLimitTime(cachedZoomLevel, self.dict[self.display[$scope.sliderDate.value]]);
                        }
                    }
                }
            };

            mymap.spin(false);
            //$scope.$broadcast('rzSliderForceRender');
        });

        // Add new overlay
        var updateFunction = function(e) {
            if(e===null) {
                return;
            }

            info.update(e);

            //$scope.coord.lat = Number(imageDict[e.target.src].lat.value);
            //$scope.coord.lon = Number(imageDict[e.target.src].lon.value);

            $scope.$broadcast('onSelectRegion', e.dggsCell.value, e.band.value);
        };

        self.performQueryLimitTime = function(zoomLevel, timePeriod){
            cachedTimePeriod = timePeriod;
            cachedZoomLevel = zoomLevel;

            mymap.spin(true);
            SearchService.getDistinctBands().then(function (bands) {
                cachedImages = [];
                cachedSubjects = [];

                self.bands = bands;

                for (var x in bands) {
                    cachedImages.push([]);
                    cachedSubjects.push([]);
                    $scope.bandList.push({name: x.toString(), color:"#FF0000", selected:false});

                }

                self.setDefaultSettings($scope.bandList);

                self.onMoveMap(zoomLevel, timePeriod);
                mymap.spin(false);
            });
        };

        $scope.selectedBands = function selectedBands() {
            return filterFilter($scope.bandList, { selected: true });
        };

        self.getBand = function(b){
            return filterFilter($scope.selected_bands, { name: b });
        };

        $scope.$watch('bandList|filter:{selected:true}', function (nv) {
            $scope.selection = nv.map(function (band) {
                return band.name;
            });
        }, true);

        self.onClick = function(e){
            updateFunction(e);
        };

        Caman.Filter.register("color", function (hue) {

            // Our process function that will be called for each pixel.
            // Note that we pass the name of the filter as the first argument.
            this.process("color", function (rgba) {
                var lum = rgba.r/255.0;

                var col = hsl2rgb(hue, 1, lum);

                rgba.r = col.r;
                rgba.g = col.g;
                rgba.b = col.b;

                // Return the modified RGB values
                return rgba;
            });
        });

        self.loadImage = function(colouredImages){
            console.log("Loading images");

            var opacity = 1/$scope.selected_bands.length;

            // Clear current overlay
            for (i in self.currentOverlay) {
                mymap.removeLayer(self.currentOverlay[i]);
            }

            self.currentOverlay = [];

            for(var i in colouredImages){
                var coords = getBoundingCorners(String(self.imageDict[colouredImages[i]][0].geoSparql.value));
                var overlay = new L.imageOverlay(colouredImages[i], coords, {interactive: true, opacity: opacity});
                //var overlay = new L.imageOverlay(observations[i].value.value, coords, {interactive: true, opacity: opacity});

                self.currentOverlay.push(overlay);
                overlay.addTo(mymap);
            }

            mymap.spin(false);
        };

        self.colorizeImage = function(tiles){
            // Clear current overlay
            for (var i in self.currentOverlay) {
                mymap.removeLayer(self.currentOverlay[i]);
            }

            self.currentOverlay = [];

            return Caman("#invisibleCanvas", tiles[0][0].value.value, function(){
            //return Caman("#invisibleCanvas", function(){
                var caman = this;
                caman.DEBUG = true;

                /*this.fillColor(0, 0, 0);
                var hue = tinycolor("#00FF00").toHsv().h;
                //hue = (hue*100)/360;
                console.log("Applying hue ", hue);
                //this.hue(hue);
                //this.colorize("#FF0000", 25);
                //this.saturation(100);
                this.color(hue);*/

                var renderTile = function(tiles){
                    if(tiles.length > 0){
                        var tile = tiles.pop();

                        renderImage(tile, tile[0].geoSparql.value);
                    }
                };

                var renderImage = function(tile, bound){
                    if(tile.length > 0) {
                        var image = tile.pop();
                        var band = self.getBand(image.band.value)[0];

                        if (band != null) {
                            //console.log("new image layer on band ", image.band.value);

                            caman.newLayer(function () {
                                this.setBlendingMode("addition");
                                console.log("Adding new layer to ", caman);
                                this.overlayImage(image.value.value);
                                console.log("overlaying image ", image.value.value);
                                var hue = tinycolor(band.color).toHsv().h;
                                //hue = (hue*100)/360;
                                console.log("Applying hue ", hue);
                                /*this.filter.hue(hue);*/
                                //this.filter.colorize(band.color, 5);
                                this.filter.color(hue);

                                renderImage(tile, bound);
                            });
                        } else {
                            //console.log("Val is null. Band is ", image.band.value);
                            renderImage(tile, bound);
                        }
                    } else {
                        console.log("Rendering Image");
                        caman.render(function () {
                            console.log("Rendered Image");
                            var png = document.getElementById('invisibleCanvas').toDataURL();
                            var opacity = 1/$scope.selected_bands.length;

                            console.log(png);
                            self.imageDict[png] = tile;

                            var coords = getBoundingCorners(String(bound));
                            var overlay = new L.imageOverlay(png, coords, {interactive: true, opacity: 1});
                            //var overlay = new L.imageOverlay(observations[i].value.value, coords, {interactive: true, opacity: opacity});

                            self.currentOverlay.push(overlay);
                            overlay.addTo(mymap);

                            renderTile(tiles);
                        });
                    }
                };

                renderTile(tiles);
            });
        };

        self.onMoveMap = function(zoomLevel, timePeriod){
            if(self.bands == null){
                self.performQueryLimitTime(zoomLevel, timePeriod);
            } else {
                mymap.spin(true);
                SearchService.performQueryLimitTime(zoomLevel, timePeriod).then(function (data) {
                    // Read new observations
                    var observations = data.results.bindings;
                    $scope.jsonVals = observations;

                    var tiles = [];
                    var tileLocations = [];

                    //Group observations by tile
                    for(var i in observations){
                        var observation = observations[i];
                        var dggsCell = observation.dggsCell.value.toString();

                        if(tileLocations.indexOf(dggsCell) >= 0){
                            if(tiles[tileLocations.indexOf(dggsCell)].indexOf(observation) < 0) {
                                tiles[tileLocations.indexOf(dggsCell)].push(observation)
                            }
                        } else {
                            tiles.push([observation]);
                            tileLocations.push(dggsCell);
                        }
                    }

                    self.colorizeImage(tiles);
                    mymap.spin(false);
                });
            }
        };

        $scope.onSettingSave = function(){
            if($scope.selectedBands().length == 0){
                $scope.show_settings_error_message = true;
                $scope.settings_error_message = "Error: Must select at least one band to display";
            } else {
                $scope.show_settings_error_message = false;
                $scope.selected_bands = $scope.selectedBands();
                console.log("Selected bands: " + $scope.selected_bands);
            }
        };

        self.setDefaultSettings = function(bands){
            //Band color settings
            for(var i=0; i<3; i++){
                $scope.selected_bands.push(bands[i]);
            }

            $scope.selected_bands[0].color = "#0000ff";
            $scope.selected_bands[0].selected = true;
            $scope.selected_bands[1].color = "#00ff00";
            $scope.selected_bands[1].selected = true;
            $scope.selected_bands[2].color = "#ff0000";
            $scope.selected_bands[2].selected = true;
        };

        var hue2rgb = function(p, q, t) {
            if (t < 0) t++;
            if (t > 1) t--;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };

        var hsl2rgb = function(h, s, l) {

            var r, g, b, q, p;

            h /= 360;

            if (s == 0) {
                r = g = b = l;
            } else {
                q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                p = 2 * l - q;

                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }

            return {
                r: r * 255,
                g: g * 255,
                b: b * 255};
        };
    });


/*.directive('band-colorpicker', function() {
 return {
 restrict: "AEC",
 //templateUrl: 'app/views/sidebar/bandCheckBox.html', // where myDirective binds to scope.myDirective
 template: '<div class="checkbox"> <label> <input type="checkbox"> {{band.name}} </label> <div id={{band.name}} class="input-group colorpicker-component"> <input type="text" value="#00AABB" class="form-control"/> <span class="input-group-addon"><i></i> </span> </div> </div>',
 scope: {
 band: '='
 },
 link: function (scope, element, attrs) {
 console.log('Do action with data', scope.band);
 console.log('Do action with data', element.innerHTML());
 }
 };
 });*/
