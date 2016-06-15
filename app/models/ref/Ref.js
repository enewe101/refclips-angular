// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('Ref', {
	title: {type : String, required: true},
	ref_type: {type: String},
	citation_key: {type: String},
	booktitle: {type: String},
	author: {type: String},
	year: {type: Number},
	url : {type : String},
	notes: {type: String},
	labels: {type: Object, default: []},
	files: {type: Object, default: []}
});
