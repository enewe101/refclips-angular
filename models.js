rfr = require('rfr');

var mongoose       = require('mongoose');

var db = require('./config/db');

var port = process.env.PORT || 8080; // set our port
mongoose.connect(db.url); // connect to our mongoDB database (commented out after you enter in your own credentials)

model_lookup = require('./app/all-models.js');
let models = {};
for (let model_name in model_lookup) {
  models[model_name] = rfr(model_lookup[model_name]['model']);
}

module.exports = models;

//vorpal .delimiter('node~$') .use(repl) .show();
