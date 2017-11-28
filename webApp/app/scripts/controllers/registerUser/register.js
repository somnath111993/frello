'use strict';

/**
 * @ngdoc function
 * @name frelloApp.controller:UserRegisterCtrl
 * @description
 * # registerCtrl
 * Controller of the frelloApp
 */

angular.module('frelloApp')
    .controller('registerCtrl', ['$scope', '$timeout', '$state', '$window', '$document', 'userService', 'registerService', '$rootScope', function ($scope, $timeout, $state, $window, $document, userService, registerService, $rootScope) {


        $scope.regexUsername = /^[a-z0-9A-Z]+$/;
        $scope.regexFirstName = '^[a-zA-Z]+$';
        $scope.regexLastName = '^[a-zA-Z]*$';
        $scope.regexEmail = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
        $scope.regexPhone = /^[0-9]{10,10}$/;
        $scope.loader = false;
        $scope.passMatchFailed = false;


        /*
         |-------------------------------------------------------------------------------|
         |    USERNAME VALIDATION                                                        |
         |-------------------------------------------------------------------------------|
         */

        $scope.checkUsernameValid = function () {
            if ($scope.username && $scope.username.length >= 6) {
                $scope.showAvailability = true;
                $scope.showErrorMsg = false;
            } else {
                $scope.showAvailability = false;
                $scope.showErrorMsg = true;
            }
            if ($scope.usernameTimeout) {
                clearTimeout($scope.usernameTimeout);
            }
            $scope.usernameTimeout = setTimeout(function () {
                registerService.checkUsername({'username': $scope.username}).then(function (result) {

                    if (!result.data.status) {
                        //raise username not unique flag
                        $scope.uniqueUsername = false;
                        $scope.available = false;
                    } else {
                        if ($scope.username && $scope.username.match($scope.regexUsername) != null) {
                            $scope.uniqueUsername = true;
                            $scope.available = true;
                        } else {
                            $scope.available = false;
                        }
                    }
                });
            }, 500);
        };

        /*
         |-------------------------------------------------------------------------------|
         |    Match Password and Confirm Password                                        |
         |-------------------------------------------------------------------------------|
         */
        $scope.matchPassword = function () {
            if ($scope.password !== $scope.cPassword) {
                $scope.passMatchFailed = true;
            }
            else {
                $scope.passMatchFailed = false;
            }
        };


        /*
         |-------------------------------------------------------------------------------|
         |    Disable SignUp button on form validation errors                            |
         |-------------------------------------------------------------------------------|
         */
        $scope.disableSubmit = function () {
            if ($scope.userRegForm.$invalid) {
                return true;
            }
            else if (!$scope.available) {
                return true;
            }
            else if ($scope.passMatchFailed) {
                return true;
            }
            else if (!$rootScope.termsConditionAccepted) {
                return true;
            }
            else {
                return false;
            }
        };


        /*
         |-------------------------------------------------------------------------------|
         |    Register User                                                              |
         |-------------------------------------------------------------------------------|
         */
        $scope.submit = function () {

            $rootScope.spinner = true;
            $scope.inProgress = false;

            var UserObj = {
                'fname': $scope.firstName,
                'lname': $scope.lastName,
                'username': $scope.username,
                'emailId': $scope.email.toLowerCase(),
                'mnumber': $scope.mnumber,
                'password': $scope.password, // remember to crpytify
            };
            console.log("new user details");
            console.log(UserObj);
            registerService.register(UserObj).then(function (result) {
                console.log('registerResponse:', result);
                if (result.data.status) {
                    console.log(result.data.status);
                    $rootScope.successToast('Registration was successful');


                    var loginObj = {
                        'username': $scope.username,
                        'password': $scope.password
                    };
                    console.log("login obj ", loginObj);

                    userService.userLogin(JSON.stringify(loginObj)).then(function (result) {
                        console.log('Login result', result);
                        if (result.status === -1) {
                            document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                            console.log("login failed with status -1");
                            $rootScope.spinner = false;
                            $scope.inProgress = true;
                            $rootScope.errorToast('Login failed');
                        } else {
                            if (result.data.status) {
                                $rootScope.spinner = false;
                                console.log('loginVar SET TO true!!!!');
                                $rootScope.loginVar = true;
                                $state.go('dashboard');
                            } else {
                                document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                                console.log("login failed!!!!");
                                $rootScope.spinner = false;
                                $scope.inProgress = true;
                            }
                        }
                    });

                }
                else {
                    $rootScope.spinner = false;
                    $scope.inProgress = true;
                    console.log('Registration failed', result);
                    $rootScope.errorToast('Registration unsuccessful');
                    // Materialize.toast('Registration unsuccessful', 3000, 'rounded');
                }

            }).catch(function (error) {
                $rootScope.spinner = false;
                $scope.inProgress = true;
                console.log('Registration failed', error);
                $rootScope.errorToast('Registration unsuccessful');
                // Materialize.toast('Registration unsuccessful', 3000, 'rounded');
            });


        };


    }]);
