var JwtStrategy = require('passport-jwt').Strategy,
    ExtractJwt = require('passport-jwt').ExtractJwt;
var dbConn = require('../database/databaseConnection');


module.exports = function(passport){
    var opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeader();
    opts.secretOrKey = 'eg[isfd-8axcewfgi43209=1dmnbvcrt67890-[;lkjhyt5432qi24';
    passport.use(new JwtStrategy(opts, function (jwt_payload, done) {
        dbConn(function (err, con) {
            var query = "SELECT * FROM `user` WHERE user_id = '" + jwt_payload.user_id + "'";
            console.log(query);
            con.query(query, function (error, results) {
                if(error){
                    console.log('this is bad news', error);
                    con.release();
                    return done(null, false);
                }
                if(Object.keys(results).length > 0){
                    console.log('this is news');
                    con.release();
                    done(null, results[0]);
                }else {
                    console.log('this is bad bad news');
                    con.release();
                    done(null, false);
                }
            });
        })
    }))
};