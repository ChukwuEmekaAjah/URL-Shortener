var URL = require('../app/models/url');
var User = require('../app/models/user');
function Utils(url){
	var characters = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
	var shortCodes = [];
	function getShortCodes(){
		url.find({},'shortCode',function(err,urls){
			if(err)
				throw err;
			shortCodes = urls.map(function(link,index){
				return link['shortCode'];
			});
			return true;
		})
	}
	function generateShortCode(){
		// we would be using 5 letters as our unique short code
		var alphabets = [];
		for(var i = 0; i<5; i++){
			alphabets.push(characters[Math.ceil(Math.random() * characters.length)]);
		}
		if(shortCodes.indexOf(alphabets.join('')) == -1){
			return alphabets.join('');
		}
		return generateShortCode();
	}

	function createShortLink(){
		getShortCodes();
		return generateShortCode();
	}

	function saveURL (shortCode,link,userId){
		var newURL = new URL();
		newURL.url = link;
		newURL.shortCode = shortCode;
		newURL.creatorId = userId;
		newURL.save(function(err,savedURL){
			if(err)
				throw err;
			//console.log(savedURL);
			console.log(savedURL);
		})
	}

	function isThereUserUrl(userId,link,shortCode,res){
		console.log(userId);
	    User.findOne({userId:userId},function(err,user){
	    	if(err)
				throw err;
			console.log(user);
			var isThereLink = user['linksCreated'].filter(function(resource){
				if(resource['url'] == link)
					return true;
			})
			if(isThereLink.length){
				res.send('There is a link as that by the same user')
			}
			else{
				console.log('there is no url as this created by the user')
				saveURL(shortCode,link,userId);
				updateUser(shortCode,link,userId,res);
			}
		})
	}

	function updateUser(shortCode,link,userId,res){
		return User.findOne({userId:userId},function(err,user){
			if(err)
				throw err;
			user.linksCreated.push({shortCode:shortCode,url:link});
			user.save(function(err,updatedUser){
				if(err)
					throw err;
				res.send('successful creation of link. the shortCode is '+shortCode);
			})
		})
	}

	function updateLink(req,res){
		var referer = req.get('referer');
		var time = (new Date()).getTime();
		var shortCode = req.params.id;
		URL.findOne({shortCode:shortCode},function(err,url){
			if(err)
				throw err;
			if(!url){
				res.send('there is no URL as that in our database');
			}
			else{
				url.numberOfClicks +=1;
				url.lastClickDate = time;
				url.clickers.push({timeClicked:time,referrer:referer});
				url.save(function(err,updatedUrl){
					if(err)
						throw err;
					console.log(updatedUrl);
					res.redirect(updatedUrl['url']);
				})
			}
		})
	}

	return {getShortCodes:getShortCodes, 
			generateShortCode:generateShortCode,
			createShortLink:createShortLink,
			saveURL:saveURL,
			isThereUserUrl:isThereUserUrl,
			updateUser:updateUser,
			updateLink:updateLink};
}

module.exports = Utils(URL);