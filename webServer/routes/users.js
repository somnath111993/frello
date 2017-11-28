var express = require('express');
var shortid = require('shortid');
var dbConn = require('../database/databaseConnection');
var router = express.Router();
var passport = require('passport');
var request = require('request');
var hash = require('bcryptjs');
var jwt = require('jwt-simple');
require('../routes/passportJs')(passport);
var sqlQuery = require('../database/sqlWrapper');
var async = require('async');
var _ = require('lodash');


/*
 |-------------------------------------------------------------------|
 |    Register a User                                                |
 |-------------------------------------------------------------------|
 */
router.post('/register', function (req, res, next) {
    console.log(req.body);

    var user_id = shortid.generate();
    var username = req.body.username;
    var firstName = req.body.fname;
    var lastName = req.body.lname;
    var mobileNumber = parseInt(req.body.mnumber);
    var email = req.body.emailId;
    var password = req.body.password;
    var last_logged_in = new Date();
    var row_updated = new Date();
    var is_deleted = 'N';

    hash.genSalt(15, function (error, salt) {
        hash.hash(password, salt, function (err, hashed) {
            var query = "INSERT INTO `user` (`user_id`, `first_name`, `last_name`, `username`, `mobile_number`, `email`, `password`, `row_created`, `user_last_logged_in`, `is_deleted`) VALUES ('" + user_id + "', '" + firstName + "', '" + lastName + "', '" + username + "', " + mobileNumber + ", '" + email + "', '" + hashed + "','" + row_updated + "', '" + last_logged_in + "', '" + is_deleted + "')";
            console.log('User registration query----', query);
            sqlQuery.executeQuery([query]).then(function (result) {
                console.log('Registration result', result);
                console.log("registration SUCCESSFUL!!!");
                res.json({'status': true, 'msg': 'User registered successfully'});
            }).catch(function (error) {
                console.log("registration FAILED!!!!");
                res.json({'status': false, 'msg': 'Registration failed due to Server error', 'error': error});
            });

        });
    });
});


/*
 |-------------------------------------------------------------------|
 |    Check for username                                             |
 |-------------------------------------------------------------------|
 */
router.post('/checkUserName', function (req, res, next) {
    var username = req.body.username;

    var checkQuery = "SELECT EXISTS (SELECT * from `user` where `username` = '" + username + "') as 'count'";
    console.log('query is ', checkQuery);
    sqlQuery.executeQuery([checkQuery]).then(function (result) {
        console.log(result);
        if (result[0][0].count > 0) {
            res.json({'status': false, 'msg': 'Username already taken'});
        } else {
            res.json({'status': true, 'msg': 'Username NOT taken'});
        }
    }).catch(function (error) {
        console.log('error while executing the query ', error);
        res.json({'status': false, 'msg': 'Server error!!!'});
    });

});


/*
 |-------------------------------------------------------------------|
 |    User Login                                                     |
 |-------------------------------------------------------------------|
 */
router.post('/userLogin', function (req, res, next) {
    var reqBodyParams = req.body;
    // var reqBodyParams = JSON.parse(req.body);
    console.log(reqBodyParams);
    var username = reqBodyParams.username;
    var password = reqBodyParams.password;

    new Promise(function (resolve, reject) {
        dbConn(function (err, con) {
            if (err) {
                console.log('mysql connection error ', err);
                reject(err);
            } else {
                console.log(reqBodyParams.username);
                if (reqBodyParams.username) {
                    var query = "SELECT * FROM `user` WHERE username = '" + username + "'";
                    console.log(query);
                    console.log(con);
                    con.query(query, function (error, results) {
                        if (!results || Object.keys(results).length == 0) {
                            console.log("no user found");
                            //res.json({'success': false, 'msg':'User not found'});
                            reject('User not found');
                        } else {
                            hash.compare(password, results[0].password, function (error, match) {
                                if (!match) {
                                    //         //res.json({success: false, msg: 'Authentication failed. Wrong password.'});
                                    reject('Authentication failed. Wrong password.')
                                } else {
                                    var encodeDetails = {};
                                    encodeDetails['username'] = results[0].username;
                                    encodeDetails['id'] = results[0].id;
                                    encodeDetails['user_id'] = results[0].user_id;
                                    var token = jwt.encode(encodeDetails, 'eg[isfd-8axcewfgi43209=1dmnbvcrt67890-[;lkjhyt5432qi24');
                                    //res.json({success: true, token: 'JWT ' + token});
                                    console.log('setting true');
                                    resolve(token);
                                }
                            });
                        }
                    });
                } else {
                    console.log('username params are empty');
                    reject('username params are empty')
                }
            }
        })
    }).then(function (result) {
        console.log('came here', new Date(Date.now() + 900000));
        res.cookie('frello', result, {maxAge: 90000000, httpOnly: false});
        res.send({'status': true, 'token': 'JWT ' + result});
    }).catch(function (error) {
        console.log(error);
        res.json({'status': false, 'msg': 'Something is wrong'});
    })
});


