var _ = require('lodash');
var User = require('./User');
var bcrypt = require('bcrypt');
var email_is_valid = require('mine/validate-email');

let DUP_KEY_ERR = 11000;

module.exports = function(app) {

	app.get('/api/users/check-if-signed-in', function(req,res) {
    if(req.isAuthenticated()) {
	    res.json({authenticated: true, user:req.user});
    } else {
      res.json({authenticated:false, user:null});
		}
	});

	// Route for signing in with google
	app.post('/api/users/google-signin', function(req,respond){
		let id_token = req.body.id_token;
		let path = 'https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=';
		path = path + id_token;

		https.get(path, function(response){
			response.on('data', function(data) {
				let aud = data.aud;
				let sub = data.sub;
				let email = data.email;
				let fname = data.given_name;
				let lname = data.family_name;
				let picture = data.picture;

				let user = User.findOne({sub:sub}, function(err, doc){
					if(err) {respond.status(400).json(err);}
					if (doc) {
						var return_response = {action:'logged-in', user:doc};
					} else {
						var return_response = {action:'signed-up', user:doc};
					}
					respond.json(return_response);
				});
			});
		}).on('error', function(err){
			console.log(err);
			respond.status(400).json(err);
		});
	});

  // Route to get all users
  app.get('/api/users', function(req, res){
    User.find(function(err, users){
      if (err) {res.status(500).send(err);}
      res.json(users);
    });
  });

  // Register a new user
	// Note "sapi" routes don't need authentication
	let NUM_SALT_ROUNDS = 8;
  app.post('/sapi/users',

	// First we do some basic validaton on the new-user data
	function(req, res, next){
    req.user = new User(req.body);
		let password = req.body.password;
		let errors = [];

		// validate the username. (but we'll check it's uniqueness later)
		if(!(typeof req.user.username === 'string')){
			errors.push('bad-username');
		} else if(req.user.username.trim() === '') {
			errors.push('bad-username');
		}

		// validate the password
		if(!(typeof password === 'string')){
			errors.push('bad-password');
		} else if(password.length < 8) {
			errors.push('short-password');
		}

		// validate the email. (we'll check its uniqueness later)
		if(!(typeof req.user.email === 'string')){
			errors.push('bad-email');
		} else if(!email_is_valid(req.user.email)) {
			errors.push('bad-email');
		}

		// If we had errors, send them back to the client, otherwise, go to next step
		if(errors.length) {
			res.send({success: false, reason: errors});
		} else {
			next();
		}
	},

	// Now we take the users password and make a hash for them using bcrypt
	function(req, res, next) {
		let password = req.body.password;
		bcrypt.hash(password, NUM_SALT_ROUNDS, function(err, hash){
			if(err) {
				console.log(err);
				res.status(500).send('There was a problem with registration.');
			} else {
				req.user.hash = hash;
				next();
			}
		});
	},

	// Now we're ready to try creating the new user.  At this point we'll catch
	// non-unique email or non-unique username issues.
	function(req, res) {
    req.user.save(function(err, user){
			console.log(err);
			console.log(user);
      if(err){
				if(err.code == DUP_KEY_ERR) {
					if (err.message.indexOf('email') > -1) {
						res.json({sucess: false, reason:['dup_email'], user: null});
					} else if(err.message.indexOf('username') > -1) {
						res.json({sucess: false, reason:['dup_username'], user: null});
					} else {
						res.status(400).send(err);
					}
				} else {
					res.status(400).send(err);
				}
			} else {
				console.log('sending');
	      res.json({success: true, reason: null, user: user});
			}
    });
  });

  // Check if a username is already taken
	// Note "sapi" routes don't need authentication
  app.get('/sapi/users/check-username', function(req, res){
		let username = req.query.u;
    User.findOne({username: username}, function(err, user){
      if (err) {
				res.status(500).send(err);
			} else {
				if (user) {
		      res.json(true);
				} else {
					res.json(false);
				}
			}
    });
  });

  // Deletes the specified user
  app.delete('/api/users', function(req, res){
    User.remove({'_id': req.query._id}, function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      res.send(req.query._id);
    });
  });

  // Udates a user
  app.put('/api/users', function(req, res){
    User.findOne({'_id': req.body._id}, function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      _.merge(doc, req.body);
      doc.save(function(err, user){
        if(err){res.status(400).send(err); console.log(err)}
        res.json(user);
      });
    });
  });

  // Updates a users by adding a label to its labels list
  app.put('/api/users/add-label', function(req, res){
    let _id = req.body._id;
    let label = req.body.label;
    User.findByIdAndUpdate(_id, {$push:{labels:label}} , function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      res.send(doc);
    })
  });

  // Updates a user by removing a label to its labels list
  app.put('/api/users/remove-label', function(req, res){
    let _id = req.body._id;
    let label = req.body.label;
    User.findByIdAndUpdate(_id, {$pull: {labels: label }}, function(err, doc){
      if(err){res.status(400).send(err);console.log(err);}
      res.send(doc);
    });
  });

  // Updates *all* user by removing the specified label
  app.put('/api/users/labels/remove-all', function(req, res){
    let label = req.body;
    User.update({}, {$pull: {labels: label }}, {multi:true}, function(err, raw){
      if(err){res.status(400).send(err),console.log(err);}
      res.send(label._id);
    });
  });

};
