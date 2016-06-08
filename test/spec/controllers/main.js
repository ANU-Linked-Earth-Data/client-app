'use strict';

xdescribe('Controller: SearchController', function () {

    // load the controller's module
    beforeEach(module('LEDApp'));

    var SearchController,
        scope,
        compile;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope, $compile) {
        scope = $rootScope.$new();
        compile = $compile;
        SearchController = $controller('SearchController', {
            '$scope': scope
            // place here mocked dependencies
        });
    }));

    /*it('should attach selectGeolocation to the scope', function () {
     expect(SearchController.selectGeolocation).toBe(null);
     });*/

    it("contains spec with an expectation", function() {
        var element = angular.element('<leaflet center="center" controls="mapControls"></leaflet>');
        element = compile(element)(scope);

        expect(true).toBe(true);
    });
});

describe('Search Service Test', function(){
    describe('Simple Search Test', function(){
        beforeAll(function(){
            beforeEach(module('LEDApp'));
        });

        it('Get service', inject(function($http, SearchService){
            expect(SearchService).toBeDefined();
            expect(SearchService.getDistinctTime()).toBeDefined();
        }));

        it('Valid Dates', inject(function(SearchService){
            SearchService.getDistinctTime().then(function(options){
                expect(options).toBeDefined();
                expect(moment(options[0]) <= moment(options[options.length-1]));
            });
        }));

        it('Valid output', function(){
            expect(true).toBe(true);
        });
    });
});
