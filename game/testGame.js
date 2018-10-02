let helpers           = require('../helpers');
let uniqid            = require('uniqid');
let errors            = require('./Error');
let {assert, expect}  = require('chai');
let {join}            = require('./game')

beforeEach(function(){
    this.game = {
        id         : uniqid(),
        max_player : 7,
        max_turn   : 7,
        turn       : 0,
        started    : false,
        difficulte : 0,
        persos     : [],
        lieux      : [],
        armes      : [],
        scenario_final: {},
        players    : [
            //Structure des joueurs
            /*
            {
                role            : 'ghost',
                id              : null,
                ready           : false,
                hand            : [],
                mediumsHasCards : []
            },
            {
                role      : 'medium',
                id        : null,
                ready     : false,
                state     : 0,
                visions   : [],
                hasPlayed : false
            }
            */
        ],
    }
});

describe('Rejoindre une partie', function(){
    it('lorsque tout est ok', function(){
        let newGame = join(this.game, 'joueur1');
        assert.equal(newGame.players.length, 1);
        assert.equal(newGame.players[0].id, 'joueur1');
    });
    it('lorsque la partie est lancée', function(){
        this.game.started = true;
        let newGame = join(this.game, 'joueur1');
        assert.equal(newGame.started, true);
        assert.equal(newGame.players.length, 0);
    });
    it('lorsqu\'on est deja dans la partie', function(){
        let newGame = join(this.game, 'joueur1');
        expect(join.bind(newGame, 'joueur1')).to.throw(errors.PlayerAlreadyInGameError);
    });
    it('lorsque la partie est pleine et non lancée', function(){
        let newGame = join(this.game, 'joueur1');
        newGame = join(this.game, 'joueur2');
        newGame = join(this.game, 'joueur3');
        newGame = join(this.game, 'joueur4');
        newGame = join(this.game, 'joueur5');
        newGame = join(this.game, 'joueur6');
        newGame = join(this.game, 'joueur2');
        newGame = join(this.game, 'joueur7');
        assert.equal(newGame.isFull, true);
        assert.equal(newGame.started, false);
        expect(join.bind(newGame, 'joueur8')).to.throw(errors.MaxPlayerReachedError);
    });
    it('lorsque la partie est pleine et lancée', function(){
        let newGame = join(this.game, 'joueur1');
        newGame = join(this.game, 'joueur2');
        newGame = join(this.game, 'joueur3');
        newGame = join(this.game, 'joueur4');
        newGame = join(this.game, 'joueur5');
        newGame = join(this.game, 'joueur6');
        newGame = join(this.game, 'joueur2');
        newGame = join(this.game, 'joueur7');
        assert.equal(newGame.isFull, true);
        startedGame = start(newGame);
        assert.equal(newGame.started, true);
        expect(join.bind(newGame, 'joueur8')).to.throw(errors.MaxPlayerReachedError);

    });
});


describe('Lancer une partie', function(){
    it('lorsqu\'une personne n\'est pas pret', function(){
        
    });
    it('lorsque tout le monde est pret', function(){
        
    });
    it('lorsque le nombre de joueur > 2', function(){

    });
    it('lorsque le nombre de joueur < 2', function(){

    });
});
