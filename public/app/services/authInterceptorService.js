'use strict';
app.factory('authInterceptorService', ['$q', '$injector','$location', 'localStorageService','ngAuthSettings', function ($q, $injector,$location, localStorageService,ngAuthSettings) {
    var serviceBase = ngAuthSettings.apiServiceBaseUri;
    var authInterceptorServiceFactory = {};

    var _request = function (config) {

        config.headers = config.headers || {};
       
        var authData = localStorageService.get('authorizationData');
        if (authData && config.url.indexOf(serviceBase) > -1) {
            config.headers.Authorization = 'Bearer ' + authData.token;
        }

        return config;
    }

    var _responseError = function (rejection) {
        if (rejection.status === 401) {

            if ($location.$$path != '/login/')
                $location.path('/home/');
            else if ($location.$$path != '/home/')
            {

            }
        }
        return $q.reject(rejection);
    }

    authInterceptorServiceFactory.request = _request;
    authInterceptorServiceFactory.responseError = _responseError;

    return authInterceptorServiceFactory;
}]);