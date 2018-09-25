"use strict"

let uniqid = require('uniqid');

class Game {
    constructor(max_player = 7, max_turn = 7){
        if(max_turn < 4)
            throw new Error('Minimum 4 turn')
        this.id         = uniqid();
        this.max_player = max_player;
        this.players    = [];
        this.max_turn   = max_turn;
        this.turn       = 0;
        this.started    = false;
    }

    join(playerId){
        if(this.players.length + 1 <= this.max_player){
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
        }else{
            throw new Error('Tous les joueurs ne sont pas pret');
        }
        //Générer les scénarios
        //Choisir le scénario final
        //Attribuer un role a chaque joueur
        //Attribuer un role unique a chaque médium
    }
}

module.exports = Game




let g = new Game();

let user1 = uniqid();
let user2 = uniqid();

g.join(user1);
g.join(user2);

g.setState(user1, true);
g.setState(user2, true);
g.init();

console.log(g);

