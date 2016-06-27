var _ = require('lodash');
var File = require('./File');

function authorize_file(file_id, user_id, res, next, fail) {
  File.findById(file_id, function(err, file){
    if(err){
      res.status(500).send('There was a problem updating the file')
    } else if(!file || file.user_id != user_id){
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

  // Route to get all files
  app.get('/api/files', function(req, res){
    File.find({user_id: req.user._id}, function(err, files){
      if (err) {
        res.status(500).send(err);
      }
      res.json(files);
    });
  });

  // Creates a new file defined in req.body
  app.post('/api/files', function(req, res){
    var file = new File(req.body);
    file.user_id = req.user._id;
    file.save(function(err, file){
      if(err){res.status(400).send(err); console.log(err)}
      res.json(file);
    });
  });

  // Deletes the file identified by req.query._id
  app.delete('/api/files', function(req, res, next){
    authorize_file(req.query._id, req.user._id, res, next);
  },
  function(req, res, next) {
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
  app.put('/api/files', function(req, res, next){
    authorize_file(req.body._id, req.user._id, res, next);
  },
  function(req, res) {
    let file = req.body;
	delete file._id;
    File.findByIdAndUpdate(file._id, file, function(err, doc){
      if(err){res.status(400).send(err); console.log(err);}
      res.json(file);
    });
  });

};
