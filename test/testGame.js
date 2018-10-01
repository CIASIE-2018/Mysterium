let uniqid = require('uniqid');

var assert = require('chai').assert
var expect = require('chai').expect
let helpers = require('../helpers');

var Game = require("../game.js");

describe('testPreGame',function(){

    let user1 = uniqid();
    let user2 = uniqid();
    let user3 = uniqid();
    let user4 = uniqid();
    let user5 = uniqid();
    let user6 = uniqid();

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

    it("player_can_join", () => {

        let g = new Game(6)

        g.join(user1);
        g.join(user2);

        assert.equal(g.players.length, 2)
    })

    

    //verifie qu'on a atteint le maximum de joueur
    it("max_player_in_game",() => {
        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);
        g.join(user4);
        g.join(user5);
        g.join(user6);
        assert.equal(g.isFull, true);
    })

    it("getter_mediums", () => {

        let g = new Game(6);

        g.join(user1)
        g.join(user2)
        g.join(user3)
        g.join(user4)

        g.init_roles();

        assert.equal(typeof(g.mediums), 'object')
        assert.equal(g.mediums.length, 3)


    })

    it("getter_ghost", () => {

        let g = new Game(6)


        g.join(user1)
        g.join(user2)
        g.join(user3)
        g.join(user4)

        g.init_roles();

        let temp = [];
        temp.push(g.ghost);
        
        assert.equal(typeof(g.ghost), 'object')
        assert.equal(temp.length, 1)
        assert.equal(temp[0].role, 'ghost')


    })

    it('set_ready', () => {

        let g = new Game(6);

        g.join(user1)

        g.setReady(user1)

        let player =  g.players.find(player => player.id == user1)

        assert.equal(player.ready,true)

    });

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

    it("one_player_is_not_ready", () => {

        let g = new Game(6)

        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.setReady(user1, true);
        g.setReady(user2, true);

        assert.equal(g.allIsReady, false)

    })

    it("set_player_ready_to_false", () => {

        let g = new Game(6)

        g.join(user1);

        g.setReady(user1);

        assert.equal(g.allIsReady, true)

        g.setReady(user1, false);

        assert.equal(g.allIsReady, false)

    })

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

    it("Role_well_initialize", () => {

        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);


        g.init_roles();
        
        assert.equal(typeof(g.ghost), 'object')
        assert.equal(g.mediums.length, 2)

    })

    it("Generate_cards_difficulty_0", () => {

        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.init_roles();
        g.generate_cards();
        
        assert.equal(g.persos.length, 4)
        assert.equal(g.lieux.length, 4)
        assert.equal(g.armes.length, 4)

    })

    it("Generate_cards_difficulty_1", () => {

        let g = new Game(6,4,1);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.init_roles();
        g.generate_cards();
        
        assert.equal(g.persos.length, 5)
        assert.equal(g.lieux.length, 5)
        assert.equal(g.armes.length, 5)

    })

    it("Generate_scenario_difficulty_0", () => {

        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.init_roles();
        g.generate_cards();
        assert.equal(g.generate_scenarios().length, 4)

    })

    it("Generate_scenario_difficulty_1", () => {

        let g = new Game(6,4,1);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.init_roles();
        g.generate_cards();
        assert.equal(g.generate_scenarios().length, 5)

    })

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

    it("initialisation_scenario", () => {

        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.init_roles();
        g.generate_cards()

        assert.equal(typeof(g.scenario_final), 'undefined')
        assert.equal(g.mediums[0].scenario, undefined)

        g.init_scenarios();
        
        
        assert.equal(typeof(g.scenario_final), 'object')
        assert.notEqual(g.mediums[0].scenario, undefined)
        assert.equal(typeof(g.mediums[0].scenario), 'object')

    })

    it("initialisation_visions_cards", () => {

        let g = new Game(6,4);
        g.join(user1);
        g.join(user2);
        g.join(user3);

        g.init_roles();
        g.generate_cards()
        g.init_scenarios();
        g.init_visions();

        assert.equal(g.ghost.hand.length, 7)

    })

    //catch une erreur
    it('player cannot be twice in the same party', () => {

        let g = new Game(6,4);

        g.join(user1);
        g.join(user2);
        g.join(user3);
        
        expect(() => g.join(user2)).to.throw();
    })

    //catch une erreur
    it('minimum 1 ghost & 2 mediums', () => {

        let g = new Game(6,4);

        g.join(user1);
        g.join(user2);

        g.setReady(user1)
        g.setReady(user2)
        
        expect(() => g.init()).to.throw();
    })

    //catch une erreur
    it("player_cant_join", () => {

        let g = new Game(3)

        g.join(user1);
        g.join(user2);
        g.join(user3);
        

        expect(() => g.join(user4)).to.throw();
    })

    

});
