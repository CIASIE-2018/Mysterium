const { produce } = require('immer'); /* https://github.com/mweststrate/immer */
const errors      = require('./Error.js');

let fs       = require('fs');
let helpers  = require('../helpers');
const config = require('../config/config');

const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(256); 
 
/** PUBLIC FUNCTIONS */

exports.createGame = (max_player = 7, max_turn = 7, difficulte = 0) =>{
    return game = {
        id         : uidgen.generateSync(),
        max_player  : max_player,
        max_turn   : max_turn,
        turn        : 0,
        started    : false,
        difficulte  : difficulte,
        persos     : [],
        lieux       : [],
        armes      : [],
        players     : []
    }
}

/**
 * Ajoute un nouveau joueur au jeu
 * @param {object} baseGame Instance de jeu
 * @param {string} playerId Identifiant du nouveau joueur
 */
exports.join = (baseGame, playerId) => {
    if(baseGame.started)
        throw new errors.GameAlreadyStarted();
    let player = baseGame.players.find(player => player.id === playerId);
    if(player != undefined)
        throw new errors.PlayerAlreadyInGameError();

    if(baseGame.players.length == baseGame.max_player)
        throw new errors.MaxPlayerReachedError();

    return produce(baseGame, draftGame => {
        draftGame.players.push({
            id    : playerId,
            ready : false
        });
    });
}

/**
 * Modifie l'état d'un joueur
 * @param {object}  baseGame Instance de jeu
 * @param {string}  playerId Identifiant du joueur
 * @param {boolean} ready    Etat
 */
exports.setReady = (baseGame, playerId, ready = true) => {
    return produce(baseGame, draftGame => {
        let player = draftGame.players.find(player => player.id === playerId);
        player.ready = ready;
    });
}

/**
 * Initialise une partie
 * @param {object}  baseGame Instance de jeu
 */
exports.init = (baseGame) => {

    let game = {};

    if(allIsReady(baseGame)){
        if(baseGame.players.length >= 3) {
            game = initRoles(baseGame)
            game = generateCards(game);
            game = initScenarios(game);
            game = initVisions(game);
        }else
            throw new errors.NotEnoughPlayerError();
    }else
        throw new errors.NotAllAreReady();

    return produce(game, draftGame => {
        draftGame.started = true;
    });
}


/** PRIVATE FUNCTIONS */


/**
 * Vérifie que tous les joueurs sont prêts
 * @param {object} baseGame Instance de jeu
 */
function allIsReady(baseGame){
    let ready = true;
    baseGame.players.forEach(player => {
        if(player.ready == false){
            ready = false;
        }
    });
    return ready;
}

/**
 * Initialise aléatoirement le rôle de chaque joueur
 * @param {object} baseGame Instance de jeu
 */
function initRoles(baseGame) {
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

/**
 * Génère les cartes persos, lieux et armes pour le jeu en fonction de la difficulté
 * @param {object} baseGame Instance de jeu
 */
function generateCards(baseGame) {
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
        draftGame.persos = helpers.getRandomFiles(config.directory.images + '/personnage', nb_scenarios);
        draftGame.lieux  = helpers.getRandomFiles(config.directory.images + '/lieux'     , nb_scenarios);
        draftGame.armes  = helpers.getRandomFiles(config.directory.images + '/armes'     , nb_scenarios);
    });
}

/**
 * Génère différents scénarios en fonction des cartes du jeu,
 * associe un scénario à chaque medium,
 * défini le scénario final
 * @param {object} baseGame Instance de jeu
 */
function initScenarios(baseGame) {
    let scenarios = [];
    for(let i=0; i<baseGame.persos.length ; i++){
        scenarios.push({
            perso : baseGame.persos[i],
            lieu  : baseGame.lieux[i],
            arme  : baseGame.armes[i]
        });
    }
    scenarios = helpers.shuffle(scenarios);
    let index_scenarios_final = Math.floor(Math.random() * baseGame.mediums.length);

    return produce(baseGame, draftGame => {
        draftGame.mediums.forEach((medium, i) => {
            if(i === index_scenarios_final)
                draftGame.scenario_final = scenarios[i];
            medium.scenario = scenarios[i];
        });
    });
}

/**
 * Initialise la main du fantôme (cartes visions)
 * @param {object} baseGame Instance de jeu
 */
function initVisions(baseGame) {
    let visions    = helpers.getRandomFiles(config.directory.images + '/visions');
    let ghost_hand = visions.slice(visions.length-7,visions.length);
    visions        = visions.slice(0, -7);

    return produce(baseGame, draftGame => {
        draftGame.visions    = visions;
        draftGame.ghost.hand = ghost_hand;
    });
}


/**
 * Verifie si un joueur peut jouer
 * @param {object}  baseGame Instance de jeu
 * @param {string}  playerId Identifiant du joueur
 */
function canPlay(baseGame, playerId){
    
    if(baseGame.ghost.id == playerId){
        //Ghost
        return baseGame.ghost.mediumsHasCards.length != baseGame.mediums.length;
    }else{
        //Medium
        let medium = baseGame.mediums.find(medium => medium.id == playerId);
        return medium.hasPlayed ? false : (baseGame.ghost.mediumsHasCards.find(id => id == medium.id) != undefined);
    }
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
game = a.join(game, 'test3');
game = a.setReady(game, 'test1', true);
game = a.setReady(game, 'test2', true);
game = a.setReady(game, 'test3', true);
// game = a.init_roles(game);
// game = a.generate_cards(game);
// game = a.init_scenarios(game);
// console.log(a.init_visions(game));;

game = a.init(game)

/*console.log(a.canPlay(game, 'test1'));
console.log(a.canPlay(game, 'test2'));
console.log(a.canPlay(game, 'test3'));*/

