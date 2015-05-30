'use strict';
app.controller('displayController', ['$scope', '$location','$http', '$templateCache', 'authService','$rootScope' ,function ($scope, $location,$http ,$templateCache,authService,$rootScope) {


    $scope.searchtext = 'iphone';
    $scope.message ='';
    $scope.testFun = $rootScope.testRoot;
    $scope.testProduct = [];
    
    $scope.searchProduct = function(txt,price){
      authService.searchGoogle(txt,price).then(function (results) {
            $scope.testProduct = results.data;
             $rootScope.testRoot = results.data;
            $location.path('/display');
        });
    };
   
}]);