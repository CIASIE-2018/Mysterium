const express = require('express');
const router  = express.Router();
const { createGame, init, join, setReady, allIsReady, getPlayerState } = require('../game/game');



/* Instance du jeu */
let game = createGame();


/******* Routes *******/

router.get('/', (req, res) => {
    res.render('home');
});

router.post('/', (req, res) => {
    let player_name = req.body.name;
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
    let player = game.players.find(player => player.id === req.session.player.id);

    if(player != undefined){
        let state_player = getPlayerState(game,  player.id)
        res.render('game', {
            state_player
        });
    }else
        res.redirect('/erreur');

});

module.exports = router;