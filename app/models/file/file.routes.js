var _ = require('lodash');
var File = require('./File');

module.exports = function(app) {

  // Route to get all files
  app.get('/api/files', function(req, res){
    File.find(function(err, files){
      if (err) {
        res.status(500).send(err);
      }
      res.json(files);
    });
  });

  // Creates a new file defined in req.body
  app.post('/api/files', function(req, res){
    console.log(req.body);
    var file = new File(req.body);
    file.save(function(err, file){
      if(err){res.status(400).send(err); console.log(err)}
      res.json(file);
    });
  });

  // Deletes the file identified by req.query._id
  app.delete('/api/files', function(req, res, next){
    console.log(req.query);
    // First get the file path and delete the actual file from the file system
    File.findById(req.query._id, function(err, f){
      if(err) {
        res.status(500).send('There was a problem deleting the file.');
      } else if (f === null) {
        res.status(404).send('File Not Found');
      } else if (f.stored_name.indexOf('/') > -1) {
        res.status(500).send('There was a problem deleting the file.');
      } else {
        let path = './uploads/refs/' + f.stored_name;
        fs.unlink(path, function(err){
          if(err) {
            res.status(500).send('There was a problem deleting the file.');
          } else {
            next();
          }
        });
      }
    });

  // Now Delete the file's entry in the db
  }, function(req, res) {
    File.remove({'_id': req.query._id}, function(err, doc){
      if(err){
        res.status(500).send('There was a problem deleting the file');
      } else {
        res.send(req.query._id);
      }
    });
  });

  // Updates a file defined in req.body based on it's supplied _id
  app.put('/api/files', function(req, res){
    let file = req.body;
    File.findByIdAndUpdate(file._id, file, function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      res.json(file);
    });
  });

};
