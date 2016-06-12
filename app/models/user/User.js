// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('User', {
	screen_name: {type : String, required: true},
	fname: {type: String},
	lname: {type: Number},
	email : {type : String},
	email_validated: {type : Boolean},
	sub: {type: String},
	avatar_url: {type: String}
});
