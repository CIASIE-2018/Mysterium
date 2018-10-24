const express = require('express');
const router  = express.Router();

const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;

/* MODEL */
const User = require('../models/user');


router.get('/register', (req, res) => {
	res.render('register');
});

router.post('/register', (req, res) => {
	let username  = req.body.username;
	let password  = req.body.password;

	// Validation
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	if (req.validationErrors())
		res.render('register', {errors});
	else {
		//checking username are already taken
		User.findOne({ 
            username: { "$regex": "^" + username + "\\b", "$options": "i"}
        }, (err, user) => {
            if (user) 
				res.render('register', {user});
			else {
				let newUser = new User({
					username,
					password
                });
                
				User.createUser(newUser,(err, user) => {
					if (err) throw err;
                });
                
                req.flash('success_msg', 'You are registered and can now login');
                res.redirect('/login');
            }
		});
	}
});

router.get('/login', (req, res) => {
	res.render('login');
});

router.post('/login',passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), (req, res) => {
	req.session.username = req.user.username;
	res.redirect('/profile');
});

router.get('/profile', ensureAuthenticated, (req, res) => {
	res.render('profile', {
		user : req.user
	});
});

router.post('/profile', ensureAuthenticated, (req, res) => {
	User.disableAccount(req.user.username, err => {
		if (err) throw err;
		res.redirect('/logout');
	})
});

router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success_msg', 'You are logged out');
	res.redirect('/login');
});


function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		req.flash('error_msg','You are not logged in');
		res.redirect('/login');
	}
}

passport.use(new LocalStrategy((username, password, done) => {
    User.getUserByUsername(username,(err, user) => {
        if (err) throw err;
        if (!user) 
            return done(null, false, { message: 'Unknown User' });
        
        User.comparePassword(password, user.password, (err, isMatch) => {
            if (err) throw err;
            if (isMatch) 
                return done(null, user);
            else 
                return done(null, false, { message: 'Invalid password' });
        });
    });
}));

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.getUserById(id, (err, user) => {
		done(err, user);
	});
});


module.exports = router;