const { produce } = require('immer'); /* https://github.com/mweststrate/immer */
const errors      = require('./Error.js');
const fs          = require('fs');
const helpers     = require('../helpers');
const config      = require('../config/config');

const UIDGenerator = require('uid-generator');
const uidgen = new UIDGenerator(256); 

const PERSO = 0;
const LIEU  = 1;
const ARME  = 2;
const FINAL = 3;
 
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
 * @param {string} username Identifiant du nouveau joueur
 */

function join(baseGame, username) {
    
    if(baseGame.started)
        throw new errors.GameAlreadyStarted();

    let player = baseGame.players.find(player => player.username === username);
    if(player != undefined)
        throw new errors.PlayerAlreadyInGameError();

    if(baseGame.players.length == baseGame.max_player)
        throw new errors.MaxPlayerReachedError();

    return produce(baseGame, draftGame => {
        draftGame.players.push({
            id        : uidgen.generateSync(),
            username  : username,
            initial   : username.slice(0,2),
            ready     : false
        });
    });
}

/**
 * Modifie l'état d'un joueur
 * @param {object}  baseGame Instance de jeu
 * @param {string}  playerId Identifiant du joueur
 * @param {boolean} ready    Etat
 */
function setReady(baseGame, username) {
    return produce(baseGame, draftGame => {
        let player   = draftGame.players.find(player => player.username === username);
        player.ready = !player.ready;
    });
}

/**
 * Initialise une partie
 * @param {object}  baseGame Instance de jeu
 */
