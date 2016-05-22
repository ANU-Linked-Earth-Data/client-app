'use strict';

/**
 * Created by Duo on 22-Mar-16.
 */

angular.module('LEDApp', [
    'ngRoute',
    'ngMessages',
    'rzModule'
]).config(function($routeProvider){
    $routeProvider.when("/", {
        templateUrl: "views/search.html",
        controller: "SearchController",
        controllerAs: "sc"
    }).otherwise({
        redirectTo: '/'
    });
});