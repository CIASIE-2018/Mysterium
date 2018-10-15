const express = require('express');
const router  = express.Router();
const moment = require("moment");
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
        socket.on('chat message', (data) => {
            let msg_time = moment().format('HH:mm:ss');
            
            let msg = {
                id      : msg_time,
                content : moment(msg_time,moment.HTML5_FMT.TIME).format('HH:mm')+"  <span class='pseudo'>"+data.author +"</span>  :   "+ data.msg_content
            }
            io.emit('chat message',msg.content);
        });
    
        /** socket.on('nouvel utilisateur', (pseudo) => {
        
            socket.emit('bienvenue', "Vous entrez dans le salon de chat sous le nom <span class='pseudo'>" + usr.name + "</span>");
            socket.broadcast.emit('bienvenue', "<span class='pseudo'>"+usr.name +"</span> entre dans le salon de chat")
        });*/
    
        socket.on('disconnect',() => {
            console.log("----------------------------------------");
            socket.disconnect(true);
        })
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
            gameSocket.emit('reload');
        }
            
        res.redirect('/salon');
    });
    
    router.get('/game', (req, res) => {
        res.render('game', {
            infos : getInformations(game,  req.session.player.id)
        });
    });
    
    return router;    
}