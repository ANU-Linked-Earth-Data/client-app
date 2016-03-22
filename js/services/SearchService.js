/**
 * Created by Duo on 22-Mar-16.
 */

app.factory('SearchService', function($http){
    var SearchService = {};

    SearchService.result = function() {
        $http.defaults.useXDomain = true;
        
        return $http.get('http://144.6.235.235/standalone/accidents.html')
            .then(function success(res) {
                // return the enveloped data
                console.log("Response: " + res.data.status);

                if (res.data.status > 200) {
                    return res.data.statusText;
                } else {
                    console.log("Getting response: " + res.data.status);
                    return res.data.message;
                }
            }, function failed(res){
                alert(res);
            });
    };

    return SearchService;
});

