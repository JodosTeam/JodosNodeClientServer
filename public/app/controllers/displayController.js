'use strict';
app.controller('displayController', ['$scope', '$location','$http', '$templateCache', 'authService','$rootScope' ,'$cookies',function ($scope, $location,$http ,$templateCache,authService,$rootScope,$cookies) {


    $scope.searchtext = 'iphone';
    $scope.message ='';
    $scope.testFun = $rootScope.testRoot;
    $scope.testProduct = [];
    
    $scope.searchProduct = function(txt,price){
      authService.searchGoogle(txt,price,$cookies.JodosGuid).then(function (results) {
            $scope.testProduct = results.data;
             $rootScope.testRoot = results.data;
            $location.path('/display');
        });
    };
   
}]);