angular.module('frelloApp')
    .component('header', {
        templateUrl: '../components/header/template/header.html',
        controller: headerCtrl,
        // controllerAs: vm,
        bindings: {}

    });

function headerCtrl($scope, $http, $state, userService, $rootScope, $cookies) {

    "ngInject";


    $scope.userLogin = function () {

        $scope.inProgress = false;
        $rootScope.spinner = true;

        var userObj = {
            'username': $scope.userName,
            'password': $scope.userPass
        }

        // console.log(userObj);

        userService.userLogin(JSON.stringify(userObj)).then(function (result) {
            console.log('Result post login from ctrl', result);
            if (result.status === -1) {
                document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                console.log("login failed..in controller!!!!");
                $scope.userName = "";
                $scope.userPass = "";
                $rootScope.spinner = false;
                $scope.inProgress = true;
                $rootScope.errorToast('Login failed');
            } else {
                if (result.data.status) {
                    $scope.userName = "";
                    $scope.userPass = "";
                    $rootScope.spinner = false;
                    console.log('loginVar SET TO true!!!!');
                    $rootScope.loginVar = true;
                    $state.go('dashboard');
                } else {
                    document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    console.log("login failed!!!!");
                    $scope.userName = "";
                    $scope.userPass = "";
                    $rootScope.spinner = false;
                    $scope.inProgress = true;
                }
            }
        });
    };


    $scope.logoutUser = function () {
        userService.logoutUser();
    };

}










