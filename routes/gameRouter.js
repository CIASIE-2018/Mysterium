const express = require('express');
const router  = express.Router();
const moment = require("moment");
const { createGame, init, join, setReady, allIsReady, play, getInformations, giveVisionsToMedium } = require('../game/game');
const sharedSession = require("express-socket.io-session");


function getSocket(namespace, username){
    let socket = null;
    for(let socketId in namespace.sockets){
        let currentSocket = namespace.sockets[socketId];

        if(currentSocket.handshake                  != undefined
        && currentSocket.handshake.session          != undefined
        && currentSocket.handshake.session.username != undefined
        && currentSocket.handshake.session.username == username){

            socket = currentSocket;
            break;
        }
    }
    return socket;
}

function createNamespaceWithExpressSession(io, namespace, session){
    return io.of(namespace).use(sharedSession(session, {
        autoSave: true
    }));
}

/* Instance du jeu */
let game     = createGame();
let messages = [];


module.exports = function(app, io, session){

    /***** WEBSOCKETS SOCKET.IO *****/
    let gameSocket = createNamespaceWithExpressSession(io, '/game', session);
   
    gameSocket.on('connection', socket => {
        let socketUsername = socket.handshake.session.username;
        
        socket.on('send_card_to_medium', data => {
            if(socketUsername === game.ghost.username){
                game = giveVisionsToMedium(game, data.receiver, data.cards);
                let mediumSocket = getSocket(gameSocket, data.receiver);
    
                if(mediumSocket != null){
                    mediumSocket.emit('reload');
                    socket.emit('reload');
                }
            }
        });
        socket.on('choice_card', cardId => {
            game = play(game, socketUsername, cardId);
            app.render('partials/playerList', {mediums : game.mediums} , (err, html) => {
                if(!err) gameSocket.emit('player_list', html);
            });
            socket.emit('message', {
                type    : 'success',
                content : 'Vous venez de jouer votre tour...'
            });
        });

        
    });

    let chatSocket = createNamespaceWithExpressSession(io, '/chat', session);

    chatSocket.on('connection', socket => {

        socket.on('chat message', message => {
            //TODO ATTENTION INJECTION CODE !
            let msg = moment().format('HH:mm') + ` <span class='pseudo'>${socket.handshake.session.username}</span>  : ${message}`;
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