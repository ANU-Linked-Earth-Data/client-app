'use strict';

describe('Controller: SearchController', function () {

  // load the controller's module
  beforeEach(module('LEDApp'));

  var SearchController,
    scope;

  // Initialize the controller and a mock scope
  beforeEach(inject(function ($controller, $rootScope) {
    scope = $rootScope.$new();
    SearchController = $controller('SearchController', {
      $scope: scope
      // place here mocked dependencies
    });
  }));

  /*it('should attach selectGeolocation to the scope', function () {
    expect(SearchController.selectGeolocation).toBe(null);
  });*/
});
