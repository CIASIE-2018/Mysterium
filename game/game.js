const { produce } = require('immer'); /* https://github.com/mweststrate/immer */
const errors      = require('./Error.js');

let fs       = require('fs');
let helpers  = require('../helpers');
const config = require('../config/config');

const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(256); 
 
/** PUBLIC FUNCTIONS */

function createGame(max_player = 7, max_turn = 7, difficulte = 0) {
    return {
        id          : uidgen.generateSync(),
        max_player  : max_player,
        max_turn    : max_turn,
        turn        : 0,
        started     : false,
        difficulte  : difficulte,
        persos      : [],
        lieux       : [],
        armes       : [],
        players     : []
    }
}

/**
 * Ajoute un nouveau joueur au jeu
 * @param {object} baseGame Instance de jeu
 * @param {string} playerName Identifiant du nouveau joueur
 */

function join(baseGame, playerName) {
    console.log(playerName);
    
    if(baseGame.started)
        throw new errors.GameAlreadyStarted();

    let player = baseGame.players.find(player => player.name === playerName);
    if(player != undefined)
        throw new errors.PlayerAlreadyInGameError();

    if(baseGame.players.length == baseGame.max_player)
        throw new errors.MaxPlayerReachedError();

    return produce(baseGame, draftGame => {
        draftGame.players.push({
            id    : uidgen.generateSync(),
            name  : playerName,
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
function setReady(baseGame, playerId, ready = true) {
    return produce(baseGame, draftGame => {
        let player = draftGame.players.find(player => player.id === playerId);
        player.ready = ready;
    });
}

/**
 * Initialise une partie
 * @param {object}  baseGame Instance de jeu
 */
function init(baseGame) {
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

/**
 * Vérifie que tous les joueurs sont prêts
 * @param {object} baseGame Instance de jeu
 */
function allIsReady(baseGame) {
    let ready = true;
    baseGame.players.forEach(player => {
        if(player.ready == false)
            ready = false;
    });
    return ready;
}

/**
 * Le joueur joue en choisissant une carte du plateau
 * @param {object} baseGame 
 * @param {string} playerId 
 * @param {string} chosenCard 
 */
function play(baseGame, playerId, chosenCard){

    let canChoose = false;

    //verifier que le personnage n'est pas le fantome
    if(baseGame.ghost.id !== playerId){
        let player = baseGame.mediums.find(player => player.id === playerId);
        let state  = player.state;
    
        //verifier que le personnage peut jouer
        if(!player.hasPlayed){
            let type_carte = state == 0 ? 'persos' : (state == 1 ? 'lieux' : 'armes');

            //verifier l'etat d'avancement du joueur sur le plateau
            if(baseGame[type_carte].find(perso => perso === chosenCard))
                canChoose = true;
            else
                throw new errors.ChosenCardError(`La carte ${type_carte} choisis n'est pas sur le plateau`);
        }
    //si le joueur est un fantome
    }else{
        throw new Error('Le joueur est le fantome')
    }

    return produce(baseGame, draftGame => {
        //si la carte est presente sur le plateau au bon stade du joueur et que le joueur peut jouer
        if(canChoose){
            let player = draftGame.mediums.find(player => player.id === playerId);
            player.chosenCard = chosenCard;
            player.hasPlayed = true;
        }else{
            throw new Error('Le joueur ne peux pas choisir de cartes')
        }
    });
}

/**
 * Renvoie l'état du joueur 
 * @param {object} baseGame Instance de jeu
 * @param {string} playerId Identifiant du nouveau joueur
 */
function getPlayerState(baseGame, playerId) {
    
    //fantome
    let player = baseGame.ghost
     //medium
    if(player.id !== playerId)
        player = baseGame.mediums.find(player => player.id == playerId)
     let state  = {
        turn   : baseGame.turn,
        id     : player.id,
        persos : baseGame.persos,
        lieux  : baseGame.lieux,
        armes  : baseGame.armes,
    };
     //verifie si le joueur existe
    if(baseGame.ghost.id !== playerId && baseGame.mediums.find(player => player.id === playerId ) === undefined)
        throw new errors.PlayerDoesNotExistError();
     if(player === baseGame.ghost){
            state.hand             = player.hand,
            state.mediumsHasCards  = player.mediumsHasCards,
            state.otherMediums     = baseGame.mediums
    }else{
        let players      = baseGame.mediums.filter(player => player.id !== playerId);
        let otherMediums = [];
         players.forEach(player => {
            otherMediums.push({
                id        : player.id,
                state     : player.state,
                hasPlayed : player.hasPlayed
            })
        })
        
        state.state        = player.state,
        state.visions      = player.visions,
        state.hasPlayed    = player.hasPlayed,
        state.otherMediums = otherMediums,
    }
     return state;
}

/**
 * Retire de la main du fantome les cartes 'cards' pour les donner au joueur
 * qui a pour identifiant 'playerId'.
 * La main du fantome est automatiquement complete par de nouvelles cartes
 * visions (il doit toujours avoir 7 cartes visions dans sa main)
 * @param {object} baseGame Instance de jeu
 * @param {string} playerId Identifiant du joueur qui recoit les cartes visions
 * @param {array} cards     Cartes visions a donner
 */
function giveVisionsToMedium(baseGame, playerId, cards){
    if(canPlay(baseGame,baseGame.ghost.id)){
        if(!baseGame.ghost.mediumsHasCards.includes(playerId)){
            if(helpers.include(baseGame.ghost.hand, cards)){

                return produce(baseGame, draftGame => {
                    let ghost  = draftGame.ghost;
                    let medium = draftGame.mediums.find(medium => medium.id == playerId);
    
                    let visions            = draftGame.visions;
                    let newVisionsForGhost = visions.slice(visions.length-cards.length,visions.length);
                    draftGame.visions      = visions.slice(0, -cards.length);

                    //Retire les cartes a donner de la main du fantome
                    ghost.hand  = ghost.hand.filter(card => !cards.includes(card));
                    //Complete la main du fantome avec le nombre de cartes manquantes
                    ghost.hand  = ghost.hand.concat(newVisionsForGhost);
                    
                    medium.visions = medium.visions.concat(cards);
                    ghost.mediumsHasCards.push(playerId);
                });
            }else
                throw new Error('Le fantome n\'a pas les cartes visions');
        }else
            throw new Error('Le fantome a deja donne des cartes a ce joueur');
    }else
        throw new Error('Le fantome ne peut pas jouer maintenant');
}

module.exports = {
    createGame,
    join,
    setReady,
    init,
    allIsReady,
    play,
    giveVisionsToMedium,
    getPlayerState
}

/** PRIVATE FUNCTIONS */

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