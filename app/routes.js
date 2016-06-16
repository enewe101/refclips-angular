fs = require('fs');
handlebars = require('handlebars');
rfr = require('rfr');
models = require('./all-models.js')
https = require('https');
passport = require('passport');
User = require('./models/user/User.js');
File = require('./models/file/File.js');
Ref = require('./models/ref/Ref.js');
randomstring = require('randomstring');

module.exports = function(app) {

	// Include all api routes associated to the app's models
	for (let i in models) {
		let route = models[i].routes;
		rfr(route)(app);
	}

	app.get('/check-if-signed-in', function(req,res) {
    if(req.isAuthenticated()) {
      res.json({authenticated:false, user:null});
    }
    res.json({authenticated: true, user:req.session});
	});


	// Route for logout
	app.get('/logout', function(req,res){
    if(req.isAuthenticated()) {req.logout();}
		res.send('logged out');
	});

	// Route for login
	app.post('/login', passport.authenticate('local-signin'), function(req,res){
		res.send(req.user);
	});

	// Route for testing google-sign-in
	app.get('/google-sign-in-test', function(req,res){
		res.sendfile('./public/google-sign-in-test.html');
	});

	function get_mime_type(extension) {
		switch(extension) {
    	case 'pdf': return 'application/pdf';
    	case 'txt': return 'text/plain';
    	case 'exe': return 'application/octet-stream';
    	case 'zip': return 'application/zip';
    	case 'doc': return 'application/msword';
    	case 'xls': return 'application/vnd.ms-excel';
    	case 'ppt': return 'application/vnd.ms-powerpoint';
    	case 'gif': return 'image/gif';
    	case 'png': return 'image/png';
    	case 'jpg': return 'image/jpg';
    	case 'php': return 'text/plain';
    	case 'jpeg': return 'image/jpg';
    	case 'html': return 'text/html';
			default: return 'application/force-download';
		}
	}

	// Handles requests to download previously uploaded files attached to references
	app.get('/uploads/refs', function(req, res){
		let fid = req.query.fid;
		let mode = req.query.mode || 'auto';
		if (mode !== 'auto' && mode !== 'dl') {
			res.status(400).send('Illegal access mode');
		}
		File.findById(req.query.fid, function(err, f){
			if(err) {
				res.status(500).send('There was a problem reading the file');
			}
			if (f.stored_name.indexOf('/') > -1) {
				res.status(404).send('File Not Found');
			}
			if(f.type == 'pdf' && mode === 'auto') {
				fs.readFile('./uploads/refs/' + f.stored_name, function (err,data){
					if(err) {
						res.status(500).send('There was a problem reading the file');
					}
		    	res.contentType("application/pdf");
		    	res.send(data);
		  	});
			} else {
				let mime_type = get_mime_type(f.type);
				let fpath = './uploads/refs/' + f.stored_name;
				fs.stat(fpath, function(err, stat) {
					if(err) {
						res.status(500).send('There was a problem reading the file');
					}
					res.set('Content-Type', mime_type);
					res.set('Content-Disposition', 'attachment; filename=' + f.sent_name);
					res.set('Content-Length', stat.size);
					res.sendfile('./uploads/refs/' + f.stored_name);
				});
			}
		});
	});

	// Route to get the app on first request (or any undefined request)
	app.get('*', function(req, res) {
    fs.readFile('./public/_index.html', 'utf-8', function(err, text){
      if(err) {console.log(err); res.status(500).send('There was an error');}
      let template = handlebars.compile(text);
      let data = {};
      if(req.isAuthenticated()) {
        // Don't pass the hash to the client
        let user = req.user;
        user.hash = null;
        // Do pass the rest of the user's details to the client
        data.user = JSON.stringify(user)
        data.authenticated = 'true';
      } else {
        data.user = 'null';
        data.authenticated = 'false';
      }
      let html = template(data);
      res.send(html);
    });
	});

};
