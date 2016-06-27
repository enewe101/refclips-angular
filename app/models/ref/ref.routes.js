var _ = require('lodash');
var Ref = require('./Ref');
var rfr = require('rfr');
let bibtexParse = rfr('public/libs/bibtex-parse-js/bibtexParse.js');

function authorize_ref(ref_id, user_id, res, next, fail) {
  Ref.findById(ref_id, function(err, ref){
    if(err){
      res.status(500).send('There was a problem updating the reference')
    } else if(!ref || ref.user_id != user_id){
      if(fail) {
        fail();
      } else {
        res.status(403).send('Unauthorized');
      }
    } else {
      next();
    }
  });
}

module.exports = function(app) {

  // Route to get all refs
  app.post('/api/search-refs', function(req, res){

    // Get the query parameters, applying appropriate defaults
    console.log(req.body);
    let match = req.body.match ? req.body.match : {};
    let skip = req.body.skip ? req.body.skip : 0;
    let limit = req.body.limit ? req.body.limit : 20;

    // Add the logged-in user's id to the query
    match.user_id = req.user._id;

    Ref.find(match).sort({createdAt:-1}).skip(skip).limit(limit).exec(function(err, refs){
      if (err) {res.status(500).send(err);}
      res.json(refs);
    });
  });

  // Route to count the number of refs for a given query
  app.post('/api/num-refs', function(req, res){

    // Get the query parameters, applying appropriate defaults
    console.log(req.body);
    let match = req.body.match ? req.body.match : {};

    // Add the logged-in user's id to the query
    match.user_id = req.user._id;

    Ref.find(match).count().exec(function(err, num){
      if (err) {res.status(500).send(err);}
      res.json(num);
    });
  });


  // Route to get all refs
  //app.get('/api/refs', function(req, res){
  //  Ref.find({user_id: req.user._id}, function(err, refs){
  //    if (err) {res.status(500).send(err);}
  //    res.json(refs);
  //  });
  //});

	// First we upload the file.  Then we make an entry in the files collection.
	// Finally, we update the ref to which this file belongs, updating its files
	// property.
  app.post('/api/refs', function(req, res, next){

    if(!req.busboy) {
      next();
    } else {

  		// Start reading the data from busboy
  		req.pipe(req.busboy);

  		// When formData fields are seen, add them to the req.body
  	  req.busboy.on('field', function(fieldname, val) {
  	    req.body[fieldname] = val;
  	  });

  		// Handle saving the file
      req.busboy.on('file', function(fieldname, file, filename) {
          console.log(filename);
  				// Separate out and lower-case the file extension
  				let split_filename = filename.split('.');
  				req.extension = split_filename.pop().toLowerCase();
  				req.sent_name = split_filename.join('.') + '.' + req.extension

  				let d = new Date();
  				req.fpath = 'uploads/refs/';
  				req.stored_name = (
  					d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()
  					+ '-' + req.user.username + '-' + randomstring.generate(8)
  					+ '.' + req.extension
  				);
          var fstream = fs.createWriteStream(req.fpath + req.stored_name);
          file.pipe(fstream);
      });

      // Make an entry for the reference
  	  req.busboy.on('finish', function(){

        var ref = new Ref(req.body);
        ref.user_id = req.user._id;
        ref.save(function(err, ref){
          if(err){
            res.status(400).send(err); console.log(err);
          } else {
            req.ref = ref;
            next();
          }
        });
      });
    }
  },

	// Make an entry in the files collection about this file
  function(req, res) {
    if(!req.stored_name) {
      res.json(req.ref);
    } else {

  		fobj = {
  			ref_id : req.ref._id,
  			username : req.user.username,
  			user_id : req.user._id,
  			stored_name: req.stored_name,
  			type: req.extension,
  			sent_name: req.sent_name
  		};
  		let f = new File(fobj);
  		f.save(function(err, f){
  			if(err) {
  				console.log(err);
  				res.status(500).send('There was a problem saving the file.');
  			} else {
          req.ref.files = [f];
          req.ref.save(function(err, ref){
            if(err) {
              console.log(err);
              res.status(500).send('There was a problem saving the reference.');
            } else {
              res.json(ref);
            }
          });
        }
      });
    }
  });



	// First we upload the file.  Then we make an entry in the files collection.
	// Finally, we update the ref to which this file belongs, updating its files
	// property.
	app.post('/upload', function(req, res, next) {
		// Start reading the data from busboy
		req.pipe(req.busboy);

		// When formData fields are seen, add them to the req.body (in this case
		// ref_id is being passed).
	  req.busboy.on('field', function(fieldname, val) {
	    req.body[fieldname] = val;
	  });

		// Handle saving the file
    req.busboy.on('file', function(fieldname, file, filename) {
				// Separate out and lower-case the file extension
				let split_filename = filename.split('.');
				req.extension = split_filename.pop().toLowerCase();
				req.sent_name = split_filename.join('.') + '.' + req.extension

				let d = new Date();
				req.fpath = 'uploads/refs/';
				req.stored_name = (
					d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate()
					+ '-' + req.user.username + '-' + randomstring.generate(8)
					+ '.' + req.extension
				);
        var fstream = fs.createWriteStream(req.fpath + req.stored_name);
        file.pipe(fstream);
    });

		// Make an entry in the files collection about this file
	  req.busboy.on('finish', function(){
      next();
	  });
	},

  // Check if the user is authorized to edit the reference.  If not, delete
  // the file.
  function(req, res, next) {
    console.log(req.body);
    authorize_ref(req.body.ref_id, req.user._id, res, next, function(){
      fs.unlink('./uploads/refs/' + req.stored_name, function(err){
        if(err) {
          res.status(500).send('There was a problem saving the file');
        } else {
          res.status(403).send('Unauthorized');
        }
      })
    })
  },

  // Proceed with recording the stored file
  function(req, res, next) {
		fobj = {
			ref_id : req.body.ref_id,
			username : req.user.username,
			user_id : req.user._id,
			stored_name: req.stored_name,
			type: req.extension,
			sent_name: req.sent_name
		};
		let f = new File(fobj);
		f.save(function(err, f){
			if(err) {
				console.log(err);
				res.status(500).send('There was a problem saving the file.');
			}
			req.f = f;
			next();
		})
  },

	// Finally, update the reference by adding the file description to its files list.
	function(req, res){
		Ref.findByIdAndUpdate(req.body.ref_id, {$push:{files:req.f}}, function(err, ref){
			if(err) {
					res.status(500).send('There was a problem saving the file.');
			}
			res.json(req.f);
		});
	});

  let validate_multiple_refs = function(req, res, next){
    let refs = req.body;
  	console.log('validation beginning:');
  	console.log(refs);
    req.created_refs = [];
    req.errors = [];
    for (let i = 0; i < refs.length; i++) {
      let ref = refs[i];
      ref.user_id = req.user._id;
      let created_ref = new Ref(ref);
      req.created_refs.push(created_ref);
      created_ref.validate(function(err){
        if(err) {
          req.errors.push({index: i, error: err});
        }
      });
      if (i + 1 === refs.length) {
        next();
      }
    }
  };

  function continue_add_many(req, res, next) {

    console.log('adding');

    if (req.errors.length) {

      var first_error = req.errors[0].error.errors;
      var err_field = Object.keys(first_error)[0] + 1; // make it 1-indexed for the user
      var err_type = first_error[err_field].kind
      var err_index = req.errors[0].index;
      message = (
        'There was a problem with reference '
        + err_index + ': ' + err_field + ': ' + err_type + '.'
      )
      res.status(400).json({message:message});

    } else {

      let saved_refs = [];
      for (let i = 0; i< req.created_refs.length; i++) {
        req.created_refs[i].save(function(err, ref) {
          if(err) {
            res.status(400).json(err);
          } else {
            saved_refs.push(ref);
            if (i == req.created_refs.length - 1) {
              res.json(saved_refs);
            }
          }
        });
      }

    }
  }

  // Add severall new references at once
  app.post('/api/refs/add-many', validate_multiple_refs, continue_add_many);

  let parse_bibtex = function(req, res, next) {

    // First try to parse and act on errors
    console.log('parsing');
    try {
      var parsed = bibtexParse.toJSON(req.body.bibtex);
    } catch (e) {
      res.status(400).json({'message':e});

    } finally {
      // Now nowrmalize the references before passing on to validation
      let refs_to_add = [];
      for (let i = 0; i < parsed.length; i++) {
        let ref = {}
        for (let j in parsed[i].entryTags) {
          ref[j.toLowerCase()] = parsed[i].entryTags[j];
        }
        ref.ref_type = parsed[i].entryType.toLowerCase();
        if(parsed[i].citationKey) {
          ref.citation_key = parsed[i].citationKey;
        }
        refs_to_add.push(ref);
        if(i+1 == parsed.length) {
          req.body = refs_to_add;
          next();
        }
      }
    }
  }

  app.post('/api/refs/import-bibtex', parse_bibtex, validate_multiple_refs, continue_add_many);

  // Deletes the specified reference
  app.delete('/api/refs', function(req, res, next){
    authorize_ref(req.query._id, req.user._id, res, next);
  },
  function(req, res) {
    Ref.remove({'_id': req.query._id}, function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      res.send(req.query._id);
    });
  });


  // Udates a reference
  app.put('/api/refs', function(req, res, next){
    // first check if the reference belongs to the user
    authorize_ref(req.body._id, req.user._id, res, next);
  },
  // Now make the update
  function(req, res) {
	//Ref.findById(req.body._id, function(err, ref){
	//	console.log('original id: ' + ref._id);
	//	console.log('update id: ' + req.body._id);
	//	res.send('debug');
	//});

	let _id = req.body._id;
	delete req.body._id;
	delete req.body.createdAt;
	delete req.body.updatedAt;
	console.log('here');
	console.log(req.body);
    Ref.findByIdAndUpdate(_id, req.body, function(err, ref){
      if(err){
		  console.log('error:');
		  console.log(err);
		  res.status(400).send(err); 
	  }
	  console.log('new ref');
	  console.log(ref);
      res.json(ref);
    });
  });

  // Updates a reference by adding a label to its labels list
  app.put('/api/refs/add-label', function(req, res, next){
    authorize_ref(req.body._id, req.user._id, res, next);
  },
  function(req, res) {
    let _id = req.body._id;
    let label = req.body.label;
    Ref.findByIdAndUpdate(_id, {$push:{labels:label}} , function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      res.send(doc);
    })
  });

  // Updates a reference by removing a label to its labels list
  app.put('/api/refs/remove-label', function(req, res, next){
    authorize_ref(req.body._id, req.user._id, res, next);
  },
  function(req, res) {
    let _id = req.body._id;
    let label = req.body.label;
    Ref.findByIdAndUpdate(_id, {$pull: {labels: label }}, function(err, doc){
      if(err){res.status(400).send(err);console.log(err);}
      res.send(doc);
    });
  });

  // Updates *all* references by removing the specified label
  app.put('/api/refs/labels/remove-all', function(req, res){
    let label = req.body;
    Ref.update({user_id: req.user._id}, {$pull: {labels: label }}, {multi:true}, function(err, raw){
      if(err){res.status(400).send(err),console.log(err);}
      res.send(label._id);
    });
  });

};
