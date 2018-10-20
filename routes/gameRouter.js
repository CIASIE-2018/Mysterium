const express = require('express');
const router  = express.Router();
const moment = require("moment");
const { createGame, init, join, setReady, allIsReady, getInformations } = require('../game/game');


/* Instance du jeu */
let game     = createGame();
let messages = [];

module.exports = function(io){

    /***** WEBSOCKETS SOCKET.IO *****/
    let gameSocket = io.of('/game');
    gameSocket.on('connection', socket => {
        console.log(`[lobby] - connection ${socket.id}`);
    });

    let chatSocket = io.of('/chat');
    chatSocket.on('connection', socket => {

        socket.on('chat message', (data) => {
            //TODO ATTENTION INJECTION CODE !
            let msg = moment().format('HH:mm') + " <span class='pseudo'>" + data.author +"</span>  : " + data.msg_content;
            messages.push(msg);
            chatSocket.emit('chat message',msg);
        });
    
        socket.on('disconnect',() => {
            socket.disconnect(true);
        });
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
            players : game.players,
            messages
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
            infos : getInformations(game, req.user.username),
            messages
        });
    });
    
    return router;    
}