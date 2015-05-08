'use strict';
app.factory('codeService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var codeServiceFactory = {};

    var _getCodes = function (fatherId) {

        return $http.post(serviceBase + 'api/agra/getCodes', fatherId).then(function (results) {
            return results;
        });
    };
    
    var _getCodesWithAll = function(fatherId)
    {
        return $http.post(serviceBase + 'api/agra/getCodesWithAll', fatherId).then(function (results) {
            return results;
        });
    }

    var _getAllCodes = function () {

        return $http.post(serviceBase + 'api/code/getAllCodes').then(function (results) {
            return results;
        });
    };

    var _insertCode = function (code) {

        return $http.post(serviceBase + 'api/code/insertCode', code).then(function (results) {
            return results;
        });
    };

    var _deleteCode = function (code) {

        return $http.post(serviceBase + 'api/code/deleteCode', code).then(function (results) {
            return results;
        });
    };


    var _updateCode = function (code) {

        return $http.post(serviceBase + 'api/code/updateCode', code).then(function (results) {
            return results;
        });
    };

    codeServiceFactory.getCodes = _getCodes;
    codeServiceFactory.insertCode = _insertCode;
    codeServiceFactory.deleteCode = _deleteCode;
    codeServiceFactory.updateCode = _updateCode;
    codeServiceFactory.getAllCodes = _getAllCodes;
    codeServiceFactory.getCodesWithAll = _getCodesWithAll;

    return codeServiceFactory;

}]);