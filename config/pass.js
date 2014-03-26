var passport = require('passport')
        , LocalStrategy = require('passport-local').Strategy;

var pg = require("pg")
        , SALT_WORK_FACTOR = 10
        , bcrypt = require('bcrypt');
//        , conString = "postgres://dunglexuan:@localhost:5432/muabancz";
        
var conString = process.env.DATABASE_URL;


// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    done(null, user.id);
});

pg.connect(conString, function(err, client) {
    passport.deserializeUser(function(id, done) {
        client.query('SELECT * FROM Users WHERE id = ' + id + ';',
                function(err, result) {
                    var user = result.rows[0];
                    done(err, user);
                });
    });
});

// Password verification
comparePassword = function(candidatePassword, passwd, cb) {
    bcrypt.compare(candidatePassword, passwd, function(err, isMatch) {
        if (err)
            return cb(err);
        cb(null, isMatch);
    });
};


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(function(username, password, done) {
    pg.connect(conString, function(err, client) {
        client.query('SELECT * FROM Users WHERE phone = \'' + username + '\';',
                function(err, result) {
                    if (err)
                        return done(err);
                    else {
                        var user = result.rows[0];
                        if (!user) {
                            return done(null, false, {message: 'Unknown user ' + username});
                        }
                        comparePassword(password, user.password, function(err, isMatch) {
                            if (err)
                                return done(err);
                            if (isMatch) {
                                return done(null, user);
                            } else {
                                return done(null, false, {message: 'Invalid password'});
                            }
                        });
                    }
                });
    });
}));

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
exports.ensureAuthenticated = function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
}

exports.ensureAdmin = function ensureAdmin(req, res, next) {
    if (req.isAuthenticated() && req.user.role === "admin") {
        return next();
    }
}

