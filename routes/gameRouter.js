const express = require('express');
const router  = express.Router();
const moment = require("moment");

const { createGame, getInformationsMediums, init, join, setReady, mediumHasWin, allMediumHasChooseScenario, chooseScenarioFinal, allMediumFoundScenario, getAllScenario, allIsReady, play, allMediumPlayed, verifyChoicePlayers, getInformations, giveVisionsToMedium } = require('../game/game');

const sharedSession = require("express-socket.io-session");
const helpers       = require('../helpers');

function getUsername(socket){
    let username = undefined;
    if(socket.handshake                  != undefined
    && socket.handshake.session          != undefined
    && socket.handshake.session.username != undefined){
        username = socket.handshake.session.username;
    }
    return username;
}

function getSocket(namespace, username){
    let socket = null;
    for(let socketId in namespace.sockets){

        let currentSocket  = namespace.sockets[socketId];
        let usernameSocket = getUsername(currentSocket);

        if(usernameSocket == username){
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

function sendPlayerHand(app, game, socket){
    let username = getUsername(socket);
    if(username != undefined){
        app.render('partials/playerHand', {infos : getInformations(game, username)}, (err, html) => {
            if(!err) socket.emit('hand', html);
        });
    }
    
}

function sendPlayerList(app, game, namespace){
    app.render('partials/playerList', {mediums : game.mediums} , (err, html) => {
        if(!err) namespace.emit('player_list', html);
    });
}

function sendBoard(app, game, socket){
    let username = getUsername(socket);
    if(username != undefined){
        let infos = getInformations(game, username);
        if(infos.type == "medium"){
            app.render('partials/playerBoard', {cards : infos.me.cards} , (err, html) => {
                if(!err) socket.emit('board', html);
            });
        }   
    }
}

function sendArrayMediums(app, game, socket){
    let mediums = getInformationsMediums(game);
    socket.emit('mediums', mediums);
}

00
function sendMessage(app, message, socket){
    app.render('partials/message', {message}, (err, html) => {
        if(!err) socket.emit('messages', html);
    });
}

function initBoardForFinalScenario(app, game, namespace){
    let scenarios     = getAllScenario(game)
    let ghostUsername = game.ghost.username;
       
    app.render('partials/finalScenarios', {scenarios, ghostUsername}, (err, html) => {
        if(!err) namespace.emit('finalScenario', html);
    });
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
                try{
                    if(allMediumFoundScenario(game)){
                        game = giveVisionsToMedium(game, data.receiver, data.cards, true);  
                        game.mediums.forEach(medium => {
                            let mediumSocket = getSocket(gameSocket, medium.username);
                            
                            if(mediumSocket != null){
                                sendPlayerHand(app, game, socket);
                                sendPlayerHand(app, game, mediumSocket);
                                sendPlayerList(app, game, gameSocket);
                            }
                        });
                    }else{
                        game = giveVisionsToMedium(game, data.receiver, data.cards);
                        let mediumSocket = getSocket(gameSocket, data.receiver);

                        if(mediumSocket != null){
                            sendPlayerHand(app, game, socket);
                            sendPlayerHand(app, game, mediumSocket);
                            sendPlayerList(app, game, gameSocket);
                        }
                    }
                }catch(err){
                    sendMessage(app, {type:'error', content: err.message}, socket);
                }
                
            }
        });
        socket.on('choice_card', cardId => {
            try{
                game = play(game, socketUsername, cardId);
                sendMessage(app, {type:"success", content:"Vous avez joué."}, socket);
            
                if(allMediumPlayed(game)){
                    game = verifyChoicePlayers(game);
                  
                    if(allMediumFoundScenario(game)){
                        initBoardForFinalScenario(app, game, gameSocket)
                    }
    
                    for(let id in gameSocket.sockets){
                        if(getUsername(gameSocket.sockets[id]) === game.ghost.username){
                            sendArrayMediums(app, game, gameSocket.sockets[id]);
                        }else{
                            sendBoard(app, game, gameSocket.sockets[id]); 
                        }
                        sendPlayerHand(app, game, gameSocket.sockets[id]);
                    }
                    sendMessage(app, {type:"info", content:`Tour n°${game.turn}`}, gameSocket);
                }
                sendPlayerList(app, game, gameSocket);
            }catch(err){
                sendMessage(app, {type:'error', content: err.message}, socket);
            }
        });

        socket.on('choice_final_scenario', scenarioId => {

            let username = getUsername(socket)

            game = chooseScenarioFinal(game, username, scenarioId)
            sendMessage(app, "Vous avez fait votre choix!", socket)

            if(allMediumHasChooseScenario(game)){
                let message = '';
                let bgColor = 'green';

                if(mediumHasWin(game))
                    message = "Felicitation ! Vous avez gagné"
                else{
                    message = "Dommage ! Vous êtes nul"
                    bgColor = 'red';
                }

                sendMessage(app, message, gameSocket, bgColor)
            }
        })

        
    });

    let chatSocket = createNamespaceWithExpressSession(io, '/chat', session);

    chatSocket.on('connection', socket => {

        socket.on('chat message', message => {
            message = helpers.escapeHtml(message);
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
        let userIsGhost = game.ghost.username === req.user.username;
        res.render(userIsGhost ? 'gameGhost' : 'gameMedium', {
            infos : getInformations(game, req.user.username),
            messages
        });
    });

    router.post('/ajax/mediums', (req, res) => {
        try{
            res.json(getInformationsMediums(game));
        }catch(err){
            res.json(null);
        }
    });
    
    return router;    
}