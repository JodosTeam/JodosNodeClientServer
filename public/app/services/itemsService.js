'use strict';
app.factory('itemsService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var codeServiceFactory = {};

    var _getItems = function (searchText) {
        return $http.post(serviceBase + '/api/items', searchText).then(function (results) {
                return results;
        });
    };
    
    codeServiceFactory.getItems = _getItems;

    return codeServiceFactory;

}]);