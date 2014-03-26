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
        , pass = require("./config/pass.js")
        , pg = require("pg")
        , dbapi = require("./api/dbapi.js")
        , fileapi = require("./api/fileapi.js");

//var conString = "postgres://dunglexuan:@localhost:5432/muabancz";
        
var conString = process.env.DATABASE_URL;


pg.connect(conString, function(err, client, done) {
    bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
        bcrypt.hash("erikle13101989", salt, function(err, hash) {
            client.query('SELECT * FROM Users WHERE phone = 725637243;',
                    function(err, result) {
                        done();
                        if (err)
                            return console.error(err);
                        else {
                            if (result.rows.length < 1) {
                                client.query("INSERT INTO Users (phone, name, surname, password, address, psc, role, city, state) \n\
                                     VALUES (725637243, 'Dung', 'Le Xuan','" + hash + "','Náchodská 640/101',40801,'admin','Praha 9',1);",
                                        function(err, resultinsert) {
                                            if (err)
                                                return console.error(err);
                                            else
                                                client.end();
                                        });
                            }
                        }
                    });
        });
    });
});


dbapi.createDB();


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
//==================================================================
// routes
app.get('/', function(req, res) {
    res.render('index', {title: 'Express'});
});
// route to log in
app.post('/login', passport.authenticate('local'), function(req, res) {
    res.send(req.user);
});
// route to test if the user is logged in or not
app.get('/loggedin', function(req, res) {
    res.send(req.isAuthenticated() ? req.user : '0');
});
app.get('/logout', function(req, res) {
    req.logOut();
    res.send(200);
});
// routes for users
app.post('/create-seller', dbapi.createSeller);
app.post('/check-phone-number', dbapi.checkPhoneNumber);

// routes for goods
app.post('/create-good', pass.ensureAuthenticated, dbapi.createGood);
app.post('/create-good-anonym', dbapi.createGoodAnonym);
app.get('/get-goods-by-user', pass.ensureAuthenticated, dbapi.getGoodsByUser);
app.post('/activate-good', pass.ensureAuthenticated, dbapi.activateGood);
app.post('/deactivate-good', pass.ensureAuthenticated, dbapi.deactivateGood);
app.get('/get-good-detail/:id', pass.ensureAuthenticated, dbapi.goodDetail);
app.get('/get-good-detail-public/:id', dbapi.goodDetailPublic);
app.get('/get-good-images/:id', dbapi.goodImages);
app.get('/get-goods/:page', dbapi.getGoods);
app.get('/get-row-count', dbapi.getRowCount);

// routes for file
app.post('/add-image', fileapi.uploadImage);

// routes for categories
app.post('/create-category', pass.ensureAdmin, dbapi.createCategory);
app.post('/create-subcategory', pass.ensureAdmin, dbapi.createSubCategory);

app.get('/get-categories', dbapi.getCategories);
app.get('/get-subcategories/:id', dbapi.getSubcat);

app.get('/get-category-detail/:id', pass.ensureAdmin, dbapi.getCatDetail);

app.post('/deactivate-category', pass.ensureAdmin, dbapi.deactivateCat);
app.post('/activate-category', pass.ensureAdmin, dbapi.activateCat);
app.post('/deactivate-subcategory', pass.ensureAdmin, dbapi.deactivateSubCat);
app.post('/activate-subcategory', pass.ensureAdmin, dbapi.activateSubCat);


app.listen(5000, function() {
    console.log('Express server listening on port 5000');
});



