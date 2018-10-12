const express = require('express');
const router  = express.Router();
const { createGame, init, join, setReady, allIsReady, getInformations } = require('../game/game');


const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../models/user');


/* Instance du jeu */
let game = createGame();


/******* User Routes *******/

router.get('/register', function (req, res) {
	res.render('register');
});

router.post('/register', function (req, res) {
	let name = req.body.name;
	let email = req.body.email;
	let username = req.body.username;
	let password = req.body.password;
	let password2 = req.body.password2;

	// Validation
	req.checkBody('name', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('username', 'Username is required').notEmpty();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

	let errors = req.validationErrors();

	if (errors) {
		res.render('register', {
			errors: errors
		});
	}
	else {
		//checking for email and username are already taken
		User.findOne({ username: { 
			"$regex": "^" + username + "\\b", "$options": "i"
	}}, function (err, user) {
			User.findOne({ email: { 
				"$regex": "^" + email + "\\b", "$options": "i"
		}}, function (err, mail) {
				if (user || mail) {
					res.render('register', {
						user: user,
						mail: mail
					});
				}
				else {
					let newUser = new User({
						name: name,
						email: email,
						username: username,
						password: password
					});
					User.createUser(newUser, function (err, user) {
						if (err) throw err;
					});
         	req.flash('success_msg', 'You are registered and can now login');
					res.redirect('/login');
				}
			});
		});
	}
});

router.get('/login', function (req, res) {
	res.render('login');
});

router.post('/login',passport.authenticate('local', { successRedirect: '/profile', failureRedirect: '/login', failureFlash: true }),function (req, res) {
	res.redirect('/profile');
});

router.get('/profile', ensureAuthenticated, function(req, res){
	
	res.render('profile', {
		user : req.user
	});
});

router.get('/logout', function (req, res) {
	req.logout();

	req.flash('success_msg', 'You are logged out');

	res.redirect('/login');
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/login');
	}
}

passport.use(new LocalStrategy(function (username, password, done) {
    User.getUserByUsername(username, function (err, user) {
        if (err) throw err;
        if (!user) {
            return done(null, false, { message: 'Unknown User' });
        }

        User.comparePassword(password, user.password, function (err, isMatch) {
            if (err) throw err;
            if (isMatch) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Invalid password' });
            }
        });
    });
}));

passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	User.getUserById(id, function (err, user) {
		done(err, user);
	});
});
 /**********************************/

router.get('/', (req, res) => {
    res.render('home');
});

router.post('/', (req, res) => {
    let player_name = req.body.name;
    console.log(player_name);
    
    try{
        game = join(game, player_name);
        
        let player = game.players.find(player => player.name === player_name);
        req.session.player = {
            id   : player.id,
            name : player.name
        };
        req.app.io.sockets.emit('reload');
        res.redirect('/salon');
    }catch(e){
        res.redirect('/erreur');
    }
});

router.get('/salon', (req, res) => {
    let player = req.session.player;
    
    res.render('salon', {
        players : game.players,
        me      : player.id
    });
});

router.post('/salon', (req, res) => {
    let player = game.players.find(player => player.id === req.body.id);
    if(player != undefined){
        game = setReady(game, player.id, !player.ready);
        if(game.players.length >= 3 && allIsReady(game)){
            game = init(game);
            req.app.io.sockets.emit('allIsReady');
        }else{
            req.app.io.sockets.emit('reload');
        }
    }
    res.redirect('/salon');
});

router.get('/game', (req, res) => {
    res.render('game', {
        infos : getInformations(game,  req.session.player.id)
    });
});

module.exports = router;