function init(baseGame) {
    let game = {};
    if(!allIsReady(baseGame))
        throw new errors.NotAllAreReady();
    
    if(baseGame.players.length < 3) 
        throw new errors.NotEnoughPlayerError();

    game = initRoles(baseGame)
    game = generateCards(game);
    game = initScenarios(game);
    game = initVisions(game);  

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
function play(baseGame, username, chosenCard){

    let canChoose = false;

    //verifier que le personnage n'est pas le fantome
    if(baseGame.ghost.username !== username){
        let player = baseGame.mediums.find(player => player.username === username);
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
            let player = draftGame.mediums.find(player => player.username === username);
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
function getInformations(baseGame, username) {

    let type   = getPlayerType(baseGame, username);
    let player = type == 'ghost' ? baseGame.ghost : baseGame.mediums.find(player => player.username == username);
    
    if(player == null)
        throw new errors.PlayerAlreadyInGameError();

    let infosPlayer = {
        type     : type,
        username : player.username,
        turn     : baseGame.turn
    };

    if(type == 'ghost')
        infosPlayer.hand = baseGame.ghost.hand;

    infosPlayer.mediums = baseGame.mediums.map(medium => {
        let state = {
            state            : medium.state,
            username         : medium.username,
            initial          : medium.initial,
            hasReceivedCards : medium.hasReceivedCards,
            hasPlayed        : medium.hasPlayed,
            visions          : medium.visions
        };
        state.cards = baseGame[medium.state == 0 ? 'persos' : (medium.state == 1 ? 'lieux' : 'armes')];
        if(type == 'ghost')
            state.card  = medium.scenario[medium.state == 0 ? 'perso' : (medium.state == 1 ? 'lieu' : 'arme')];
        
        if(medium.username == infosPlayer.username)
            infosPlayer.me = state;

        return state;
    });

    return infosPlayer;
}

/**
 * Renvoie les informations des mediums 
 * (se base sur l'objet que l'on avait dans la vue du fantome)
 * @param {object} baseGame Instance de jeu
 */
function getInformationsMediums(baseGame){
    let mediums = {};
    
    baseGame.mediums.forEach((medium) => {
        let state = medium.state == 0 ? 'perso' : (medium.state == 1 ? 'lieu' : 'arme');
        let state2 = medium.state == 0 ? 'persos' : (medium.state == 1 ? 'lieux' : 'armes');
        
         mediums[medium.username] = {
            visions : medium.visions,
            cards   : baseGame[state2],
            card    : medium.scenario[state]
        }
    });
     return mediums;
}

/**
 * Retire de la main du fantome les cartes 'cards' pour les donner au joueur
 * qui a pour identifiant 'playerId'.
 * La main du fantome est automatiquement complete par de nouvelles cartes
 * visions (il doit toujours avoir 7 cartes visions dans sa main)
 * @param {object} baseGame Instance de jeu
 * @param {string} username Identifiant du joueur qui recoit les cartes visions
 * @param {array} cards     Cartes visions a donner
 * @param {bool} allMediums True si on veux donner a tous les mediums
 */
function giveVisionsToMedium(baseGame, username, cards, allMediums = false){
        
    if(!helpers.include(baseGame.ghost.hand, cards))
        throw new Error('Vous n\'avez pas ces cartes visions dans votre main.'); 

    return produce(baseGame, draftGame => {
        let ghost  = draftGame.ghost;

        if(allMediums){
            let mediums = draftGame.mediums;
    
            let visions            = draftGame.visions;
            let newVisionsForGhost = visions.slice(visions.length-cards.length,visions.length);
            draftGame.visions      = visions.slice(0, -cards.length);
    
            //Retire les cartes a donner de la main du fantome
            ghost.hand  = ghost.hand.filter(card => !cards.includes(card));
            //Complete la main du fantome avec le nombre de cartes manquantes
            ghost.hand  = ghost.hand.concat(newVisionsForGhost);
            
            mediums.forEach(medium => {
                medium.visions = medium.visions.concat(cards);
                medium.hasReceivedCards = true;
                ghost.mediumsHasCards.push(medium.username);
            })
            
        }else{
            if(!canPlay(baseGame,baseGame.ghost.username))
                throw new Error('Vous ne pouvez pas jouer pour le moment. Les mediums doivent choisir une carte.');

            if(baseGame.ghost.mediumsHasCards.includes(username))
                throw new Error('Vous avez déjà donné des cartes à ce medium.');
            
            let medium = draftGame.mediums.find(medium => medium.username == username);
    
            let visions            = draftGame.visions;
            let newVisionsForGhost = visions.slice(visions.length-cards.length,visions.length);
            draftGame.visions      = visions.slice(0, -cards.length);
    
            //Retire les cartes a donner de la main du fantome
            ghost.hand  = ghost.hand.filter(card => !cards.includes(card));
            //Complete la main du fantome avec le nombre de cartes manquantes
            ghost.hand  = ghost.hand.concat(newVisionsForGhost);
            
            medium.visions = medium.visions.concat(cards);
            medium.hasReceivedCards = true;
            ghost.mediumsHasCards.push(username);
        }
    }); 
}

/**
 * Verifie si les joueurs ont choisis la bonne carte sur 
 * le plateau en fonction de leur scenario
 * @param {object} baseGame Instance de jeu
*/
function verifyChoicePlayers(baseGame) {

    if(!allMediumPlayed(baseGame))
        throw new Error("Tous les joueurs n'ont pas joués")


    let hasGoodCards = [];

    baseGame.mediums.map(medium => {
        let state = medium.state == 0 ? 'perso' : (medium.state == 1 ? 'lieu' : 'arme');
        
        if(medium.chosenCard === medium.scenario[state])
            hasGoodCards.push(medium.username);
    });
    
    return produce(baseGame, draftGame => {
        draftGame.mediums.map(medium => {
            if(hasGoodCards.includes(medium.username)){
                medium.state   += 1;
                medium.visions  = [];
            }
            
            medium.chosenCard       = '';
            medium.hasPlayed        = false;
            medium.hasReceivedCards = false;
        })

        if(baseGame.turn < baseGame.max_turn){
            draftGame.turn += 1;
            draftGame.ghost.mediumsHasCards = [];
        }
    });
}

/**
 * Retourne True si les médiums ont tous joué
 * @param {object} baseGame 
 */
function allMediumPlayed(baseGame){
    return baseGame.mediums.every(medium => medium.hasPlayed == true);
}

/**
 * Retourne True si les médiums ont tous trouvé leur scénario
 * @param {object} baseGame 
 */
function allMediumFoundScenario(baseGame){
    return baseGame.mediums.every(medium => medium.state == 3);
}

/**
 * Retourne tous les scénarios des médiums
 * @param {object} baseGame Instance de jeu
 */
function getAllScenario(baseGame){
    let scenario = [];
    baseGame.mediums.forEach(medium => {
        scenario.push(medium.scenario);
    })

    return scenario;
}

/**
 * Permet à un joueur de choisir un scénario final
 * @param {object} baseGame 
 * @param {string} username 
 * @param {number} scenario_number 
 */
function chooseScenarioFinal(baseGame, username, scenario_number){

    let scenarios = getAllScenario(baseGame);
    if(scenario_number >= scenarios.length )
        throw new Error('Le scenario ne peut pas etre choisis')
    
    return produce(baseGame, draftGame => {
        let medium = draftGame.mediums.find(medium => medium.username == username);
        medium.scenarioFinalChoose = scenarios[scenario_number];
    });
}

/**
 * Retourne True si tous les médiums ont choisi un scénario final
 * @param {object} baseGame 
 */
function allMediumHasChooseScenario(baseGame){
    return baseGame.mediums.every(medium => medium.scenarioFinalChoose !== undefined);
}

/**
 * Indique si les mediums ont choisis le bon scenario final
 * @param {object} baseGame 
 */
function mediumHasWin(baseGame){
    if(allMediumHasChooseScenario(baseGame)){
        let scenario_gagnant = baseGame.scenario_final;
        
        let count = 0;
        baseGame.mediums.forEach(medium => {
            let scenario = medium.scenarioFinalChoose;
            if(scenario.perso == scenario_gagnant.perso && scenario.lieu == scenario_gagnant.lieu && scenario.arme == scenario_gagnant.arme)
                count++;
        })

        return count > Math.floor(baseGame.mediums.length / 2);
    }
}

let function_exports = {
    allIsReady,
    allMediumFoundScenario,
    allMediumHasChooseScenario,
    allMediumPlayed,
    chooseScenarioFinal,
    createGame,
    getAllScenario,
    getInformations,
    getInformationsMediums,
    giveVisionsToMedium,
    init,
    join,
    mediumHasWin,
    play,
    setReady,
    verifyChoicePlayers,
}

if(config.app.mode == 'dev'){
    function_exports.getPlayerType = getPlayerType
    function_exports.canPlay = canPlay
    function_exports.getCards = getCards
    function_exports.getInformations = getInformations
    function_exports.isScenarioFound = getInformations
}

module.exports = function_exports

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
                    username        : player.username,
                    initial         : player.initial,
                    hand            : [],
                    mediumsHasCards : []
                };
            }else{
                draftGame.mediums.push({
                    username  : player.username,
                    initial   : player.initial,
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
        draftGame.persos = getCards("persos", nb_scenarios);
        draftGame.lieux  = getCards("lieux", nb_scenarios);
        draftGame.armes  = getCards("armes", nb_scenarios);
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
    let visions    = getCards("visions");
    let ghost_hand = visions.slice(visions.length-7,visions.length);
    visions        = visions.slice(0, -7);

    return produce(baseGame, draftGame => {
        draftGame.visions    = visions;
        draftGame.ghost.hand = ghost_hand;
    });
}

/**
 * Retourne le type d'un joueur
 * @param {object} baseGame 
 * @param {string} username 
 */
function getPlayerType(baseGame, username){
    let medium = baseGame.mediums.find(medium => medium.username == username);
    
    if(typeof medium !== 'object' && baseGame.ghost.username !== username)
        throw new Error('Le type du joueur ne peux pas etre retourné')

    return baseGame.ghost.username === username ? 'ghost' : 'medium';
}

/**
 * Verifie si un joueur peut jouer
 * @param {object}  baseGame Instance de jeu
 * @param {string}  playerId Identifiant du joueur
 */
function canPlay(baseGame, username){
    
    if(baseGame.ghost.username == username){
        //Ghost
        return baseGame.ghost.mediumsHasCards.length != baseGame.mediums.length;
    }else{
        //Medium
        let medium = baseGame.mediums.find(medium => medium.username == username);

        if(medium.hasPlayed && baseGame.ghost.mediumsHasCards.find(username => username == medium.username))
            return false;

        return true;
    }
}

function getCards(type, nb_cards){
    let json  = JSON.parse(fs.readFileSync(__dirname + '/cards.json', 'utf8'));
    let cards = json[type];
    if(cards != undefined){
        cards = helpers.shuffle(cards);
        if(nb_cards >= 0)
            cards = cards.slice(0, nb_cards);
    }
    return cards;
}
  
/**
 * vérifie que tous les joueurs ont trouvé leur scénario
 *  @param {object} game Instance courante de jeu
 * @returns {boolean} goForTheFinal indique si le scenario final doit être lancé ou non
 */
function areAllScenariosFound (game){
    let canGoToTheFinal = game.mediums.every((medium) => {
        return isScenarioFound(game, medium.username);
    });
    
    return canGoToTheFinal;
}

/**
 * verifie qu'un joueur a trouvé tout son scenario
 * @param {object} game instance courrante du jeu 
 * @param {string} username pseudo du joueur 
 * @returns {boolean} youFindIt indique 
 */
function isScenarioFound(game,username){
    let player = game.mediums.find(player => player.username == username);
    return player.state == FINAL;
}