'use strict';
const express = require('express');
const path = require('path');
const logger = require('morgan');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
// Authentication dependencies
var passport = require('passport');
var session = require('express-session');
var mongoose = require("mongoose");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Models for user login (uses sequelize right now but we want to convert to mongodb)
var db = require("./models/Teacher");

// Initialize app method
let app = express();
// set PORT variable
const PORT = process.env.PORT || 8080;

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// For Passport
app.use(session({
    secret: 'keyboard cat',
    resave: true,
    saveUninitialized: true
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions

app.use(
  bodyParser.urlencoded({
    extended: true
  })
);

// parse application/json
app.use(bodyParser.json());

// Override with POST having ?_method=DELETE
app.use(methodOverride('_method'));

// Static directory
app.use(express.static(path.join(__dirname, './public')));

// Database configuration with mongoose
mongoose.connect("mongodb://localhost/TeachersPet");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// do we need lines 5 and 6? 41-42 below seems to be the same
require('./routes/htmlRoutes')(app);
require('./routes/awsRoutes')(app);
// Authentication routes
require('./routes/authRoutes.js')(app, passport);
// load passport strategies
require('./app/config/passport/passport.js')(passport, db.User);

app.listen(PORT, function(err) {
    if (!err) console.log("Site is live. Now listening to port:", PORT);
    else console.log(err)
});
