const express = require('express');
const router  = express.Router();
const { createGame, init, join, setReady, allIsReady, getInformations } = require('../game/game');


/* Instance du jeu */
let game = createGame();

router.get('/', (req, res) => {
    try{
        game = join(game, req.user.username);
        res.redirect('/salon');
    }catch(e){
        res.redirect('/erreur');
    }
});

router.get('/salon', (req, res) => {
    res.render('salon', {
        players : game.players
    });
});

router.post('/salon', (req, res) => {
    let user = req.user;

    if(req.body.username == user.username){
        game = setReady(game, user.username);
    }
        
    res.redirect('/salon');
});

router.get('/game', (req, res) => {
    res.render('game', {
        infos : getInformations(game,  req.session.player.id)
    });
});

module.exports = router;