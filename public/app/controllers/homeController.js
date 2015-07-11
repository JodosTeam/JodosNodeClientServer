  'use strict';
  app.controller('homeController', ['$scope', '$location', '$http', '$templateCache', 'authService', '$rootScope', '$cookies', '$anchorScroll', function($scope, $location, $http, $templateCache, authService, $rootScope, $cookies, $anchorScroll) {


      $scope.searchtext = 'nexus';
      $scope.message = '';
      $scope.test = [];
      $scope.user = null;
      $scope.testProduct = [];
      $scope.isSearchedApiEnabled = false;
      $scope.isGoogleApiEnabled = false;
      $scope.CurrentProduct = {};
      $scope.testKoko = [];
      $scope.Favorites = [];
      $scope.Groups = [];

      $scope.dynamicPopover = {
          content: 'Add Description',
          templateUrl: 'myPopoverTemplate.html',
          description: ''
      };

      $scope.init = function() {

          authService.getUserFace().then(function(results) {
              $scope.user = results.data.user;
          });

          authService.getFavorites().then(function(results) {
              $scope.Favorites = results.data;
          });

          authService.getGroup().then(function(results) {
              $scope.Groups = results.data;

          });

          var MyCookie = $cookies.JodosGuid;

          if (MyCookie == undefined) {
              authService.getGuid().then(function(results) {
                  // Setting a cookie
                  //   $cookies.JodosGuid = results.data;
              });
          }
      }

      $scope.init();

      $scope.searchApi = function() {
          $scope.testFun = [];
          $scope.message = '';
          $scope.isSearchedApiEnabled = true;
          authService.searchApi($scope.searchtext, $cookies.JodosGuid).then(function(results) {

                  //$rootScope.testRoot = results.data;
                  $scope.testFun = results.data;

              },
              function(err) {
                  $scope.message = err.error_description;
              });
      };


      var socket = io();

      socket.on('chat message', function(msg) {
          //$scope.testKoko = msg;
          var itm = msg[0];

          itm.ImageUrl = $scope.imgUrl1;
          $scope.testKoko.push(itm);


          $scope.$apply()
      });

      $scope.searchProduct = function(txt, price, imgUrl, itemUrl) {
          $location.hash('compare');
          $anchorScroll();
          $scope.testKoko = [];
          $scope.isGoogleApiEnabled = true;
          $scope.CurrentProduct.ItemName = txt;
          $scope.CurrentProduct.ItemPrice = price;
          $scope.CurrentProduct.ImageUrl = imgUrl;
          $scope.CurrentProduct.ItemUrl = itemUrl;

          $scope.imgUrl1 = imgUrl;
          authService.searchGoogle(txt, price, imgUrl, $cookies.JodosGuid).then(function(results) {

              $scope.testProduct = results.data;
              //$rootScope.testRoot = results.data;
              //$location.path('/display');  
          });

          console.log('$cookies.JodosGuid - ' + $cookies.JodosGuid);
          var obj = {
              txt: txt,
              price: price,
              imgUrl: imgUrl,
              guid: $cookies.JodosGuid
          };

          var socket = io();
          socket.emit('newSearch', obj);
      };

      $scope.saveToFavorite = function(txt, price, itemUrl, desc) {
          authService.saveToFavorite(txt, price, itemUrl, desc).then(function(results) {

              authService.getFavorites().then(function(results) {

                  $scope.Favorites = results.data;
                  $scope.$apply();
              });
              //$rootScope.testRoot = results.data;
              //$location.path('/display');  
          });


      };

      $scope.UpdateDesc = function(id, desc) {
          authService.updateFavorite(id, desc).then(function() {
              //TODO::delete from favirotes

          });

      }

      $scope.DeleteFavo = function(id) {
          authService.deleteFavorite(id).then(function() {
              //TODO::delete from favirotes
              authService.getFavorites().then(function(results) {
                  $scope.Favorites = results.data;
                  $scope.$apply();
              });

          });


      };

      socket.on('updateGuid', function(guid) {

          $cookies.JodosGuid = guid;
          console.log(guid);

          //  $scope.$apply();
      });
  }]);
