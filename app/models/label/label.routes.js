var _ = require('lodash');
var Label = require('./Label');

module.exports = function(app) {

  // Route to get all labels
  app.get('/api/labels', function(req, res){
    Label.find(function(err, labels){
      if (err) {
        res.send(err);
      }
      res.json(labels);
    });
  });

  app.post('/api/labels', function(req, res){
    var label = new Label(req.body);
    label.save(function(err, label){
      if(err){
        res.send(err);
        console.log('error!')
      }
      console.log(req.body);
      res.json(201, label);
    });
  });

  app.delete('/api/labels', function(req, res){
    console.log('req.query:');
    console.log(req.query);
    console.log('deleting ' + req.query._id);
    Label.remove({'_id': req.query._id}, function(err, doc){
      if(err){res.send(err); console.log(err);}
      console.log('deleted ' + req.query._id);
      res.send(201);
    });
  });

  app.put('/api/labels', function(req, res){
    console.log('updating ' + req.body._id);
    Label.findOne({'_id': req.body._id}, function(err, doc){
      if(err){
        res.send(err);
        console.log('error!')
      }
      _.merge(doc, req.body);
      doc.save(function(err, label){
        if(err){
          res.send(err);
          console.log('error!')
        }
        console.log(req.body);
        res.json(201, label);
      });
    });
  });

};
