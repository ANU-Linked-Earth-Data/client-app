/**
 * Created by Duo on 22-Mar-16.
 */

app.config(function($routeProvider){
    $routeProvider.when("/",
        {
            templateUrl: "html/search.html",
            controller: "SearchController",
            controllerAs: "sc"
        }
    ).when("/about.html",
        {
            templateUrl: "html/about.html",
            controller: "rootController",
            controllerAs: "rC"
        }
    ).when("/html/map.html",
        {
            templateUrl: "html/map.html",
            controller: "rootController",
            controllerAs: "rC"
        }
    ).when("/map.html",
        {
            templateUrl: "html/map.html",
            controller: "GoogleMapController",
            controllerAs: "gmc"
        }
    ).otherwise({
        redirectTo: '/html/search.html',
        controller: "SearchController",
        controllerAs: "sc"
    });
});
