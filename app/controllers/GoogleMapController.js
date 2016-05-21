/**
 * Created by Duo on 22-Mar-16.
 */

app.controller('GoogleMapController', function($scope, uiGmapGoogleMapApi){
    $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

    uiGmapGoogleMapApi.then(function(maps) {
        console.log("Showing map"+maps);
    });
});