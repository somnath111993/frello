'use strict';

/**
 * @ngdoc overview
 * @name frelloApp
 * @description
 * # frelloApp
 *
 * Main module of the application.
 */


var baseUrl = "http://localhost:8087/api/";


angular
    .module('frelloApp', [
        'ngAnimate',
        'ngAria',
        'ngCookies',
        'ngMessages',
        'ngResource',
        'ngRoute',
        'ngSanitize',
        'ui.router',
        'ngTouch',
        'ui.materialize',
        'ngLetterAvatar'
    ])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {

        var register = {
            name: 'register',
            url: '/register',
            controller: 'registerCtrl',
            templateUrl: 'views/register/register.html',
            title: 'Register'
        };

        var dashboard = {
            name: 'dashboard',
            url: '/dashboard',
            controller: 'dashboardCtrl',
            templateUrl: 'views/dashboard/dashboard.html',
            title: 'Dashboard'
        };

        $stateProvider.state(register);
        $stateProvider.state(dashboard);

        $urlRouterProvider.otherwise("/register");


    })

    .run(['$location', '$rootScope', '$cookies', '$state', 'userService', '$http', '$q', function ($location, $rootScope, $cookies, $state, userService, $http, $q) {


        //>>>>>>SUCCESS AND ERROR MESSAGES<<<<<<<<//
        $rootScope.successToast = function (msg) {
            console.log('msg', msg);
            var $toastContent = $('<span style="color: white;">' + msg + '</span>');
            Materialize.toast($toastContent, 3000, 'green lighten-1 rounded');
        }

        $rootScope.errorToast = function (msg) {
            var $toastContent = $('<span style="color: white;">' + msg + '</span>');
            Materialize.toast($toastContent, 3000, 'red lighten-1 rounded');
        }
        //---------------------------------------------//


        $rootScope.getCookie = function (cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        }

        var verifyUserSession = function () {

            var deferred = $q.defer();

            userService.setHeaders();

            return $http.post(baseUrl + 'user/getUser').then(function (success) {
                console.log('Logged in User details fetched', success);
                if (success.data.status) {
                    $rootScope.loggedInUser = success.data.response[0][0];
                    console.log('Logged in user details fetched', $rootScope.loggedInUser);
                    deferred.resolve();
                }
                else {
                    deferred.reject();
                }
            }).catch(function (error) {
                console.log(error);
                deferred.reject();
            });
            return deferred.promise;
        };

        $rootScope.$on('$stateChangeStart', function (event, toState) {
            console.log('statechange to detected', toState);

            var userCookie = $cookies.get('Authorization');

            if (userCookie != undefined) {

                console.log('Authorization cookie has value..', $cookies.get('Authorization'));

                $rootScope.loginVar = true;
                console.log('Logged in !!!!');

                verifyUserSession().then(function () {
                    console.log('User Verified with API call');
                }).catch(function () {
                    console.log('In verifyUserSession promise catch');
                    console.log('logoutUser called...');
                    myService.logoutUser();
                })
            }
            else {

                console.log('no Authorization cookie present, logging OUT');
                $rootScope.loginVar = false;
                // $rootScope.sideBar = false;
                $location.path("/register");

            }

        });

        $rootScope.$on('$stateChangeSuccess', function (event, toState) {
            document.title = 'Frello - ' + toState.title;
            console.log('here');
        });


    }]);




