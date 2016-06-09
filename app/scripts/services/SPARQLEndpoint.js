'use strict';

angular.module('LEDApp')
        .factory('SPARQLEndpoint', function($http, $q, config) {
        var SPARQLEndpoint = {};

        $http.defaults.useXDomain = true;

        SPARQLEndpoint._urls = config['sparql-endpoints'];

        // This method just finds a working endpoint URL by blasting describe
        // queries at everything in the config['sparql-endpoints'] list.
        SPARQLEndpoint._getURL = function() {
            return $q(function(resolve, reject) {
                if ('_url' in this) {
                    resolve(this._url);
                    return;
                }
                var nextURL = this._urls.shift();
                if (nextURL === undefined) {
                    reject("Couldn't find a working endpoint URL");
                    return;
                }

                var req = {
                    method: 'GET',
                    url: nextURL,
                    params: {
                        query: 'DESCRIBE <>'
                    },
                    headers: {
                        'Accept': 'application/sparql-results+json,*/*;q=0.9'
                    }
                };

                $http(req).then(function() {
                    // All good!
                    this._url = nextURL;
                    console.info('Selected endpoint: ' + this._url);
                    resolve(this._url);
                }.bind(this), function (reason) {
                    console.warn('Endpoint ' + nextURL + ' down, status: ' + reason.status);
                    this._getURL().then(resolve, reject);
                }.bind(this));
            }.bind(this));
        }.bind(SPARQLEndpoint);

        // This method actually runs a SPARQL query against the configured
        // endpoint.
        SPARQLEndpoint.query = function(queryString) {
            return $q(function(resolve, reject) {
                this._getURL().then(function(endpointURL) {
                    var req = {
                        method: 'GET',
                        url: endpointURL,
                        params: {
                            query: queryString
                        },
                        headers: {
                            'Accept': 'application/sparql-results+json,*/*;q=0.9'
                        }
                    };

                    return $http(req);
                }).then(function(response) {
                    resolve(response.data);
                }, function(reason){
                    reject(reason);
                });
            }.bind(SPARQLEndpoint));
        };

        return SPARQLEndpoint;
    });
