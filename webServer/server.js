var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('client-sessions');
var passport = require('passport');
var dbConn = require('./database/databaseConnection');
var jwt = require('jwt-simple');




//require the routes
var users = require('./routes/users');


var app = express();

var allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, X-Response-Time, X-PINGOTHER, X-CSRF-Token,Authorization');
    res.setHeader('Access-Control-Allow-Methods', '*');
    res.setHeader('Access-Control-Expose-Headers', 'X-Api-Version, X-Request-Id, X-Response-Time');
    res.setHeader('Access-Control-Max-Age', '1000');

    next();
};


app.use(allowCrossDomain);


// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());


app.use(session({
    cookieName: 'session',
    secret: 'eg[isfd-8yF9-7w1970df{}+Ijsli;;to9',
    duration: 10 * 60 * 1000,
    activeDuration: 5 * 60 * 1000,
    httpOnly: true,
    secure: true
}));

//passport initializatoin
app.use(passport.initialize());
app.use(passport.session());


app.use('/api/user', users);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});


passport.serializeUser(function (user, done) {
    console.log('serialize', {'user_id': user.user_id, 'id': user.id}, user);
    done(null, {'user_id': user.user_id, 'id': user.id});
});

passport.deserializeUser(function (id, done) {
    console.log('nodu', id);
    dbConn(function (err, con) {
        var query = "SELECT * FROM `user` WHERE id = '" + id.id + "'";
        console.log(query);
        con.query(query, function (err, data) {
            console.log(data);
            if (!data) {
                console.log("something wrong in deserialize");
                done(err, null);
            } else {
                con.release();
                console.log("deserialize worked!!!");
                done(err, data[0]);
            }
        });
    });
});


// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


module.exports = app;


