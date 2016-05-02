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

    var mymap = L.map('mapid').setView([51.505, -0.09], 13);

    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'duo.00n45296',
        accessToken: 'pk.eyJ1IjoiZHVvIiwiYSI6ImNpbm52Y2lxdzB6emZ0dmx5MmNmNGZnejMifQ._yO4cALvQUPwvtVj_nUYEA'
    }).addTo(mymap);
});

app.controller('AppCtrl', function() {
    var self = this;
});
