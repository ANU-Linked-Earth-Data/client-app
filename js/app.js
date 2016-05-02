/**
 * Created by Duo on 22-Mar-16.
 */

var app = angular.module('LEDApp', ['ngRoute','uiGmapgoogle-maps'])
    .config(function(uiGmapGoogleMapApiProvider) {
        uiGmapGoogleMapApiProvider.configure({
            key: 'AIzaSyDtKR_08r8JNQdxjLflpWqS3kSDF3fBBp8',
            v: '3.23', //defaults to latest 3.X anyhow
            libraries: 'weather,geometry,visualization'
        });
    });


app.controller('rootController', function() {
    
});

app.controller('AppCtrl', function() {
    var self = this;
});
