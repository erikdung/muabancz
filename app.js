var express = require('express')
        , http = require('http')
        , cors = require('cors')
        , path = require('path')
        , passport = require('passport')
        , LocalStrategy = require('passport-local').Strategy
        , mongodb = require('mongodb')
        , mongoose = require('mongoose')
        , bcrypt = require('bcrypt')
        , SALT_WORK_FACTOR = 10
        , db = require("./config/user.js")
        , pass = require("./config/pass.js");



var app = express();

// configure Express
app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.engine('ejs', require('ejs-locals'));
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({secret: 'keyboard cat'}));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
});


app.get('/', function(req, res) {
    res.render('index', {user: req.user});
});

app.get('/account', pass.ensureAuthenticated, function(req, res) {
    res.render('account', {user: req.user});
});

app.get('/login', function(req, res) {
    res.render('login', {user: req.user, message: req.session.messages});
});

// POST /login
//   Use passport.authenticate() as route middleware to authenticate the
//   request.  If authentication fails, the user will be redirected back to the
//   login page.  Otherwise, the primary route function function will be called,
//   which, in this example, will redirect the user to the home page.
//
//   curl -v -d "username=bob&password=secret" http://127.0.0.1:3000/login
//   
/***** This version has a problem with flash messages
 app.post('/login', 
 passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
 function(req, res) {
 res.redirect('/');
 });
 */

// POST /login
//   This is an alternative implementation that uses a custom callback to
//   acheive the same functionality.
app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) {
            return next(err)
        }
        if (!user) {
            req.session.messages = [info.message];
            return res.redirect('/login')
        }
        req.logIn(user, function(err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});

app.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(3000, function() {
    console.log('Express server listening on port 3000');
});



