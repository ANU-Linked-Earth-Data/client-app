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
    };
});