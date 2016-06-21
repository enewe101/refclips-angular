// modules =================================================
var express        = require('express');
var app            = express();
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var busboy         = require('connect-busboy');
var session        = require('express-session');
var methodOverride = require('method-override');
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;

// configuration ===========================================

// config files
var db = require('./config/db');

var port = process.env.PORT || 8080; // set our port
mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

app.use(busboy());

// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded


app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

app.set('trust proxy', 1);
app.use(session({
  secret: require('./config/key'),
  name: 'session',
})); // TODO: change this
app.use(passport.initialize());
app.use(passport.session());

// Require authentication for all api requests
app.use('/api', function(req, res, next){
  if(req.isAuthenticated()) {next();}
  else {res.status(403).send('Forbidden');}
});

let User = require('./app/models/user/User');
passport.serializeUser(function(user, done) {
  done(null, user.username);
});

passport.deserializeUser(function(username, done) {
  User.findOne({username: username}, function(err, user){
    // Don't include the user's hash
    if(user) {delete user.hash;}
    done(err, user);
  });
});

passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    User.findOne({ email: email }, function (err, user) {
      if (err) { return done(err); }
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }
      if (!user.authenticate(password)) {
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));



// routes ==================================================
require('./app/routes')(app); // pass our application into our routes

// start app ===============================================
app.listen(port);
console.log('Magic happens on port ' + port); 			// shoutout to the user
exports = module.exports = app; 						// expose app
