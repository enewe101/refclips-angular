var _ = require('lodash');
var User = require('./User');

module.exports = function(app) {

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
					console.log(doc)
					if (doc) {
						var return_response = {action:'logged-in', user:doc};
					} else {
						var return_response = {action:'signed-up', user:doc};
					}
					respond.json(return_response);
				});
			});
		}).on('error', function(err){
			console.log('error: ' + err);
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

  // Add a new users
  app.post('/api/users', function(req, res){
    var user = new User(req.body);
    user.save(function(err, user){
      if(err){res.status(400).send(err); console.log(err);}
      res.json(user);
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
      if(err){res.status(400).send(err);console.log('error!');}
      res.send(doc);
    });
  });

  // Updates *all* user by removing the specified label
  app.put('/api/users/labels/remove-all', function(req, res){
    let label = req.body;
    User.update({}, {$pull: {labels: label }}, {multi:true}, function(err, raw){
      if(err){res.status(400).send(err),console.log(raw);}
      res.send(label._id);
    });
  });

};
