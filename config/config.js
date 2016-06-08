'use strict';

// This module will get replaced during the build process; specifically, '@@foo'
// tells grunt-replace to use a real configuration in place of whatever is there
// at the moment. See
// http://newtriks.com/2013/11/29/environment-specific-configuration-in-angularjs-using-grunt/

angular.module('services.config', [])
  .constant('configuration', {
    foo: '@@foo'
  });
