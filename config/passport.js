var nodemailer = require('nodemailer');

function emailer(emailAddress,name,id){
    var transporter = nodemailer.createTransport({
     service: 'gmail',
     auth: {
            user: 'talk2ajah@gmail.com',
            pass: 'CRUCIBLE96'
        }
    });
    // setup email data with unicode symbols
    let mailOptions = {
        from: '"I-AMVOCAL Team 👻" <talk2ajah@gmail.com>', // sender address
        to: emailAddress, // list of receivers
        subject: 'I-AMVOCAL signup', // Subject line
        html: '<b>Hello '+name+'</b><p> Thanks for signing up to be part of the I-AMVOCAL community. To complete the sign up process, please click on the link that follows to confirm that it\'s you: <a href="www.i-amvocal.xyz/signup/confirmation/'+id+'"> Confirmation link </a></p>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });

}

// config/passport.js

// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

var crypto = require('crypto');
// load up the user model
var User          = require('../app/models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.userId);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findOne({userId:id}, function(err, user) {
            done(err, {userId:user.userId});
        });
    });

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'
    var signin = function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        
        User.findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            console.log(email)
            if (err)
                return done(err);
            // if no user is found, return the message
            if (!user){
                console.log('oops he is not a user ooo')
                return done(null, false, req.flash('loginMessage', 'There was no user found with the email address')); // req.flash is the way to set flashdata using connect-flash
            }

            // if the user is found but the password is wrong
            if (!user.compareHash(password)){
                console.log('wrong password ooo')
                return done(null, false, req.flash('loginMessage', 'The password sent doesn"t match the email address ')); // create the loginMessage and save it to session as flashdata
            }

            // all is well, return successful user
            return done(null, {userId:user.userId});
        });
        
        

    }
    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {
        
        // asynchronous
        // User.findOne wont fire unless data is sent back
       
        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        
        User.findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error
            if (err)
                return done(err);

            // check to see if there's already a user with that email
            if (user) {
                console.log('There is a user with such details');
                signin(req,req.body.email,req.body.password,done);
            } 
            else {

                // if there is no user with that email
                // create the user
                console.log(req.body);
                var newUser            = new User();

                // set the user's local credentials
                newUser.email    = email;
                newUser.password = newUser.generateHash(password);
                newUser.userId = crypto.createHmac('sha256',password).update(email).digest('hex');
                 // save the user
                newUser.save(function(err,user) {
                    if (err)
                        throw err;
                    console.log(user)
                   /* emailer(user.email,user.firstName,user.userId); */
                    return done(null, {userId:newUser.userId});
                });
            }

        });    
        

    }));

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    }, function (req,email,password,done){
        

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        
        User.findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            console.log(email)
            if (err)
                return done(err);
            // if no user is found, return the message
            if (!user){
                console.log('oops he is not a user ooo')
                return done(null, false, req.flash('loginMessage', 'There was no user found with the email address')); // req.flash is the way to set flashdata using connect-flash
            }

            // if the user is found but the password is wrong
            if (!user.compareHash(password)){
                console.log('wrong password ooo')
                return done(null, false, req.flash('loginMessage', 'The password sent doesn"t match the email address ')); // create the loginMessage and save it to session as flashdata
            }

            // all is well, return successful user
            return done(null, {userId:user.userId});
        });
    }
    ));

};

