﻿  'use strict';
  app.controller('homeController', ['$scope', '$location', '$http', '$templateCache', 'authService', '$rootScope', '$cookies', '$anchorScroll', function($scope, $location, $http, $templateCache, authService, $rootScope, $cookies, $anchorScroll) {


      $scope.searchtext = 'nexus';
      $scope.message = '';
      $scope.test = [];
      $scope.testProduct = [];
      $scope.isSearchedApiEnabled = false;
      $scope.isGoogleApiEnabled = false;
      $scope.CurrentProduct = {};
      $scope.testKoko = [];


      $scope.init = function() {

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
          $scope.isSearchedApiEnabled = true;
          authService.searchApi($scope.searchtext, $cookies.JodosGuid).then(function(results) {

                  //$rootScope.testRoot = results.data;
                  $scope.testFun = results.data;
                  console.log($scope.testFun);

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


      socket.on('updateGuid', function(guid) {

          $cookies.JodosGuid = guid;
          //console.log(guid);

          //  $scope.$apply();
      });

      $(document).keypress(function(e) {
          if (e.which == 13) {
              $scope.searchApi();
              $scope.isGoogleApiEnabled = true;
              $location.hash('results');
              $anchorScroll();
          }
      });
      $(function() {
          var availableTags = [
              "ActionScript",
              "AppleScript",
              "Asp",
              "BASIC",
              "C",
              "C++",
              "Clojure",
              "COBOL",
              "ColdFusion",
              "Erlang",
              "Fortran",
              "Groovy",
              "Haskell",
              "Java",
              "JavaScript",
              "Lisp",
              "Perl",
              "PHP",
              "Python",
              "Ruby",
              "Scala",
              "Scheme"
          ];
          $("#searchbar").autocomplete({
              source: availableTags
          });
      });


  }]);
