// grab the mongoose module
var mongoose = require('mongoose');

// define our nerd model
// module.exports allows us to pass this to other files when it is called
module.exports = mongoose.model('File', {
	stored_name: {type : String, required: true},
  sent_name: {type: String},
  username: {type: String},
  user_id: {type: String},
  refid: {type: String},
  deleted: {type: Boolean, default: false},
  type: {type: String}
});
