'use strict';
app.controller('homeController', ['$scope', '$location','$http', '$templateCache', 'authService','$rootScope','$cookies', function ($scope, $location,$http ,$templateCache,authService,$rootScope,$cookies) {


    $scope.searchtext = 'nexus';
    $scope.message ='';
    $scope.test = [];
    $scope.testProduct = [];
   


     $scope.init = function () {
        
        var MyCookie = $cookies.JodosGuid;
        
        if(MyCookie == undefined)
        {
          authService.getGuid().then(function (results){
              // Setting a cookie
              $cookies.JodosGuid = results.data;
            });
        }
    }

    $scope.init();

        $scope.searchApi = function () {

        authService.searchApi($scope.searchtext,$cookies.JodosGuid).then(function (results) {
            $rootScope.testRoot = results.data;
            $location.path('/display');
        },
         function (err) {
             $scope.message = err.error_description;
         });
    };

    $scope.searchProduct = function(itemName,itemPrice){
      authService.searchApi(itemName,itemPrice).then(function (results) {
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