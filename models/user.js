var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
	username: {
		type: String,
		index:true
	},
	password: {
		type: String
	},
	active: {
		type: Boolean,
		default: true
	}
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(newUser, callback){
	bcrypt.genSalt(10, function(err, salt) {
	    bcrypt.hash(newUser.password, salt, function(err, hash) {
			newUser.password = hash;
	        newUser.save(callback);
	    });
	});
}

module.exports.disableAccount = function(username, callback){
	let query = {username: username, active: true};
	let update = {active: false};
	User.updateOne(query, update, callback);
}

module.exports.getUserByUsername = function(username, callback){
	let query = {username: username, active: true};
	User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback){
	User.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
	bcrypt.compare(candidatePassword, hash, function(err, isMatch) {
    	if(err) throw err;
    	callback(null, isMatch);
	});
}