let uniqid = require('uniqid');

let errors = require('../Error.js')

var assert = require('chai').assert
var expect = require('chai').expect
let helpers = require('../helpers');

var Game = require("../game.js");

let user1 = uniqid();
let user2 = uniqid();
let user3 = uniqid();
let user4 = uniqid();
let user5 = uniqid();
let user6 = uniqid();
let user7 = uniqid();

describe('tests de prélancement d\'une partie', () => {

    //verifie que le constructeur sans paramètres fonctionne
    it("constructor_base", () => {

        let g = new Game();

        assert.equal(g.max_player, 7)
        assert.equal(g.max_turn, 7)
        assert.equal(g.players.length, 0)
        assert.equal(g.turn, 0)
        assert.equal(g.started, false)
        assert.equal(g.difficulte, 0)
        assert.equal(g.persos, 0)
        assert.equal(g.lieux, 0)
        assert.equal(g.armes, 0)


    })

    //verifie que le constructeur avec paramètres fonctionne
    it("constructor_with_params", () => {

        let g = new Game(4,4,1);

        assert.equal(g.max_player, 4)
        assert.equal(g.max_turn, 4)
        assert.equal(g.players.length, 0)
        assert.equal(g.turn, 0)
        assert.equal(g.started, false)
        assert.equal(g.difficulte, 1)
        assert.equal(g.persos, 0)
        assert.equal(g.lieux, 0)
        assert.equal(g.armes, 0)


    })

    //verifie qu'on peut rejoindre une partie
    it("Rejoindre une partie", () => {

        let g = new Game(6)

        g.join(user1);
        g.join(user2);

        assert.equal(g.players.length, 2)
    })

    it("Les joueurs doivent être différents", () => {

        let g = new Game(6)

        g.join(user1);

        expect(g.join.bind(g,user1)).to.throw(errors.PlayerAlreadyInGameError)
    })

    //verifie qu'on a atteint le maximum de joueur
    it("Maximum de joueur atteint",() => {
        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);
        g.join(user4);
        g.join(user5);
        g.join(user6);
        assert.equal(g.isFull, true);
    })

    //verifie qu'on ne peut pas avoir  plus de joueur que le maximum
    it("depassement du nombre maximum de joueur non autorisé",() => {
        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);
        g.join(user4);
        g.join(user5);
        g.join(user6);
        /**
         * Explication d'expect
         * on passe a expect la method que l'on veut tester qui doit renvoyer une exception
         * en cas de comportement anormal.
         * Sans bind, expect test le resultat de la méthode et donc avec l'erreur deja envoyé
         * et non ce qui se passerait à l'execution de celle ci
         * En ajoutant bind, on passe une fonction a expect qui englobe notre methode a tester
         */
        expect(g.join.bind(g,user7)).to.throw(errors.MaxPlayerReachedError)
    })

    //verifie que l'on peut se mettre prêt pour la partie
    it('set_ready', () => {

        let g = new Game(6);

        g.join(user1)

        g.setReady(user1)

        let player =  g.players.find(player => player.id == user1)

        assert.equal(player.ready,true)

    });

    //Vérifie que l'on peut changer son statut de prêt à pas prêt avant une poartie
    it("set_player_ready_to_false", () => {

        let g = new Game(6)

        g.join(user1);

        g.setReady(user1);

        assert.equal(g.allIsReady, true)

        g.setReady(user1, false);

        assert.equal(g.allIsReady, false)

    })

    //Verifie que tout le monde est prêt avant de lancer une partie
    it("all_players_ready", () => {

        let g = new Game(6);

        let user1 = uniqid();
        let user2 = uniqid();
        let user3 = uniqid();

        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.setReady(user1);
        g.setReady(user2);
        g.setReady(user3);

        assert.equal(g.allIsReady, true)

    })

    //Verifie que l'on ne peut pas lancer une partie si tout le monde n'est pas prêt
    it("Impossible de lancer une partie, au moins un joueur n'est pas prêt", () => {

        let g = new Game(6)

        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.setReady(user1, true);
        g.setReady(user2, true);

        expect(g.init.bind(g)).to.throw(errors.NotAllAreReady)

    })

    //Verifie que l'on ne peut pas lancer de partie si le nombre de joueurs est insuffisant
    it("Impossible de lancer une partie, nb de joueur insuffisant", () => {

        let g = new Game(6)

        g.join(user1);

        g.setReady(user1, true);

        expect(g.init.bind(g)).to.throw(errors.NotEnoughPlayerError)

    })

    //Vérifie que l'on peut lancer une partie quand les conditions sont remplies
    it("initialisation", () => {

        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.setReady(user1);
        g.setReady(user2);
        g.setReady(user3);

        assert.equal(g.isFull,false)

        g.init();

        assert.equal(g.started, true)

    })

    //Verifie que les rôles des joueurs sont bien attribués
    it("Role_well_initialize", () => {

        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.setReady(user1);
        g.setReady(user2);
        g.setReady(user3);

        g.init();

        assert.equal(typeof(g.ghost), 'object')
        assert.equal(g.mediums.length, 2)

    })

    //Verifie que l'on a le bon nombre de medium
    it("il y a le bon nombre de medium", () => {

        let g = new Game(6);

        g.join(user1)
        g.join(user2)
        g.join(user3)
        g.join(user4)

        g.setReady(user1);
        g.setReady(user2);
        g.setReady(user3);
        g.setReady(user4);

        g.init();

        assert.equal(typeof(g.mediums), 'object')
        assert.equal(g.mediums.length, 3)


    })

    //Verifie qu'il y a un unique fantôme
    it("Il y a bien un seul fantôme", () => {

        let g = new Game(6)


        g.join(user1)
        g.join(user2)
        g.join(user3)
        g.join(user4)

        g.setReady(user1);
        g.setReady(user2);
        g.setReady(user3);
        g.setReady(user4);

        g.init();

        let temp = [];
        temp.push(g.ghost);
        
        assert.equal(typeof(g.ghost), 'object')
        assert.equal(temp.length, 1)
        assert.equal(temp[0].role, 'ghost')


    })

    //Verifie que l'on genere le bon nombre de scenario en difficulté 0
    it("Generation de scenarios defficulté 0", () => {

        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.setReady(user1);
        g.setReady(user2);
        g.setReady(user3);

        g.init();
        
        assert.equal(g.persos.length, 4)
        assert.equal(g.lieux.length, 4)
        assert.equal(g.armes.length, 4)

    })

    //Verifie que l'on genere le bon nombre de scenario en difficulté 1
    it("Generation de scenarios defficulté 1", () => {

        let g = new Game(6,4,1);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.setReady(user1);
        g.setReady(user2);
        g.setReady(user3);

        g.init();
        
        assert.equal(g.persos.length, 5)
        assert.equal(g.lieux.length, 5)
        assert.equal(g.armes.length, 5)

    })

    //Verifie que chaque medium a un scenario
    it("each mediums has scenarios", () => {

        let g = new Game(6,4,1);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.setReady(user1)
        g.setReady(user2)
        g.setReady(user3)

        g.init()

        assert.isObject(g.mediums[0].scenario)
        assert.isNotEmpty(g.mediums[0].scenario)

        assert.isObject(g.mediums[1].scenario)
        assert.isNotEmpty(g.mediums[1].scenario)

    })

    //Verifie que les cartes visions sont bien initialisées et distribuées au fantôme
    it("initialisation_visions_cards", () => {

        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.setReady(user1);
        g.setReady(user2);
        g.setReady(user3);

        g.init();

        assert.equal(g.ghost.hand.length, 7)

    })

});

describe("Test In Game", () => {

});
