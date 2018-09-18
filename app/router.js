var URL = require('../app/models/url');
var User = require('../app/models/user');
var utils = require('../config/utils');
var crypto = require('crypto');

function route(app,mongoose){
	//===========================
	//============================
	// THIS HANDLES THE RENDERING OF STATIC DOCUMENTS SUCH AS THE HOME PAGE AND THE ABOUT PAGE.
	app.get('/',function(req,res){
		var cookie_data = utils.create_cookie(req,res);
		if(!cookie_data.user){
			// if the user cookie didn't exist before now, let's add the user to our db
			utils.add_user(cookie_data,function(new_user){
				res.render('index',{user:new_user.userId})
			})
		}
		else{
			res.render('index',{user:req.cookies.user})
		}
	})
	
	app.post('/add',function(req,res){
		var cookie_data = utils.create_cookie(req,res);
		if(!cookie_data.user){
			// if the user cookie didn't exist before now, let's add the user to our db
			utils.add_user(cookie_data,function(new_user){
				// if there was no cookie before, lets create a cookie and add the url
				utils.get_shortcodes(function(shortcodes){
					var created_shortcode = utils.create_shortcode(shortcodes)
					var data = {link:req.body.link,shortcode:created_shortcode}
					utils.get_user({userId:new_user.userId},function(user){
						utils.update_user(data,user,function(updated_user){
							data.userId = updated_user.userId;
							utils.add_url(data,function(saved_url){
								res.send(saved_url);
							})
						})
					})
				})
			})
		}
		else{
			// if the cookie existed before the post request, let us just generate the shortlink for him
			// we update the links created by this user
			// we add the new link and send the url data to the user;
			utils.get_shortcodes(function(shortcodes){
				var created_shortcode = utils.create_shortcode(shortcodes)
				console.log(created_shortcode+' that is the shortcode');
				var data = {link:req.body.link,shortcode:created_shortcode}
				utils.get_user({'userId':req.cookies.user},function(user){
					console.log('we have gotten the user '+user.userId)
					utils.update_user(data,user,function(updated_user){
						console.log('user has been updated '+updated_user)
						data.userId = updated_user.userId;
						utils.add_url(data,function(saved_url){
							console.log('url has been saved '+saved_url);
							res.send(saved_url);
						})
					})
				})
			})
		}
	})

	app.get('/:shortcode',function(req,res){
		var data = {shortcode: req.params.shortcode};
		utils.get_url(data,function(url){
			if(url['shortcode']){
				console.log(url);
				utils.update_url(req,url,function(updated_url){
					res.redirect(updated_url['url']);
				})
			}
			else{
				res.send('the url does not exist');
			}
		})
	})
	//----------------------------------------
	//----------------------------------------
	//=======================================
	// 				THIS PLACE IS FOR USER AUTHENTICATION. HANDLING OF SESSIONS AND SIGNING UP
	

}
module.exports = route;
