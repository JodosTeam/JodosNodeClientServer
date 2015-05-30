
var app = angular.module('AngularAuthApp', ['ngRoute', 'LocalStorageModule', 'angular-loading-bar','ngCookies']);

app.config(function ($routeProvider) {

    $routeProvider.when("/home/", {
        controller: "homeController",
        templateUrl: "app/views/home.html"
    });
    $routeProvider.when("/users/", {
        controller: "usersController",
        templateUrl: "/app/views/users.html"
    });
    $routeProvider.when("/display/", {
        controller: "displayController",
        templateUrl: "/app/views/display.html"
    });
    $routeProvider.otherwise({ redirectTo: "/home/" });

});

app.constant('ngAuthSettings', {
    apiServiceBaseUri:
       'http://localhost:3000/',
    //'http://ayevendanieln:2617/', //IIS
    clientId: 'ngAuthApp'
});

app.config(function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptorService');
});

app.run(['authService', function (authService) {
    authService.fillAuthData();
}]);


