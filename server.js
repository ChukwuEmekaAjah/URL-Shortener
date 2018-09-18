var express = require('express');
var app = express();
var mongoose = require('mongoose')
var flash    = require('connect-flash');
var morgan       = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser   = require('body-parser');
var session      = require('express-session');
var path = require('path')
var port     = process.env.PORT || 8080;
var dbUrl = 'mongodb://127.0.0.1/urlLib';
mongoose.connect(dbUrl)
// set up our express application
app.use(express.static('public'))
app.use(morgan('dev')); // log every request to the console
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser()); // get information from html forms


app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'URLdb' })); // session secret
app.use(flash()); // use connect-flash for flash messages stored in session

// setting up passport 
// routes ======================================================================
require('./app/router.js')(app,mongoose); // load our routes and pass in our app and fully configured passport

// launch ======================================================================
app.listen(port);
console.log('The magic happens on port ' + port);