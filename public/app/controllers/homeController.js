'use strict';
app.controller('homeController', ['$scope', '$location','$http', '$templateCache', 'authService','$rootScope', function ($scope, $location,$http ,$templateCache,authService,$rootScope) {


    $scope.searchtext = 'nexus';
    $scope.message ='';
    $scope.test = [];
    $scope.testProduct = [];
    //$scope.url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyAwFxWoXwWNts6fyZpN3cowCb5BXoL0qT4&cx=017135603890338635452:6y5bim-ajlo&fields=items/title,items/link,items/pagemap/offer&q=';

        $scope.searchApi = function () {

        authService.searchApi($scope.searchtext).then(function (results) {
            $rootScope.testRoot = results.data;
            $location.path('/display');
        },
         function (err) {
             $scope.message = err.error_description;
         });
    };

    $scope.searchProduct = function(itemName){
      authService.searchApi(itemName).then(function (results) {
            $scope.testProduct = results.data;
        });
    };

        $scope.searchLucky = function(){
      authService.searchGoogle($scope.searchtext).then(function (results) {
            $scope.testProduct = results.data;
             $rootScope.testRoot = results.data;
            $location.path('/display');
        });
    };

}]);