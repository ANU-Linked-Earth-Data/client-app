/**
 * Created by Duo on 22-Mar-16.
 */

app.controller('SearchController', function(SearchService){
    var self = this;
    this.hasSearched = false;

    self.getMessage = function() {
        self.hasSearched = true;
        SearchService.result().then(function (message) {
            self.message = message;
        });

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
        })
    };
});