'use strict';
app.controller('indexController', ['$scope', '$location', 'authService', '$rootScope', function ($scope, $location, authService, $rootScope) {

    $scope.logOut = function () {
        authService.logOut();

        $location.path('/login');

    }

    $scope.authentication = authService.authentication;

/*  
    $rootScope.refreshMenuItems = function (authService) {
        $rootScope.menuItems = []

        authService.getMenuItems().then(function (results) {

            $rootScope.menuItems = results.data;

        }, function (error) {
            authService.logOut();
        });
    }

    $rootScope.refreshMenuItems(authService);
*/
    

}]);