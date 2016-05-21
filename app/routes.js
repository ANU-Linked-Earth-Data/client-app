/**
 * Created by Duo on 22-Mar-16.
 */

app.config(function($routeProvider){
    $routeProvider.when("/",
        {
            templateUrl: "search.html",
            controller: "SearchController",
            controllerAs: "sc"
        }
    ).otherwise({
        redirectTo: '/html/search.html',
        controller: "SearchController",
        controllerAs: "sc"
    });
});
