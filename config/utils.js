var Url = require('../app/models/url');
var User = require('../app/models/user');
var crypto = require('crypto');
function Utils(){
	var characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	var shortCodes = [];

	function create_cookie(req,res){
		var user = req.cookies.user? req.cookies.user: null;
		var cookie = user? user: crypto.createHmac('sha256', 'shortLink').update(Date.now().toString()).digest('hex');
		res.cookie('user',cookie,{maxAge:31536000000, httpOnly:true});
		// let's check if there was a cookie for the user all this while.
		console.log(cookie);
		return {user:user,cookie:cookie};
	}

	function add_user(cookie,return_value){
		var new_user = new User();
		new_user.userId = cookie.cookie;
		new_user.save(function(err,saved_user){
			if(err)
				throw err;
			return_value(saved_user);
		})
	}

	function get_user(data,return_value){
		User.findOne(data,function(err,user){
			if(err){
				throw err;
			}
			if(user.userId){
				console.log('this is the user we found '+user);
				return return_value(user);
			}
		})
	}

	function update_user(data,user,return_value){
		user.linksCreated.push(data);
		user.markModified('linksCreated');
		user.save(function(err,updated_user){
			if(err)
				throw err;
			return return_value(updated_user);
		})
	}

	function get_urls(return_value){
		Url.find({},function(err,urls){
			if(err)
				throw err;
			if(urls.length){
				return return_value(urls);
			}
			else{
				return return_value([])
			}
		})
	}
	function get_shortcodes(return_value){
		return get_urls(function(urls){
			if(urls.length){
				var shortcodes = urls.map(function(url){
					return url.shortcode;
				})
				return return_value(shortcodes);
			}
			else{
				return return_value([]);
			}
		});
	}

	function create_shortcode(shortcodes){
		// get all the shortcodes in our system and compare it with the one generated
		// if it exists, we recursively find another one.
		// we would be using 5 letters as our unique short code
		var shortcodes = shortcodes;
		var alphabets = [];
		for(var i = 0; i<5; i++){
			alphabets.push(characters[Math.floor(Math.random() * characters.length)]);
		}
		if(shortcodes.indexOf(alphabets.join('')) == -1){
			return alphabets.join('');
		}
		return create_shortcode(shortcodes);
	}

	function add_url (data,return_value){
		var new_url = new Url();
		new_url.url = data.link;
		new_url.shortcode = data.shortcode;
		new_url.creatorId = data.userId;
		new_url.save(function(err,saved_url){
			if(err)
				throw err;
			return_value(saved_url)
		})
	}

	function get_url(data,return_value){
		Url.findOne(data,function(err,url){
			if(err)
				throw err;
			return return_value(url);
		})
	}

	function update_url(req,url,return_value){
		url.numberOfClicks += 1;
		console.log(req.get('Referrer'));
		url.clickers.push({referrer:req.get('Referrer')?req.get('Referrer'):'undefined',timeClicked:Date.now()});
		url.save(function(err,saved_url){
			if(err)
				throw err;
			console.log(saved_url);
			return return_value(saved_url);
		})
	}

	return {
			get_url: get_url,
			update_url: update_url,
			create_shortcode:create_shortcode,
			create_cookie:create_cookie,
			add_url:add_url,
			add_user:add_user,
			get_shortcodes:get_shortcodes,
			get_urls:get_urls,
			update_user:update_user,
			get_user:get_user};
}

module.exports = Utils();