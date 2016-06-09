var _ = require('lodash');
var Ref = require('./Ref');

module.exports = function(app) {

  // Route to get all refs
  app.get('/api/refs', function(req, res){
    Ref.find(function(err, refs){
      if (err) {
        res.send(err);
      }
      res.json(refs);
    });
  });

  app.post('/api/refs', function(req, res){
    var ref = new Ref(req.body);
    ref.save(function(err, ref){
      if(err){
        res.send(err);
        console.log('error!')
      }
      console.log(req.body);
      res.json(201, ref);
    });
  });

  app.delete('/api/refs', function(req, res){
    console.log('deleting ' + req.query._id);
    Ref.remove({'_id': req.query._id}, function(err, doc){
      if(err){
        res.send(err);
        console.log('error!')
      }
      console.log('deleted ' + req.query._id);
      res.send(201);
    });
  });

  app.put('/api/refs', function(req, res){
    console.log('updating ' + req.body._id);
    Ref.findOne({'_id': req.body._id}, function(err, doc){
      if(err){
        res.send(err);
        console.log('error!')
      }
      _.merge(doc, req.body);
      doc.save(function(err, ref){
        if(err){
          res.send(err);
          console.log('error!')
        }
        console.log(req.body);
        res.json(201, ref);
      });
    });
  });

  // Updates a reference by adding or removing a label
  app.put('/api/refs/labels', function(req, res){

    // Pull out the needed data from the request
    let _id = req.body._id;
    let state = req.body.state
    let label = req.body.label;

    // Make sure we got the data
    console.log('updating ' + _id + ' ' + state + ' ' + label);

    if (state) {

      // If state is false, unset label.name
      Ref.findByIdAndUpdate(_id, {$push:{labels:label}} , function(err, doc){
        // notify client in case of error
        if(err){
          res.send(err);
          console.log('error!')
        }

        console.log('the updated doc: ' + doc);
        res.send(201, doc);
      })

    } else {

      Ref.findByIdAndUpdate(_id, {$pull: {labels: label }}, function(err, doc){

        // notify client in case of error
        if(err){
          res.send(err);
          console.log('error!')
        }

        console.log('the updated doc: ' + doc);
        res.send(201, doc);
      });
    }

  });

  // Updates all references by removing a label from all references.
  app.put('/api/refs/labels/remove-all', function(req, res){
    let label = req.body;
    console.log('removing label ' + label.name + ' from all refs.')
    Ref.update({}, {$pull: {labels: label }}, {multi:true}, function(err, raw){
      // notify client whether the operation was successful
      if(err){
        console.log('on "remove-all", the raw response from mongo: ' + raw)
        res.send(raw);
      }
      res.send(201);
    });
  });

};
