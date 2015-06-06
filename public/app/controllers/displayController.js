'use strict';
app.controller('displayController', ['$scope', '$location','$http', '$templateCache', 'authService','$rootScope' ,'$cookies',function ($scope, $location,$http ,$templateCache,authService,$rootScope,$cookies) {


    var test = [];

    $scope.searchtext = 'iphone';
    $scope.message ='';
    $scope.testFun = $rootScope.testRoot;
    $scope.testProduct = [];
    
    $scope.searchProduct = function(txt,price,imgUrl){
      authService.searchGoogle(txt,price,imgUrl,$cookies.JodosGuid).then(function (results) {
            $scope.testProduct = results.data;
             $rootScope.testRoot = results.data;
            $location.path('/display');
        });
    };

    var socket = io();

    socket.on('chat message', function (msg) {
       $scope.testFun = msg;
       //console.log(test);
       console.log($scope.testFun);
       console.log('length: '+ $scope.testFun.length);

       $scope.$apply()
    });

   
}]);