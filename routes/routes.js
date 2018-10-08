const express = require('express');
const router  = express.Router();
const { createGame, init, join, setReady, allIsReady } = require('../game/game');



/* Instance du jeu */
let game = createGame();


/******* Routes *******/

router.get('/', (req, res) => {
    res.render('home');
});

router.post('/', (req, res) => {
    let player_id = req.body.id;
    try{
        game = join(game, player_id); 
        req.app.io.sockets.emit('reload');
        res.redirect('/salon');
    }catch(e){
        res.redirect('/erreur');
    }
});

router.get('/salon', (req, res) => {
    res.render('salon', {
        players: game.players
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
        type : 'medium'
    });
});

module.exports = router;