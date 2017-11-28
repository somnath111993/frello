'use strict';

/**
 * @ngdoc service
 * @name frelloApp.registerService
 * @description
 * # registerService
 * Factory in the frelloApp.
 */
angular.module('frelloApp')
  .factory('registerService', function ($http) {


    /*
     |-------------------------------------------------------------------------------|
     |    Registration                                                               |
     |-------------------------------------------------------------------------------|
     */
    var registerUser = function (registrationData) {
      return $http.post(baseUrl+'user/register', registrationData).then(function(success) {
        console.log(success);
          if(success.status === 200 && success.data.status){

          }
        return success;
      }).catch(function (error) {
        console.log(error);
        return error;
      });
    };


    /*
     |-------------------------------------------------------------------------------|
     |    Username Uniqueness check                                                  |
     |-------------------------------------------------------------------------------|
     */
    var uniqueUsername = function (username) {
      return $http.post(baseUrl+'user/checkUserName', username).then(function(success) {
        console.log(success);
        return success;
      }).catch(function (error) {
        console.log(error);
        return error;
      });
    };



    return{
      register: registerUser,
      checkUsername: uniqueUsername
    };
  });
