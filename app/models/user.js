var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
	'email':String,
	'password':String,
	'dateAdded':{type:Date, default:Date.now},
	'linksCreated':Array,
	'userId':String,
})

userSchema.methods.generateHash = function(password){
	return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
}

userSchema.methods.compareHash = function(password){
	return bcrypt.compareSync(password,this.password)
}

module.exports = mongoose.model('User',userSchema)