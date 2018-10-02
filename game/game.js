const { produce } = require('immer'); /* https://github.com/mweststrate/immer */
const errors      = require('./Error.js');

exports.join = (baseGame, playerId) => {
    let player = baseGame.players.find(player => player.id === playerId);
    if(player != undefined)
        throw new errors.PlayerAlreadyInGameError();
    
    if(baseGame.isFull || baseGame.started)
        throw new errors.MaxPlayerReachedError();
    
    return produce(baseGame, draftGame => {
        draftGame.players.push({
            id    : playerId,
            ready : false
        });
    });
}

exports.setReady = (baseGame, playerId, ready = true) => {
    return produce(baseGame, draftGame => {
        let player = draftGame.players.find(player => player.id === playerId);
        player.ready = ready;
    });
}

exports.init_roles = baseGame => {
    if(baseGame.started)
        throw new errors.GameAlreadyStarted();

    if(baseGame.players.length < 2)
        throw new errors.NotEnoughPlayerError();

    let aleaGhost = Math.floor(Math.random() * baseGame.players.length);

    let players   = baseGame.players.map((player, i) => {
        if(aleaGhost === i){
            player.role            = 'ghost';
            player.hand            = [];
            player.mediumsHasCards = [];
        }else{
            player.role            = 'medium';
            player.state           = 0;
            player.visions         = [];
            player.hasPlayed       = false;
        }
    });

    return produce(baseGame, draftGame => {
        draftGame.players = players;
    });
}