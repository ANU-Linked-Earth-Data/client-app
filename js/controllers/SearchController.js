/**
 * Created by Duo on 22-Mar-16.
 */

app.controller('SearchController', function(SearchService){
    var self = this;
    this.hasSearched = false;

    var mymap = L.map('mapid').setView([51.505, -0.09], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'duo.00n45296',
        accessToken: 'pk.eyJ1IjoiZHVvIiwiYSI6ImNpbm52Y2lxdzB6emZ0dmx5MmNmNGZnejMifQ._yO4cALvQUPwvtVj_nUYEA'
    }).addTo(mymap);

    rdfstore.create(function(err, store) {
        // the new store is ready
        self.store = store;
    });

    self.getMessage = function() {
        self.hasSearched = true;

        SearchService.result(self.store).then(function (data) {
            self.data = data;

            //console.log("Data: " + res.data);
            //onsole.log("Headers: " + res.data.head);
            self.observations = data.results.bindings;
            console.log("Bindings: " + self.observations);


            for (i in self.observations){
                console.log("Shape: " + String(self.observations[i].geoSparql.value));

                var coords = getBoundingCorners(String(self.observations[i].geoSparql.value));

                L.imageOverlay(self.observations[i].image.value, coords).addTo(mymap).setOpacity(0.75);
                mymap.panTo(coords[0]);
            }
        });

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
});