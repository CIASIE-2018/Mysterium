const express = require('express');
const router  = express.Router();
const moment = require("moment");
const { createGame, init, join, setReady, mediumHasWin, allMediumHasChooseScenario, chooseScenarioFinal, allMediumFoundScenario, getAllScenario, allIsReady, play, allMediumPlayed, verifyChoicePlayers, getInformations, giveVisionsToMedium } = require('../game/game');
const sharedSession = require("express-socket.io-session");

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
    app.render('partials/playerHand', {infos : getInformations(game, username)}, (err, html) => {
        if(!err) socket.emit('hand', html);
    });
}

function sendPlayerList(app, game, namespace){
    app.render('partials/playerList', {mediums : game.mediums} , (err, html) => {
        if(!err) namespace.emit('player_list', html);
    });
}

function sendBoard(app, game, socket){
    let username = getUsername(socket);
    let infos    = getInformations(game, username);
    if(infos.type == "medium"){
        app.render('partials/playerBoard', {cards : infos.me.cards} , (err, html) => {
            if(!err) socket.emit('board', html);
        });
    }   
    
}

function resetSendMessage(app, namespace){
    namespace.emit('resetSendMessage');
}

function sendMessage(app, messages, namespace, backgroundColor = "green"){
    app.render('partials/message', {info__messages:messages, backgroundColor}, (err, html) => {
        if(!err) namespace.emit('messages', html);
    });
}

function initBoardForFinalScneario(app, scenarios, namespace){
    app.render('partials/finalScenarios', {scenarios}, (err, html) => {
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
                game = giveVisionsToMedium(game, data.receiver, data.cards);
                let mediumSocket = getSocket(gameSocket, data.receiver);
    
                if(mediumSocket != null){
                    sendPlayerHand(app, game, socket);
                    sendPlayerHand(app, game, mediumSocket);
                    sendPlayerList(app, game, gameSocket);
                }
            }
        });
        socket.on('choice_card', cardId => {
            game = play(game, socketUsername, cardId);
            sendPlayerList(app, game, gameSocket);
            sendMessage(app, "vous avez joué", socket);
        
            if(allMediumPlayed(game)){
                game = verifyChoicePlayers(game);

                if(allMediumFoundScenario(game)){
                    let scenarios = getAllScenario(game)
                    initBoardForFinalScneario(app, scenarios, gameSocket)
                }

                for(let id in gameSocket.sockets){
                    sendPlayerHand(app, game, gameSocket.sockets[id]);
                    sendBoard(app, game, gameSocket.sockets[id]);
                }
                sendPlayerList(app, game, gameSocket);

                setTimeout(()=> {
                    resetSendMessage(app, gameSocket);
                }, 500)
            }
        });

        socket.on('choice_final_scenario', scenarioId => {

            let username = getUsername(socket)

            game = chooseScenarioFinal(game, username, scenarioId)

            if(allMediumHasChooseScenario(game)){
                let message = '';
                let bgColor = 'green';
                
                if(mediumHasWin(game))
                    message = "Felicitaion ! Vous avez gagné"
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
        let userIsGhost = game.ghost.username === req.user.username;
        res.render(userIsGhost ? 'gameGhost' : 'gameMedium', {
            infos : getInformations(game, req.user.username),
            messages
        });
    });
    
    return router;    
}