'use strict';

angular.module('LEDApp', [
    'services.config',
    'ngRoute',
    'ngMessages',
    'rzModule',
    'leaflet-directive',
    'chart.js',
    'color.picker'
]).config(function($routeProvider){
    $routeProvider.when("/", {
        templateUrl: "views/search.html",
        controller: "SearchController",
        controllerAs: "sc"
    }).otherwise({
        redirectTo: '/'
    });
});
