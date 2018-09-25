
var assert = require('assert');
var Game = require("../game.js");

describe('testPreGame',function(){
    //verifie qu'on a atteint le maximum de joueur
    it("maxPlayerReached",() => {
        let g = new Game(6,4);
        g.join("j1")
        g.join("j1")
        g.join("j1")
        g.join("j1")
        g.join("j1")
        g.join("j1")
        assert.equal(g.max_player, 6);
    })


    //verifie que les joueurs sont différents
    it("PlayersMustBeDifferent",() => {
        let g = new Game(6,4);
        g.join("j1")
        g.join("j1")
        g.join("j1")
        g.join("j1")
        g.join("j1")
        g.join("j1")
        assert.equal(g.max_player, 6);
    })

});
