// grab the mongoose module
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');

// define our nerd model
// module.exports allows us to pass this to other files when it is called
let user_schema = new mongoose.Schema({

	// email and username have to be unique!
	email : {type : String, index: {unique: true, dropDups: true}},
	username: {type : String, required: true, index: {unique: true, dropDups: true}},

	fname: {type: String},
	lname: {type: Number},
	email_validated: {type : Boolean},
	sub: {type: String},
	avatar_url: {type: String},
	hash: {type: String}
});

user_schema.methods.authenticate = function(password) {
	console.log('hash:' + this.hash);
	console.log('password:' + password);
	return bcrypt.compareSync(password, this.hash);
};

user_schema.set('toJSON', {transform:function(user, ret, options){
	delete ret.hash;
	return ret;
}});
user_schema.set('toObject', {transform:function(user, ret, options){
	delete ret.hash;
	return ret;
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
