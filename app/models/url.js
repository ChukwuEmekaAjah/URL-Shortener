var mongoose = require('mongoose');

var urlSchema = mongoose.Schema({
	'url':String,
	'shortcode':String,
	'dateCreated':{type:Date, default:Date.now},
	'creatorId':String,
	'numberOfClicks':{type:Number, default:0},
	'lastClickDate':Date,
	'clickers':[{timeClicked:Date,referrer:String}],
})


module.exports = mongoose.model('URL',urlSchema)