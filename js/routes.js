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
    ).when("/html/about.html",
        {
            templateUrl: "html/about.html",
            controller: "AppCtrl",
            controllerAs: "app"
        }
    )
});