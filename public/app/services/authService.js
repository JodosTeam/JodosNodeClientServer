'use strict';
app.factory('authService', ['$http', '$q', 'localStorageService', 'ngAuthSettings', '$rootScope','$location', function ($http, $q, localStorageService, ngAuthSettings, $rootScope,$location) {

    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var authServiceFactory = {};

    var _authentication = {
        isAuth: false,
        userName: "",
        useRefreshTokens: false
    };

    var _saveRegistration = function (registration) {

        return $http.post(serviceBase + 'api/account/register', registration).then(function (response) {
            return response;
        });

    };

    var _removeUser = function (UserName) {

        return $http.post(serviceBase + 'api/account/removeUser', '"'+UserName+'"').then(function (response) {
            return response;
        });

    };

    var url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAwFxWoXwWNts6fyZpN3cowCb5BXoL0qT4&cx=017135603890338635452:l5ri3atpm-y&fields=items/title,items/link,items/pagemap/offer&q=';

    var _getUserFace = function() {

        return $http.get(serviceBase + 'getLoginUser').then(function (results) {
            return results;
        });
    };

        var _getFavorites = function() {

        
        return $http.get(serviceBase + 'api/favorite').then(function (results) {
            return results;
        });
    };



    var _searchApi = function(searchtext,myGUID) {

       
        return $http.post(serviceBase + 'api/items',{'searchtext':searchtext,'guid': myGUID}).then(function (results) {
            return results;
        });
    };

    var _searchGoogle = function(searchtext,price,imgUrl,guid) {

        return $http.post(serviceBase + 'api/items/google',{'searchtext':searchtext,'Price':price,'imgUrl':imgUrl,'Guid':guid}).then(function (results) {
            return results;
        });
    };

    var _saveToFavorite = function(searchtext,price,itmUrl,desc) {

        return $http.post(serviceBase + 'api/favorite/add',{'searchtext':searchtext,'Price':price,'itmUrl':itmUrl,'desc':desc}).then(function (results) {
            return results;
        });
    };

       var _updateFavorite = function(id,desc) {

        return $http.post(serviceBase + 'api/favorite/update',{'id':id,'desc':desc}).then(function (results) {
            return results;
        });
    };

    var _deleteFavorite = function(id) {

        return $http.post(serviceBase + 'api/favorite/delete',{'id':id}).then(function () {
            
        });
    };

       var _getGroup = function() {

        return $http.get(serviceBase + 'api/favorite/group').then(function (results) {
            return results;
        });
    };

    var _getGuid = function() {

        return $http.post(serviceBase + 'api/items/guid').then(function (results) {
            return results;
        });
    };

    var _login = function (loginData) {
       
        var data = "grant_type=password&username=" + loginData.userName + "&password=" + loginData.password;

        if (loginData.useRefreshTokens) {
            data = data + "&client_id=" + ngAuthSettings.clientId;
        }

        var deferred = $q.defer();

        $http.post(serviceBase + 'token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }).success(function (response) {

            if (loginData.useRefreshTokens) {
                localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName, refreshToken: response.refresh_token, useRefreshTokens: true });
            }
            else {
                localStorageService.set('authorizationData', { token: response.access_token, userName: loginData.userName, refreshToken: "", useRefreshTokens: false });
            }
            _authentication.isAuth = true;
            _authentication.userName = loginData.userName;
            _authentication.useRefreshTokens = loginData.useRefreshTokens;

            deferred.resolve(response);

        }).error(function (err, status) {
            _logOut();
            deferred.reject(err);
        });

        return deferred.promise;

    };

    var _logOut = function () {

        localStorageService.remove('authorizationData');

        _authentication.isAuth = false;
        _authentication.userName = "";
        _authentication.useRefreshTokens = false;
        $rootScope.menuItems = [];
        $location.path('/login');
    };

    var _fillAuthData = function () {

        var authData = localStorageService.get('authorizationData');
        if (authData) {
            _authentication.isAuth = true;
            _authentication.userName = authData.userName;
            _authentication.useRefreshTokens = authData.useRefreshTokens;
        }

    };

    var _getMenuItems = function () {

        return $http.get(serviceBase + 'api/account/getMenuItems').then(function (results) {
            return results;
        });
    };

    authServiceFactory.getMenuItems = _getMenuItems;
    authServiceFactory.saveRegistration = _saveRegistration;
    authServiceFactory.login = _login;
    authServiceFactory.removeUser = _removeUser;
    authServiceFactory.logOut = _logOut;
    authServiceFactory.fillAuthData = _fillAuthData;
    authServiceFactory.authentication = _authentication;
    authServiceFactory.searchApi = _searchApi;
    authServiceFactory.searchGoogle = _searchGoogle;
    authServiceFactory.getGuid = _getGuid;
    authServiceFactory.getUserFace = _getUserFace;
    authServiceFactory.saveToFavorite = _saveToFavorite;
    authServiceFactory.getFavorites = _getFavorites;
    authServiceFactory.deleteFavorite = _deleteFavorite;
    authServiceFactory.updateFavorite = _updateFavorite;
    authServiceFactory.getGroup = _getGroup
    

    return authServiceFactory;
}]);