/*
 |-------------------------------------------------------------------|
 |    Get User details after logging in                              |
 |-------------------------------------------------------------------|
 */
router.post('/getUser', passport.authenticate('jwt', {session: true}), function (req, res, next) {
    var reqBodyParams = req.body;
    var user_id = req.session.passport.user.user_id;
    console.log('User id fetched from passport session', user_id);
    console.log(reqBodyParams);
    var getLoggedInUserDetails = "Select * from `user` where `user_id` = '" + user_id + "' ";
    console.log('Get User details for logged in User ', getLoggedInUserDetails);
    sqlQuery.executeQuery([getLoggedInUserDetails]).then(function (queryResult) {
        console.log('thiss---', queryResult);
        if (queryResult[0].length > 0) {
            console.log('User Details fetched ----', queryResult);
            // res.status(200).json({'status': true, 'response': queryResult})
            res.json({'status': true, 'response': queryResult});

        } else {
            console.log('No such User');
            res.status(200).json({'status': false, 'response': 'No such User!!!!!'});
            // res.json({'status':false, 'response':'No clients for the User'});
        }
    }).catch(function (error) {
        res.status(500).send(
            "Internal error occurred, please report or try later...!");
    });
});

/*
 |-------------------------------------------------------------------|
 |    Get all Categories for the User                                |
 |-------------------------------------------------------------------|
 */
router.post('/allCategories', passport.authenticate('jwt', {session: true}), function (req, res, next) {
    var user_id = req.session.passport.user.user_id;
    console.log('User id fetched from passport session', user_id);

    var getAllCategoriesQuery = `Select * from category where user_id = '${user_id}' AND is_deleted = 'N'`;
    console.log('Get all categories query', getAllCategoriesQuery);
    sqlQuery.executeQuery([getAllCategoriesQuery]).then(function (queryResult) {
        console.log('thiss---', queryResult);
        if (queryResult[0].length > 0) {
            console.log('All Categories fetched for User ----', queryResult);
            res.json({'status': true, 'response': queryResult[0]});

        } else {
            console.log('No categories defined by User');
            res.status(200).json({'status': false, 'response': 'No category added by User'});
        }
    }).catch(function (error) {
        res.status(500).send(
            "Internal error occurred, please report or try later...!");
    });
});


/*
 |-------------------------------------------------------------------|
 |    Add Category for User                                          |
 |-------------------------------------------------------------------|
 */
router.post('/addCategory', passport.authenticate('jwt', {session: true}), function (req, res, next) {
    var user_id = req.session.passport.user.user_id;
    console.log('User id fetched from passport session', user_id);
    var category_name = req.body.categoryName;
    var category_id = shortid.generate();
    console.log('Creating this category', category_name, category_id);

    var addCategoryQuery = "INSERT INTO `category` (`user_id`, `category_id`, `category_name`, `is_deleted`) VALUES ('" + user_id + "', '" + category_id + "', '" + category_name + "', 'N')";
    console.log('Add Category query', addCategoryQuery);
    sqlQuery.executeQuery([addCategoryQuery]).then(function (queryResult) {
        console.log('add category result---', queryResult);
        res.json({'status': true, 'msg': 'Category added successfully'});
    }).catch(function (error) {
        res.status(500).send(
            "Internal error occurred, please report or try later...!");
    });
});


/*
 |-------------------------------------------------------------------|
 |    Add Task for the User                                          |
 |-------------------------------------------------------------------|
 */
router.post('/addTask', passport.authenticate('jwt', {session: true}), function (req, res, next) {
    var user_id = req.session.passport.user.user_id;
    console.log('User id fetched from passport session', user_id);
    var task_title = req.body.taskTitle;
    var task_desc = req.body.taskDesc;
    var task_categoryID = req.body.task_categoryID;
    var task_id = shortid.generate();
    console.log('Creating this task', task_id, task_title, task_categoryID);

    var addTaskQuery = "INSERT INTO `tasks` (`user_id`, `task_id`, `task_title`, `task_desc`, `task_categoryID`) VALUES ('" + user_id + "', '" + task_id + "', '" + task_title + "', '" + task_desc + "', '" + task_categoryID + "')";
    console.log('Add Task query', addTaskQuery);
    sqlQuery.executeQuery([addTaskQuery]).then(function (queryResult) {
        console.log('add task result---', queryResult);
        res.json({'status': true, 'msg': 'Task added successfully'});
    }).catch(function (error) {
        res.status(500).send(
            "Internal error occurred, please report or try later...!");
    });
});


/*
 |-------------------------------------------------------------------|
 |    Get all Tasks for the User                                     |
 |-------------------------------------------------------------------|
 */
