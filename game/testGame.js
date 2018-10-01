let helpers           = require('../helpers');
let errors            = require('./Error');
let {assert, expect}  = require('chai');
let {join}            = require('./game')

describe('XXXX', function(){
    
    beforeEach(function(){
        this.game = {
            players : []
        }
    });

    
    it('Ajout player', function(){
        let newGame = join(this.game, 'joueur1');
        assert.equal(newGame.players.length, 1);
        assert.equal(newGame.players[0], 'joueur1');
    });
});

