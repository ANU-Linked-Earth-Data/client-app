'use strict';

angular.module('LEDApp', [
    'ngRoute',
    'ngMessages',
    'rzModule',
    'leaflet-directive'
]).config(function($routeProvider){
    $routeProvider.when("/", {
        templateUrl: "views/search.html",
        controller: "SearchController",
        controllerAs: "sc"
    }).otherwise({
        redirectTo: '/'
    });
});