router.post('/allTasks', passport.authenticate('jwt', {session: true}), function (req, res, next) {
    var user_id = req.session.passport.user.user_id;
    console.log('User id fetched from passport session', user_id);

    var getAllTasksQuery = `Select * from tasks where user_id = '${user_id}' AND is_deleted = 'N'`;
    console.log('Get all categories query', getAllTasksQuery);
    sqlQuery.executeQuery([getAllTasksQuery]).then(function (queryResult) {
        console.log('thiss---', queryResult);
        if (queryResult[0].length > 0) {
            console.log('All Tasks fetched for User ----', queryResult);
            res.json({'status': true, 'response': queryResult[0]});

        } else {
            console.log('No Tasks defined by User');
            res.status(200).json({'status': false, 'response': 'No Tasks added by User'});
        }
    }).catch(function (error) {
        res.status(500).send(
            "Internal error occurred, please report or try later...!");
    });
});


/*
 |-------------------------------------------------------------------|
 |    Sort Tasks grouped by Categories                               |
 |-------------------------------------------------------------------|
 */
router.post('/sortTasks', passport.authenticate('jwt', {session: true}), function (req, res, next) {

    var user_id = req.session.passport.user.user_id;
    console.log('User id fetched from passport session', user_id);
    var taskData = req.body;
    console.log('Field data copied form req body>>>', taskData);

    var updateRes = [];

    async.eachSeries(taskData, function (taskObj, callback) {
        var updateQuery = `UPDATE tasks SET sort_id = '${taskObj.sort_id}' WHERE task_id = '${taskObj.task_id}'`;
        sqlQuery.executeQuery([updateQuery]).then(function (result) {
            console.log('update outcome', result);
            updateRes.push(result[0]);
            callback();
        }).catch(function (error) {
            console.log('Task sort_id updation failed', taskObj.task_id, error);
            res.status(500).json(error);
        })
    }, function (err) {
        if (err) {
            console.log('Failed to update sort ID for an element, check console...', err)
            res.status(500).json(err)
        } else {
            console.log('Sort ID of all Tasks updated successfully');
            res.status(200).json({'status': true, 'response': updateRes});
        }
    });
});


/*
 |-------------------------------------------------------------------|
 |    Update Task category                                           |
 |-------------------------------------------------------------------|
 */
router.post('/updateTaskCategory', passport.authenticate('jwt', {session: true}), function (req, res, next) {

    var user_id = req.session.passport.user.user_id;
    console.log('User id fetched from passport session', user_id);
    var newCatID = req.body.category.category_id;
    var taskID = req.body.task_id;
    console.log('New Category ID fetched form req body>>>', newCatID);

    var updateQuery = `UPDATE tasks SET task_categoryID = '${newCatID}' WHERE task_id = '${taskID}'`;
    sqlQuery.executeQuery([updateQuery]).then(function (result) {
        console.log('update outcome', result);
        res.status(200).json({'status': true, 'response': result});
    }).catch(function (error) {
        console.log('Task sort_id updation failed', error);
        res.status(500).json(error);
    })
});


/*
 |-------------------------------------------------------------------|
 |    Update Task delete status                                      |
 |-------------------------------------------------------------------|
 */
router.post('/deleteTask', passport.authenticate('jwt', {session: true}), function (req, res, next) {

    var user_id = req.session.passport.user.user_id;
    console.log('User id fetched from passport session', user_id);
    var task_id = req.body.task_id;
    console.log('New Category ID fetched form req body>>>', task_id);

    var updateQuery = `UPDATE tasks SET is_deleted = 'Y' WHERE task_id = '${task_id}'`;
    sqlQuery.executeQuery([updateQuery]).then(function (result) {
        console.log('update outcome', result);
        res.status(200).json({'status': true, 'response': result});
    }).catch(function (error) {
        console.log('Task sort_id updation failed', error);
        res.status(500).json(error);
    })
});


/*
 |-------------------------------------------------------------------|
 |    Update Category delete status                                  |
 |-------------------------------------------------------------------|
 */
router.post('/deleteCategory', passport.authenticate('jwt', {session: true}), function (req, res, next) {

    var user_id = req.session.passport.user.user_id;
    console.log('User id fetched from passport session', user_id);
    var category_id = req.body.category_id;
    console.log('New Category ID fetched form req body>>>', category_id);

    var updateTaskQuery = `UPDATE tasks SET task_categoryID = '' WHERE task_categoryID = '${category_id}'`;
    sqlQuery.executeQuery([updateTaskQuery]).then(function (result) {
        console.log('Category delete outcome', result);
        var updateCategoryQuery = `UPDATE category SET is_deleted = 'Y' WHERE category_id = '${category_id}'`;
        sqlQuery.executeQuery([updateCategoryQuery]).then(function (result) {
            console.log('Tasks delete outcome', result);
            res.status(200).json({'status': true, 'response': result});
        }).catch(function (error) {
            console.log('Task sort_id updation failed', error);
            res.status(500).json(error);
        })
    }).catch(function (error) {
        console.log('Task sort_id updation failed', error);
        res.status(500).json(error);
    })
});


module.exports = router;