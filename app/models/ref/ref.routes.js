var _ = require('lodash');
var Ref = require('./Ref');

module.exports = function(app) {

  // Route to get all refs
  app.post('/api/search-refs', function(req, res){
    if(req.body) {
      query = req.body;
    } else {
      query = {};
    }
    Ref.find(query, function(err, refs){
      if (err) {res.status(500).send(err);}
      res.json(refs);
    });
  });

  // Route to get all refs
  app.get('/api/refs', function(req, res){
    Ref.find(function(err, refs){
      if (err) {res.status(500).send(err);}
      res.json(refs);
    });
  });

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
	  });
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

  // Add severall new references at once
  app.post('/api/refs/add-many', function(req, res){
    let refs = req.body;
    let created_refs = [];
    let errors = [];
    for (let i = 0; i < refs.length; i++) {
      let ref = refs[i];
      let created_ref = new Ref(ref);
      created_refs.push(created_ref);
      created_ref.validate(function(err){
        if(err) {
          errors.push({index: i, error: err});
        }
        // If we've validated them all, proceed to the next step
        if (i == refs.length - 1) {
          continue_add_many(created_refs, errors, res);
        }
      });
    }
  });
  function continue_add_many(created_refs, errors, res) {
    if (errors.length) {
      var first_error = errors[0].error.errors;
      var err_field = Object.keys(first_error)[0];
      var err_type = first_error[err_field].kind
      var err_index = errors[0].index;
      err = {index: err_index, type: err_type, field: err_field};
      res.status(400).json(err);
    } else {
      let saved_refs = [];
      for (let i = 0; i< created_refs.length; i++) {
        created_refs[i].save(function(err, ref) {
          if(err) {
            res.status(400).json(err);
          }
          saved_refs.push(ref);
          if (i == created_refs.length - 1) {
            res.json(saved_refs);
          }
        })
      }
    }
  }



  // Deletes the specified reference
  app.delete('/api/refs', function(req, res){
    Ref.remove({'_id': req.query._id}, function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      res.send(req.query._id);
    });
  });

  // Udates a reference
  app.put('/api/refs', function(req, res){
    Ref.findByIdAndUpdate(req.body._id, req.body, function(err, ref){
      if(err){res.status(400).send(err); console.log(err);}
      res.json(ref);
    });
  });

  // Updates a reference by adding a label to its labels list
  app.put('/api/refs/add-label', function(req, res){
    let _id = req.body._id;
    let label = req.body.label;
    Ref.findByIdAndUpdate(_id, {$push:{labels:label}} , function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      res.send(doc);
    })
  });

  // Updates a reference by removing a label to its labels list
  app.put('/api/refs/remove-label', function(req, res){
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
    Ref.update({}, {$pull: {labels: label }}, {multi:true}, function(err, raw){
      if(err){res.status(400).send(err),console.log(err);}
      res.send(label._id);
    });
  });

};
