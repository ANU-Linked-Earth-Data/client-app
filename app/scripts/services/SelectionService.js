'use strict';

angular.module('LEDApp')
    .service('selection', function() {
        var service = this;

        service.coord = {lat: null, lon: null};
        service.counter = 0;
    });
