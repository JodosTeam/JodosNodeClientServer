  'use strict';
  app.controller('homeController', ['$scope', '$location','$http', '$templateCache', 'authService','$rootScope','$cookies', function ($scope, $location,$http ,$templateCache,authService,$rootScope,$cookies) {


      $scope.searchtext = 'nexus';
      $scope.message ='';
      $scope.test = [];
      $scope.testProduct = [];
      $scope.isSearchedApiEnabled = false;
      $scope.isGoogleApiEnabled = false;
      $scope.CurrentProduct = {};
      $scope.testKoko = [];

     
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
            $scope.isSearchedApiEnabled = true;
          authService.searchApi($scope.searchtext,$cookies.JodosGuid).then(function (results) {

              //$rootScope.testRoot = results.data;
              $scope.testFun = results.data;
   
              $scope.$apply()
          },
           function (err) {
               $scope.message = err.error_description;
           });
      };


      var socket = io();

      socket.on('chat message', function (msg) {
         //$scope.testKoko = msg;
         var itm = msg[0];

         itm.ImageUrl = $scope.imgUrl1;
         $scope.testKoko.push(itm);


         $scope.$apply()
      });

        $scope.searchProduct = function(txt,price,imgUrl,itemUrl){
        $scope.testKoko = [];
        $scope.isGoogleApiEnabled = true;
        $scope.CurrentProduct.ItemName = txt;
        $scope.CurrentProduct.ItemPrice = price;
        $scope.CurrentProduct.ImageUrl = imgUrl;
        $scope.CurrentProduct.ItemUrl = itemUrl;

        $scope.imgUrl1 = imgUrl;
        authService.searchGoogle(txt,price,imgUrl,$cookies.JodosGuid).then(function (results) {
              
              $scope.testProduct = results.data;
              //$rootScope.testRoot = results.data;
              //$location.path('/display');  
          });
      };



  }]);