'use strict';
app.controller('displayController', ['$scope', '$location','$http', '$templateCache', 'authService','$rootScope' ,'$cookies',function ($scope, $location,$http ,$templateCache,authService,$rootScope,$cookies) {

    var test = [];

    $scope.searchtext = 'iphone';
    $scope.message ='';
    $scope.testFun = $rootScope.testRoot;
    $scope.testKoko= [];
    $scope.testProduct = [];
    $scope.imgUrl1 ='sss';
    
    $scope.searchProduct = function(txt,price,imgUrl){

      $scope.imgUrl1 = imgUrl;
      authService.searchGoogle(txt,price,imgUrl,$cookies.JodosGuid).then(function (results) {
            
            $scope.testProduct = results.data;
            $rootScope.testRoot = results.data;
            $location.path('/display');  
        });
    };

    var socket = io();

    socket.on('chat message', function (msg) {
       //$scope.testKoko = msg;
       var itm = msg[0];

       itm.ImageUrl = $scope.imgUrl1;
        console.log($scope.imgUrl1);
       console.log(itm);
       $scope.testKoko.push(itm);


       $scope.$apply()
    });

   
}]);