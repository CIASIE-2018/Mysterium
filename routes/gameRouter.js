const express = require('express');
const router  = express.Router();
const { createGame, init, join, setReady, allIsReady, getInformations } = require('../game/game');


/* Instance du jeu */
let game = createGame();

module.exports = function(io){

    /***** WEBSOCKETS SOCKET.IO *****/
    let gameSocket = io.of('/game');
    gameSocket.on('connection', socket => {
        console.log(`[lobby] - connection ${socket.id}`);
    });

    let chatSocket = io.of('/chat');
    chatSocket.on('connection', socket => {
        console.log(`[chat] - connection ${socket.id}`);
    });
    /********************************/


    router.get('/', (req, res) => {
        try{
            game = join(game, req.user.username);
            gameSocket.emit('reload');
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
            if(game.players.length >= 3 && allIsReady(game)){
                game = init(game);
                gameSocket.emit('start');
                res.redirect('/game');
            }else{
                gameSocket.emit('reload');
                res.redirect('/salon');
            }
        }
    });
    
    router.get('/game', (req, res) => {
        res.render('game', {
            infos : getInformations(game, req.user.username)
        });
    });
    
    return router;    
}