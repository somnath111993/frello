
var dbConn = require('../database/databaseConnection');


module.exports = {
    executeQuery : function (query) {
        var Promises = [];
        return new Promise(function (resolve, reject) {
            dbConn(function (err, con) {
                if(err){
                    console.log('mysql connection error : ', err);
                    reject(err);
                }else{
                    var exec = function (Query) {
                        return new Promise(function (resolve, reject) {
                            con.query(Query, function (err, data) {
                                if(err){
                                    console.log('mysql error ', err);
                                    reject(err);
                                }else{
                                    //console.log(data);
                                    resolve(data);
                                }
                            });
                        });
                    };

                    for(var i = 0;i<query.length;i++){
                        Promises.push(exec(query[i]));
                    }

                }
                Promise.all(Promises).then(function (result) {
                    //console.log(result);
                    con.release();
                    resolve(result);
                }).catch(function (error) {
                    con.release();
                    reject(error);
                })
            })
        })
    }
};