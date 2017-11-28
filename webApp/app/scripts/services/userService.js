'use strict';

/**
 * @ngdoc service
 * @name frelloApp.userService
 * @description
 * # userService
 * Factory in the frelloApp.
 */
angular.module('frelloApp')
    .factory('userService', function ($http, $cookies, $rootScope, $location) {

            var isAuthenticated = false;
            var authToken;


            var userLogin = function (userDetails) {
                console.log('api call for User login');
                return $http.post(baseUrl + 'user/userLogin', userDetails).then(function (success) {
                    // console.log('inside service', success, success.status, success.data.token);
                    if (success.status) {
                        window.sessionStorage.setItem('Authorization', success.data.token);
                        $cookies.put('Authorization', success.data.token);
                        var now = new Date();
                        var time = now.getTime();
                        time += 3600 * 1000;
                        now.setTime(time);

                        document.cookie =
                            'Authorization=' + success.data.token +
                            '; expires=' + now.toUTCString() +
                            '; path=/';

                    } else {
                        console.log('no token set as not logged in');
                    }
                    // console.log('success from service', success);
                    return success;
                }).catch(function (error) {
                    console.log(error);
                    return error;
                });
            };

            var logoutUser = function () {
                console.log('Logging OUT');
                authToken = undefined;
                isAuthenticated = false;
                $http.defaults.headers.common.Authorization = authToken;
                $cookies.remove('Authorization');
                document.cookie = "Authorization=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                console.log('Deleted Cookie');
                console.log('still exists???', $rootScope.getCookie('Authorization'));
                if ($cookies.get('Authorization') == undefined) {
                    console.log('logout successful...');
                    $rootScope.loginVar = false;
                    $location.path("/register");
                }
                else {
                    console.log('logout failed.. cookie present', $rootScope.getCookie('Authorization'));
                }
            };

            var setHeaders = function () {
                if ($http.defaults.headers.common.Authorization == null) {
                    var token = $cookies.get('Authorization');
                    if (token) {
                        authToken = token;
                        console.log('authToken', authToken);
                        $http.defaults.headers.common.Authorization = authToken;
                    } else {
                        console.log('no token in cache please login or register');
                        logoutUser();
                    }
                }
            }


            var verifyUserSession = function () {
                return $http.post(baseUrl + 'user/getUser').then(function (success) {
                    return success;
                }).catch(function (error) {
                    console.log(error);
                    return error;
                });
            };

            var getAllCategories = function () {
                return $http.post(baseUrl + 'user/allCategories').then(function (success) {
                    return success;
                }).catch(function (error) {
                    console.log(error);
                    return error;
                });
            };

            var addCategory = function (catObj) {
                return $http.post(baseUrl + 'user/addCategory', catObj).then(function (success) {
                    return success;
                }).catch(function (error) {
                    console.log(error);
                    return error;
                });
            };

            var addTask = function (taskObj) {
                return $http.post(baseUrl + 'user/addTask', taskObj).then(function (success) {
                    return success;
                }).catch(function (error) {
                    console.log(error);
                    return error;
                });
            };

            var getAllTasks = function () {
                return $http.post(baseUrl + 'user/allTasks').then(function (success) {
                    return success;
                }).catch(function (error) {
                    console.log(error);
                    return error;
                });
            };

            var reorderTasks = function (taskArr) {
                return $http.post(baseUrl + 'user/sortTasks', taskArr).then(function (success) {
                    return success;
                }).catch(function (error) {
                    console.log(error);
                    return error;
                });
            };

            var updateTaskCategory = function (taskObj) {
                return $http.post(baseUrl + 'user/updateTaskCategory', taskObj).then(function (success) {
                    return success;
                }).catch(function (error) {
                    console.log(error);
                    return error;
                });
            };

            var deleteTask = function (taskObj) {
                return $http.post(baseUrl + 'user/deleteTask', taskObj).then(function (success) {
                    return success;
                }).catch(function (error) {
                    console.log(error);
                    return error;
                });
            };

            var deleteCategory = function (categoryObj) {
                return $http.post(baseUrl + 'user/deleteCategory', categoryObj).then(function (success) {
                    return success;
                }).catch(function (error) {
                    console.log(error);
                    return error;
                });
            };


            return {
                verifyUserSession: verifyUserSession,
                getAllCategories: getAllCategories,
                addCategory: addCategory,
                addTask: addTask,
                getAllTasks: getAllTasks,
                reorderTasks: reorderTasks,
                updateTaskCategory: updateTaskCategory,
                deleteTask: deleteTask,
                deleteCategory: deleteCategory,
                userLogin: userLogin,
                logoutUser: logoutUser,
                setHeaders: setHeaders
            };

        }
    );