// grab the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// define our nerd model
// module.exports allows us to pass this to other files when it is called
let user_schema = new mongoose.Schema({
	username: {type : String, required: true},
	fname: {type: String},
	lname: {type: Number},
	email : {type : String},
	email_validated: {type : Boolean},
	sub: {type: String},
	avatar_url: {type: String},
	hash: {type: String}
});

user_schema.methods.authenticate = function(password) {
	return bcrypt.compareSync(password, this.hash);
};

user_schema.set('toJson', {transform:function(user, ret, options){
	delete ret.hash;
}});
user_schema.set('toObject', {transform:function(user, ret, options){
	delete ret.hash;
}});

user_schema.statics.create_user = function(username, password, then) {

	User.findOne({username:username}, function(err,doc){
		if (err) {
			then(err, null);
		} else if(doc) {
			then('username taken', null);
		} else {
			let user = new User({username:username});
			// Generate the user's password hash
			user.hash = bcrypt.hashSync(password, 8);
			user.save(function(err, user){
				if (err) {
					then(err, null);
				}
				// Return the user
				then(null, user);
			});
		}
	})
}

let User = mongoose.model('User', user_schema);


module.exports = User;
