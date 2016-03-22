/**
 * Created by Duo on 22-Mar-16.
 */

app.factory('SearchService', function($http){
    var SearchService = {};

    SearchService.result = function() {
        $http.defaults.useXDomain = true;
        
        return $http.get('http://144.6.235.235/standalone/accidents.rdf')
            .then(function success(res) {
                // return the enveloped data
                console.log("Response: " + res.data);

                if (res.data.status > 200) {
                    return res.data.statusText;
                } else {
                    console.log("Getting response: " + res.data);
                    return res.data;
                }
            }, function failed(res){
                alert(res);
            });
    };

    return SearchService;
});

