/**
 * Created by Duo on 22-Mar-16.
 */

var app = angular.module('LEDApp', ['ngRoute'])
    .controller('rootController', function() {
        
    });

app.controller('AppCtrl', function() {
    var self = this;
    self.message = "The app routing is working!";
});
