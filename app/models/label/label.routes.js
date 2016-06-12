var _ = require('lodash');
var Label = require('./Label');

module.exports = function(app) {

  // Route to get all labels
  app.get('/api/labels', function(req, res){
    Label.find(function(err, labels){
      if (err) {
        res.status(500).send(err);
      }
      res.json(labels);
    });
  });

  // Creates a new label defined in req.body
  app.post('/api/labels', function(req, res){
    console.log(req.body);
    var label = new Label(req.body);
    label.save(function(err, label){
      if(err){res.status(400).send(err); console.log(err)}
      res.json(label);
    });
  });

  // Deletes the label identified by req.query._id
  app.delete('/api/labels', function(req, res){
    Label.remove({'_id': req.query._id}, function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      res.send(req.query._id);
    });
  });

  // Updates a label defined in req.body based on it's supplied _id
  app.put('/api/labels', function(req, res){
    Label.findOne({'_id': req.body._id}, function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      _.merge(doc, req.body);
      doc.save(function(err, label){
        if(err){res.status(400).send(err);console.log(err);}
        res.json(label);
      });
    });
  });

};
