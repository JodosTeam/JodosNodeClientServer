'use strict';
app.factory('usersService', ['$http', 'ngAuthSettings', function ($http, ngAuthSettings) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;

    var usersServiceFactory = {};

    var _getUsers = function () {

        return $http.get(serviceBase + 'api/account/getAllUsers').then(function (results) {
            return results;
        });
    };

    var _updateUser = function (user) {

        return $http.post(serviceBase + 'api/account/updateUser',user).then(function (results) {
            return results;
        });
    };

    

    usersServiceFactory.getUsers = _getUsers;
    usersServiceFactory.updateUser = _updateUser;

    return usersServiceFactory;

}]);