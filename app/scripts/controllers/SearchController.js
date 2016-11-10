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
        var bounds;

        self.layers = L.control.layers(null);
        self.visibleLayers = [];

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

        bounds = mymap.getBounds();

        mymap.zoomControl.setPosition('topright');

        mymap.on('moveend', function(){
            bounds = mymap.getBounds();

            self.refreshOverlay(cachedZoomLevel, cachedTimePeriod);
        });

        mymap.on('click', function (e) {
            self.onClick(self.imageDict[e.originalEvent.srcElement.currentSrc]);
        });

        L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            id: 'duo.034p8op4',
            accessToken: 'pk.eyJ1IjoiZHVvIiwiYSI6ImNpbm52Y2lxdzB6emZ0dmx5MmNmNGZnejMifQ._yO4cALvQUPwvtVj_nUYEA'
        }).addTo(mymap);

        self.layers.addTo(mymap);

        var sidebar = L.control.sidebar('sidebar').addTo(mymap);

        var graph = L.control({position:"bottomright"});

        graph.onAdd = function () {
            var div = L.DomUtil.create('div');
            var container = L.DomUtil.create('div','',div);
            container.setAttribute('ng-include','\'views/charts/barchart.html\'');

            var newScope = $scope.$new();
            $compile(div)(newScope);

            return div;
        };

        /*var div = $("#graphPane");
        div.load("views/charts/barchart.html");
        var newScope = $scope.$new();
        $compile(div.contents())(newScope);*/

        //graph.addTo(mymap);

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

            //$scope.coord.lat = Number(imageDict[e.target.src].lat.value);
            //$scope.coord.lon = Number(imageDict[e.target.src].lon.value);
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
                    if(x >= $scope.bandList.length) {
                        $scope.bandList.push({name: x.toString(), color: "#FF0000", selected: false});
                    }

                }

                self.setDefaultSettings($scope.bandList);

                self.refreshOverlay(zoomLevel, timePeriod);
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
            var lat = Number(e[0].lat.value);
            var lon = Number(e[0].lon.value);

            lat = Math.round((lat + 0.00001) * 100) / 100;
            lon = Math.round((lon + 0.00001) * 100) / 100;

            $scope.clickedImage = e[0];
            $scope.clickedImage.lat = lat;
            $scope.clickedImage.lon = lon;

            $scope.$broadcast('onSelectRegion', $scope.clickedImage.dggsCell.value, $scope.clickedImage.band.value);
        };

        self.displayLayers = function(ls, modis, abs){
            self.visibleLayers.forEach(function(l){
                self.layers.removeLayer(l);
            });

            if(ls != null){
                self.layers.addBaseLayer(ls, "Landsat");
                self.visibleLayers.push(ls);
            }

            if(modis.length > 0){
                self.layers.addBaseLayer(L.layerGroup(modis), "MODIS");
                self.visibleLayers.push(modis);

            }

            if(abs.length > 0){
                self.layers.addBaseLayer(L.layerGroup(abs), "ABS");
                self.visibleLayers.push(abs);
            }

            if(self.visibleLayers.length > 0){
                self.visibleLayers[0].addTo(mymap);
            }

            mymap.spin(false);
        };

        self.loadAbsData = function(ls, modis, zoomLevel, timePeriod){
            SearchService.performAbsQueryLimitTime(zoomLevel, timePeriod).then(function (data) {
                // Read new observations

                var observations = data.results.bindings;
                $scope.absVals = observations;
                var overlays = [];


                observations.forEach(function(obs, index, arr){
                    console.log("Loading ABS data");

                    var image = obs.value.value;

                    var bound = obs.geoSparql.value;
                    var coords = getBoundingCorners(String(bound));
                    var overlay = new L.imageOverlay(image, coords, {interactive: true, opacity: 1});

                    self.imageDict[image] = obs;
                    self.currentOverlay.push(overlay);
                    overlays.push(overlay);
                });

                self.displayLayers(ls, modis, overlays);
            });
        };

        self.loadModisData = function(landsat, zoomLevel, timePeriod){
            var ls = landsat;
            SearchService.performModisQueryLimitTime(zoomLevel, timePeriod, bounds).then(function (data) {
                // Read new observations

                var observations = data.results.bindings;
                $scope.modisVals = observations;
                var overlays = [];

                observations.forEach(function(obs, index, arr){
                    var image = obs.value.value;

                    var bound = obs.geoSparql.value;
                    var coords = getBoundingCorners(String(bound));
                    var overlay = new L.imageOverlay(image, coords, {interactive: true, opacity: 1});

                    self.imageDict[image] = obs;
                    self.currentOverlay.push(overlay);
                    overlays.push(overlay);
                });

                self.loadAbsData(ls,overlays,zoomLevel,timePeriod);
            });
        };

        self.colorizeImage = function(tiles, zoomLevel, timePeriod){
            self.coloredTiles = [];

            if(tiles == null || tiles.length == 0){
                console.log("No Landsat Data");

                self.loadModisData(null, zoomLevel, timePeriod);
                return;
            }

            var canvas = document.getElementById("invisibleCanvas");
            var img = new Image;
            var w, h;
            var ctx = canvas.getContext('2d');

            var x = tiles.length-1;
            var tile = tiles[x];

            var i = tile.length-1;

            var coloredImage = null;

            var color = function(){
                if(i >= 0) {
                    var obs = tile[i];
                    i--;
                    var image = obs.value.value;
                    var band = self.getBand(obs.band.value)[0];

                    if(band != null) {
                        //console.log(image);
                        img.src = image;

                        img.onload = function () {
                            w = canvas.width = this.width;
                            h = canvas.height = this.height;

                            update();
                            color();
                        };
                    } else {
                        color();
                    }
                } else {
                    var png = document.getElementById('invisibleCanvas').toDataURL();

                    var bound = tile[0].geoSparql.value;
                    var coords = getBoundingCorners(String(bound));
                    var overlay = new L.imageOverlay(png, coords, {interactive: true, opacity: 1});

                    self.imageDict[png] = tile;
                    self.currentOverlay.push(overlay);
                    self.coloredTiles.push(overlay);

                    if(x >= 0){
                        tile = tiles[x];
                        x--;
                        i = tile.length-1;

                        coloredImage = null;

                        color();
                    } else {
                        self.loadModisData(L.layerGroup(self.coloredTiles), zoomLevel, timePeriod);
                    }
                }

                function update() {
                    ctx.drawImage(img, 0, 0);
                    var hue = tinycolor(band.color).toHsv().h;

                    var idata = ctx.getImageData(0, 0, w, h),
                        data = idata.data,
                        len = data.length,
                        i = 0;

                    if(coloredImage == null){
                        var ImageBuffer = new ArrayBuffer(len);
                        coloredImage = new Uint8Array(ImageBuffer);
                    }

                    //console.log("Hue: ", hue);

                    for (; i < len; i += 4) {

                        var lum = data[i] / 255;
                        var col = hsl2rgb(hue, 1, lum);

                        coloredImage[i] = Math.max(coloredImage[i], col.r);
                        coloredImage[i+1] = Math.max(coloredImage[i+1], col.g);
                        coloredImage[i+2] = Math.max(coloredImage[i+2], col.b);

                        data[i] = coloredImage[i];
                        data[i + 1] = coloredImage[i+1];
                        data[i + 2] = coloredImage[i+2];
                    }

                    //idata.data = coloredImage;

                    ctx.putImageData(idata, 0, 0);
                }
            };

            color();
        };

        self.refreshOverlay = function(zoomLevel, timePeriod){
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

                    // Clear current overlay
                    for (var i in self.currentOverlay) {
                        mymap.removeLayer(self.currentOverlay[i]);
                        if(self.overlayMaps != null) {
                            if (self.overlayMaps.LandSat != null) {
                                self.overlayMaps.LandSat.clearOverlay();
                            }

                            if(self.overlayMaps.Modis != null){
                                self.overlayMaps.Modis.clearOverlay();
                            }
                        }
                    }

                    self.currentOverlay = [];

                    self.colorizeImage(tiles, zoomLevel, timePeriod);
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
                //console.log("Selected bands: " + $scope.selected_bands);

                self.refreshOverlay(cachedZoomLevel, cachedTimePeriod);
            }
        };

        self.setDefaultSettings = function(bands){
            //Band color settings
            for(var i=$scope.selected_bands.length; i<bands.length; i++){
                $scope.selected_bands.push(bands[i]);
            }

            $scope.selected_bands[3].color = "#0000ff";
            $scope.selected_bands[3].selected = true;
            $scope.selected_bands[4].color = "#00ff00";
            $scope.selected_bands[4].selected = true;
            $scope.selected_bands[5].color = "#ff0000";
            $scope.selected_bands[5].selected = true;
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
