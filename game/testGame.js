let helpers                            = require('../helpers');
let uniqid                             = require('uniqid');
let errors                             = require('./Error');
let {assert, expect}                   = require('chai');
let {join, createGame, init, setReady} = require('./game')

beforeEach(function(){
    this.game = createGame();
});

describe('Rejoindre une partie', function(){
    it('lorsque tout est ok', function(){
        let newGame = join(this.game, 'joueur1');
        assert.equal(newGame.players.length, 1);
        assert.equal(newGame.players[0].id, 'joueur1');
    });
    it('lorsque la partie est lancée', function(){
        this.game.started = true;
        let newGame = this.game;
        expect(function(){
            join(newGame, 'joueur1');
        }).to.throw(errors.MaxPlayerReachedError);


    });
    it('lorsqu\'on est deja dans la partie', function(){
        let newGame = join(this.game, 'joueur1');
        expect(function(){
            join(newGame, 'joueur1');
        }).to.throw(errors.PlayerAlreadyInGameError);
    });
    it('lorsque la partie est pleine et non lancée', function(){
        let newGame = join(this.game, 'joueur1');
        for(i = 2; i < 8; i++){
            idJoueur = 'joueur' + i;
            newGame = join(newGame, idJoueur);
            newGame = setReady(newGame, idJoueur, true);
        }
        assert.equal(newGame.players.length, newGame.max_player);
        assert.equal(newGame.started, false);
        expect(function(){
            join(newGame, 'joueur8');
        }).to.throw(errors.MaxPlayerReachedError);
    });

    it('lorsque la partie est pleine et lancée', function(){
        let newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, 'joueur1', true);
        for(i = 2; i < 8; i++){
            idJoueur = 'joueur' + i;
            newGame = join(newGame, idJoueur);
            newGame = setReady(newGame, idJoueur, true);
        }

        assert.equal(newGame.players.length, newGame.max_player);
        let startedGame = init(newGame);
        assert.equal(startedGame.started, true);
        expect(function(){
            join(startedGame, 'joueur8');
        }).to.throw(errors.MaxPlayerReachedError);

    });
});


describe('Lancer une partie', function(){
    it('impossible lorsqu\'une personne n\'est pas pret', function(){
        
    });
    it('lorsque tout le monde est pret', function(){

        
    });
    it('lorsque le nombre de joueur > 2', function(){

    });
    it('impossible lorsque le nombre de joueur < 2', function(){

    });
});

describe('Mettre son statut a prêt', function () {
    it('Se mettre prêt', function () {

    });

    it('Changer de prêt à pas prêt', function () {

    });

    it('Tout le monde est prêt ', function () {

    });
});

describe('test au commencement d\'une partie', function () {
    it('chacun a un rôle attribué', function () {

    });

    it('il n\'y a qu\'un seul fantôme', function () {

    });

    it('il y a le bon nombre de medium', function () {

    });

    it('les scenarios sont initialisés, difficulté 0', function () {

    });

    it('les scenarios sont initialisés, difficulté 1', function () {

    });

    it('chaque medium a un scenario', function () {

    });

    it('il n\'y a pas deux scenarios identiques', function () {

    });

    it('cartes visions correctement chargées ', function () {

    });
});

describe('tests fonctionnalités InGame', function () {
    
})
