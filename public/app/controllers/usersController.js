'use strict';
app.controller('usersController', ['$scope', '$location', 'usersService', 'authService', function ($scope, $location, usersService, authService) {

    $scope.users = [];
    $scope.roles = [];
    $scope.currentUser = null;
    $scope.isEdit = false;
    $scope.isAdd = false;
    $scope.savedSuccessfully = false;
    $scope.message = "";
    $scope.removeMessage = "";
    $scope.registration = {
        role:"",
        userName: "",
        password: "",
        confirmPassword: "",
        firstName: "",
        lastName: ""
    };


    $scope.updateUser = function () {
        usersService.updateUser($scope.currentUser).then(function (results) {
            
        }, function (error) {
            $scope.removeMessage = error.data.Message;
        });
        
    };

    $scope.removeUser = function () {
        authService.removeUser($scope.currentUser.UserName).then(function (results) {
            $scope.users.splice($scope.users.indexOf($scope.currentUser), 1);
            $scope.isEdit = false;
        }, function (error) {
            $scope.removeMessage = error.data.Message;
        });
    };
    
    $scope.setCurrentUser = function (user) {
        $scope.isEdit = true;
        $scope.isAdd = false;
        $scope.currentUser = user;
    };

    $scope.addUserView = function ()
    {
        $scope.isAdd = true;
        $scope.isEdit = false;
    };

    usersService.getUsers().then(function (results) {

        $scope.users = results.data.users;
        $scope.roles = results.data.roles;
        $scope.currentUser = $scope.users[0];
        $scope.registration.role = $scope.roles[0].Name;

    }, function (error) {});

    $scope.signUp = function () {

        authService.saveRegistration($scope.registration).then(function (response) {
            $scope.savedSuccessfully = true;
            $scope.users.push(response.data);

            $scope.registration = {
                userName: "",
                password: "",
                confirmPassword: "",
                firstName: "",
                lastName: "",
                role: $scope.roles[0].Name
            };

            $scope.message = "המשתמש הוסף בהצלחה!.";

        }, function (response) {
             var errors = [];
             for (var key in response.data.ModelState) {
                 for (var i = 0; i < response.data.ModelState[key].length; i++) {
                     errors.push(response.data.ModelState[key][i]);
                 }
             }
             $scope.message = "הוספת המשתמש נכשלה בגלל:\n" + errors.join('\n');
         });
    };

}]);