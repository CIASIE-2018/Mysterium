"use strict"

let uniqid = require('uniqid');
let fs     = require('fs');
let helpers = require('./helpers');

class Game {
    constructor(max_player = 7, max_turn = 7, difficulte = 0){
        if(max_turn < 4)
            throw new Error('Minimum 4 turn')
        this.id         = uniqid();
        this.max_player = max_player;
        this.players    = [];
        this.max_turn   = max_turn;
        this.turn       = 0;
        this.started    = false;
        this.difficulte = 0;
        this.persos     = [];
        this.lieux      = [];
        this.armes      = [];
    }

    join(playerId){
        if(!this.isFull && !this.started){
            this.players.push({
                id    : playerId,
                ready : false
            });
        }else{
            throw new Error('Le jeu est plein.');
        }
    }

    get isFull(){
        return this.max_player == this.players.length;
    }

    get finished(){
        return this.max_turn == this.turn;
    }

    setState(playerId, ready = true){
        this.players.forEach(player => {
            if(player.id == playerId)
                player.ready = ready;
        });
    }

    get allIsReady(){
        let ready = true;
        this.players.forEach(player => {
            if(player.ready == false){
                ready = false;
            }
        });
        return ready;
    }

    init(){
        if(this.allIsReady){

            this.started = true;
            
            let nb_scenarios = this.players.length - 1 + (this.difficulte == 0 ? 2 : (this.difficulte == 1 ? 3 : 0));
            let persos = fs.readdirSync(__dirname + '/assets/images/personnage');
            this.persos = helpers.shuffle(persos).slice(0, nb_scenarios);

            let lieux = fs.readdirSync(__dirname + '/assets/images/lieux');
            this.lieux = helpers.shuffle(lieux).slice(0, nb_scenarios);

            let armes = fs.readdirSync(__dirname + '/assets/images/armes');
            this.armes = helpers.shuffle(armes).slice(0, nb_scenarios);

            let aleaScenarioFinal = Math.floor(Math.random() * (this.players.length - 1));
            this.scenarioFinal = {
                perso : this.persos[aleaScenarioFinal],
                lieu  : this.lieux[aleaScenarioFinal],
                arme  : this.armes[aleaScenarioFinal]
            }
        }else{
            throw new Error('Tous les joueurs ne sont pas pret');
        }
        //Attribuer un role a chaque joueur
        //Attribuer un role unique a chaque médium
    }
}

module.exports = Game




let g = new Game();

let user1 = uniqid();
let user2 = uniqid();
let user3 = uniqid();


g.join(user1);
g.join(user2);
g.join(user3);

g.setState(user1, true);
g.setState(user2, true);
g.setState(user3, true);
g.init();

console.log(g);

