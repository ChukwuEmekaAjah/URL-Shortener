var URL = require('../app/models/url');
var User = require('../app/models/user');
var utils = require('../config/utils');
var crypto = require('crypto');

function route(app,mongoose){
	//===========================
	//============================
	// THIS HANDLES THE RENDERING OF STATIC DOCUMENTS SUCH AS THE HOME PAGE AND THE ABOUT PAGE.
	app.get('/',function(req,res){
		var user = req.cookies.user? req.cookies.user: null;
		var cookie = user? user: crypto.createHmac('sha256', 'shortLink').update(Date.now().toString()).digest('hex');
		res.cookie('user',cookie,{maxAge:31536000000, httpOnly:false})
		if(!user){
			var newUser = new User();
			newUser.userId = cookie;
			newUser.save(function(err,savedUser){
				if(err)
					throw err;
				console.log('successfully saved new user');
				res.render('index',{user:savedUser.userId})
			})
		}
		else{
			res.render('index',{user:user})
		}
	})
	
	app.post('/add',function(req,res){
		var url = req.body.link.toLowerCase();
		var link = utils.createShortLink();
		utils.isThereUserUrl(req.cookies.user,url,link,res);
		
	})

	app.get('/all',function(req,res){
		URL.find({},function(err,links){
			if(err)
				throw err;
			res.send(links);
		})
	})
	//----------------------------------------
	//----------------------------------------
	//=======================================
	// 				THIS PLACE IS FOR USER AUTHENTICATION. HANDLING OF SESSIONS AND SIGNING UP
	
	
	app.get('/:id',function(req,res){
		utils.updateLink(req,res)
	})

}
module.exports = route;
