let uniqid = require('uniqid');

class GameFullException extends Error {
    constructor () {
      super('Le jeu est plein.');      
    }
}

class Game {
    constructor(max_player = 7, max_turn = 7){
        if(max_turn < 4)
            throw new Error('Minimum 4 turn')
        this.uniqid     = uniqid();
        this.max_player = max_player;
        this.players    = [];
        this.max_turn   = max_turn;
        this.turn       = 0;
    }

    join(playerId){
        if(this.players.length + 1 <= this.max_player){
            this.players.push(playerId);
        }else{
            throw new GameFullException();
        }
    }

    get isFull(){
        return this.max_player == this.players.length;
    }

    get finished(){
        return this.max_turn == this.turn;
    }

    setState(playerId, ready = true){
        
    }
}

let g = new Game(1);
console.log(g);
try{
    g.join('j1');
    console.log(g);
    console.log('fini : ' + g.finished);
    console.log('full : ' + g.isFull)
}catch(e){
    console.log('Erreur : ' + e.message);

}
