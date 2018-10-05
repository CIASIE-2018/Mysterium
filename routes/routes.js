const { createGame, init, join, setReady } = require('../game/game');

let game = createGame();

const express = require('express');
const router  = express.Router();

router.get('/', (req, res) => {
    res.render('home');
    
});

router.post('/', (req, res) => {
    let player_id = req.body.id;
    game = join(game, player_id); 
    req.app.io.sockets.emit('new_player', player_id);
    res.redirect('/salon');
})

router.get('/salon', (req, res) => {
    res.render('salon', {
        players: game.players
    });
});

router.post('/salon', (req, res) => {
    game = setReady(game, req.body.id)
    console.log(game);
    
    res.redirect('/salon');
});

router.get('/game', (req, res) => {
    res.render('game', {
        type : 'medium'
    });
});

module.exports = router;