const { produce } = require('immer'); /* https://github.com/mweststrate/immer */
const errors      = require('./Error.js');

let fs       = require('fs');
let helpers  = require('../helpers');
const config = require('../config/config');

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

    return produce(baseGame, draftGame => {
        draftGame.ghost   = null;
        draftGame.mediums = [];

        draftGame.players.forEach((player, i) => {
            if(aleaGhost === i){
                draftGame.ghost = {
                    id              : player.id,
                    hand            : [],
                    mediumsHasCards : []
                };
            }else{
                draftGame.mediums.push({
                    id        : player.id,
                    state     : 0,
                    visions   : [],
                    hasPlayed : false
                });
            }
        });
        delete draftGame.players;
    });
}

exports.generate_cards = baseGame => {
    let nb_scenarios = baseGame.mediums.length;
    switch(baseGame.difficulte){
        case 0 : 
            nb_scenarios+=2;
        break;
        case 1 :
            nb_scenarios+=3;
        break;
    }
    return produce(baseGame, draftGame => {
        draftGame.persos = getRandomFiles(config.directory.images + '/personnage', nb_scenarios);
        draftGame.lieux  = getRandomFiles(config.directory.images + '/lieux'     , nb_scenarios);
        draftGame.armes  = getRandomFiles(config.directory.images + '/armes'     , nb_scenarios);
    });
}

function getRandomFiles(path, nb_files){
    let files  = fs.readdirSync(path);
    files      = helpers.shuffle(files).slice(0, nb_files);
    return files;
}


let a = require('./game.js');

let game = {
    id         : 1233,
    max_player : 7,
    max_turn   : 7,
    turn       : 0,
    started    : false,
    difficulte : 0,
    persos     : [],
    lieux      : [],
    armes      : [],
    players    : []
}

game = a.join(game, 'test1');
game = a.join(game, 'test2');
game = a.setReady(game, 'test1', true);
game = a.setReady(game, 'test2', true);
game = a.init_roles(game);
game = a.generate_cards(game);
console.log(game);