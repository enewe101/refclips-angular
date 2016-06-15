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
    console.log(query);
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

  // Add a new reference
  app.post('/api/refs', function(req, res){
    var ref = new Ref(req.body);
    ref.save(function(err, ref){
      if(err){res.status(400).send(err); console.log(err);}
      res.json(ref);
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
    console.log('num errors:' + errors.length);
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
    Ref.findOne({'_id': req.body._id}, function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      _.merge(doc, req.body);
      doc.save(function(err, ref){
        if(err){res.status(400).send(err); console.log(err)}
        res.json(ref);
      });
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
      if(err){res.status(400).send(err);console.log('error!');}
      res.send(doc);
    });
  });

  // Updates *all* references by removing the specified label
  app.put('/api/refs/labels/remove-all', function(req, res){
    let label = req.body;
    Ref.update({}, {$pull: {labels: label }}, {multi:true}, function(err, raw){
      if(err){res.status(400).send(err),console.log(raw);}
      res.send(label._id);
    });
  });

};
