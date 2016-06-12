rfr = require('rfr');
models = require('./all-models.js')
https = require('https');

User = require('./models/user/User.js');

module.exports = function(app) {

	// Include all api routes associated to the app's models
	for (let i in models) {
		let route = models[i].routes;
		rfr(route)(app);
	}

	// Route for testing google-sign-in
	app.get('/google-sign-in-test', function(req,res){
		res.sendfile('./public/google-sign-in-test.html');
	});

	// Route for testing masonry
	app.get('/masonry-test', function(req,res){
		res.sendfile('./public/masonry-test.html');
	});

	// Route to get the app on first request (or any undefined request)
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};
