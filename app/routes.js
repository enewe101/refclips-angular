var Ref = require('./models/ref/Ref');

module.exports = function(app) {

	// Include routes for references
	require('./models/ref/ref.routes')(app);
	require('./models/label/label.routes')(app);

	// Route to get the app on first request (or any undefined request)
	app.get('*', function(req, res) {
		res.sendfile('./public/index.html');
	});

};
