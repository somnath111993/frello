angular.module('frelloApp')
  .controller('dashboardCtrl', ['$scope', '$timeout', '$state', '$window', '$document', '$rootScope', 'userService', function ($scope, $timeout, $state, $window, $document, $rootScope, userService) {

    $rootScope.loginVar = true;
    $scope.categoriesCheck = false;
    $scope.allCategories = [];
    $scope.categoryName = '';
    $scope.taskObj = {};
    $scope.allTasks = [];
    $scope.taskForSorting = {};
    $scope.taskForCatChange = {};

      /**
       * Gets ALL Categories.
       */
      var getAllCategories = function () {
          userService.getAllCategories().then(function (result) {
              console.log('All categories result', result);
              if (result.data.status) {
                  console.log('ALl Categories', result.data);
                  $scope.allCategories = result.data.response;
                  $scope.categoriesCheck = true;
                  console.log('All Categories fetched', $scope.allCategories);
              } else {
                  console.log('No categories present for user');
                  $scope.categoriesCheck = false;
                  $scope.allCategories = [];
              }
          }).catch(function (error) {
              $scope.categoriesCheck = false;
              $scope.allCategories = [];
              $rootScope.errorToast('Error while fetching all categories for user');
          });
      };
      $timeout(function () {
         getAllCategories();
      }, 1000);

      /**
       * Gets ALL Tasks.
       */
      var getAllTasks = function () {
          $scope.allTasks = [];
          userService.getAllTasks().then(function (result) {
              console.log('All Tasks result', result);
              if (result.data.status) {
                  console.log('ALl Tasks', result.data.response);
                  var data = _.groupBy(result.data.response, function (task) {
                      return task.task_categoryID;
                  });
                  console.log('Grouped Tasks', data);
                  _.each(data, function (value, key) {
                      console.log('ID', key);
                      var groupedObj = {};
                      groupedObj.category_id = key;
                      groupedObj.tasks = value;
                      groupedObj.tasks = _.sortBy(groupedObj.tasks, 'sort_id');
                      if(key){
                          var categoryObj = _.filter($scope.allCategories, function (cat) {
                              if(cat.category_id === key){
                                  return cat;
                              }
                          });
                          console.log('Cat name fetched', categoryObj[0]);
                          groupedObj.category_name = categoryObj[0].category_name;
                      }
                      else{
                          groupedObj.category_name = '';
                      }


                      console.log('Grouped Task obj', groupedObj);
                      $scope.allTasks.push(groupedObj);
                  })
                  console.log('Final Tasks array', $scope.allTasks);
              } else {
                  console.log('No Tasks present for user');
              }
          }).catch(function (error) {
              $rootScope.errorToast('Error while fetching all tasks for user');
          });
      };
      $timeout(function () {
          getAllTasks();
      }, 1000);

      $scope.closeCategoryModal = function () {
          getAllTasks();
      };

      $scope.createCategory = function () {
          console.log('Category Name', $scope.categoryName);

          if ($scope.categoryName === '') {
              $rootScope.errorToast('Category name can not be empty');
          }
          else {
              var categoryObj = {};

              categoryObj.categoryName = $scope.categoryName;
              console.log('Object for adding category', categoryObj);

              userService.addCategory(categoryObj).then(function (result) {
                  console.log('Category added', result);
                  if (result.data.status) {
                      $scope.addCategoryCheck = false;
                      $scope.categoryName = '';
                      $timeout(function () {
                          getAllCategories();
                      })
                      $rootScope.successToast('Category added successfully');
                  }
              }).catch(function (error) {
                  console.log('error while adding Category', error);
                  $scope.addCategoryCheck = false;
                  $scope.categoryName = '';
                  $scope.errorToast('Error while adding Custom Field');
              });
          }
      };
      
      $scope.deleteCategory = function (categoryObj) {
          console.log('Category objected to be deleted', categoryObj);
          userService.deleteCategory(categoryObj).then(function (result) {
              console.log('Category deletion result', result);
              if(result.data.status){
                  getAllCategories();
              }
          }).catch(function (error) {
              console.log('Error while deleting Category');
          })
      };

      $scope.createTask = function () {
         console.log('This is task', $scope.taskObj);
         var newTaskObj = {
             'taskTitle': $scope.taskObj.taskTitle,
             'taskDesc': $scope.taskObj.taskDesc,
             'task_categoryID': $scope.taskObj.category.category_id
         }
         console.log('Task Object', newTaskObj);
         userService.addTask(newTaskObj).then(function (result) {
             console.log('Task addition result', result);
             if(result.data.status){
                 $scope.taskObj = {};
                 $rootScope.successToast('Task added successfully');
                 $('.collapsible').collapsible('close', 0);
                 getAllTasks();
             }
             else{
                 $scope.taskObj = {};
                 $rootScope.errorToast('Error while adding task');
             }
         }).catch(function (error) {
             $scope.taskObj = {};
             console.log('Error while adding Task', error);
             $rootScope.errorToast('Error while adding task');
         })

      };

      $scope.reorderTasksModalOpen = function (taskObj) {
        console.log('SOrt this Task Obj', taskObj);
        $scope.taskForSorting = {};
        $scope.taskForSorting = _.clone(taskObj);
        $('#reorderTasksModal').modal('open');
      };


      function move(arr, old_index, new_index) {
          while (old_index < 0) {
              old_index += arr.length;
          }
          while (new_index < 0) {
              new_index += arr.length;
          }
          if (new_index >= arr.length) {
              var k = new_index - arr.length;
              while ((k--) + 1) {
                  arr.push(undefined);
              }
          }
          arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
          return arr;
      }

      var fieldsList = document.getElementById("reorderTasks");
      var sortable = new Sortable(fieldsList, {
          // Element dragging ended
          onEnd: function (/**Event*/evt) {
              evt.oldIndex;  // element's old index within parent
              evt.newIndex;  // element's new index within parent

              $scope.taskForSorting.tasks = move($scope.taskForSorting.tasks, evt.oldIndex, evt.newIndex)
              _.each($scope.taskForSorting.tasks, function (item, index) {
                  item.sort_id = index + 1;
                  console.log('sorted fieldsList', $scope.taskForSorting.tasks);
              });
          }
      });


      $scope.reorderTasks = function () {

          userService.reorderTasks($scope.taskForSorting.tasks).then(function (res) {
              console.log('Sort updation result', res);
              if (res.data.status) {
                  $timeout(function () {
                      getAllTasks();
                  });
                  $rootScope.successToast('Tasks order updated successfully');
                  $('#reorderTasksModal').modal('close');
              }
          }).catch(function (err) {
              console.log('Error while updating sort order of tasks', err);
              $rootScope.errorToast('Error while updating Tasks order');
          });
      };


      $scope.changeTaskCategory = function (taskObj, currentCategory) {
          console.log('Task Obj and Current Category Name', taskObj, currentCategory);
          $scope.taskForCatChange = _.clone(taskObj);
          var categoryObj = _.filter($scope.allCategories, function (catObj) {
              if(catObj.category_id === taskObj.task_categoryID){
                  return catObj;
              }
          });
          console.log('cat object fetched', categoryObj);
          $scope.taskForCatChange.category = categoryObj[0];
          console.log('Open with this', $scope.taskForCatChange);
          $('#changeCategoryModal').modal('open');
      };

      $scope.updateTaskCategory = function () {
          console.log('Updated task object', $scope.taskForCatChange);
          userService.updateTaskCategory($scope.taskForCatChange).then(function (result) {
              console.log('Category updation result', result);
              if(result.data.status){
                  $rootScope.successToast('Task Category updated successfully');
                  getAllTasks();
                  $scope.taskForCatChange = {};
                  $('#changeCategoryModal').modal('close');
              }
          }).catch(function (error) {
              $rootScope.errorToast('Error while updating Task category');
          })
      };


      $scope.deleteTask = function (taskObj) {
          console.log('Task Object', taskObj);
          userService.deleteTask(taskObj).then(function (result) {
              console.log('Deletion result', result);
              if(result.data.status){
                  $rootScope.successToast('Task deleted successfully');
                  getAllTasks();
              }
          }).catch(function (error) {
              console.log('Error while deleting task', error);
          })
      };

  }]);
