let helpers           = require('../helpers');
let errors            = require('./Error');
let {assert, expect}  = require('chai');
let {join}            = require('./game')

beforeEach(function(){
    this.game = {
        players : []
    }
});

describe('Rejoindre une partie', function(){
    it('lorsque tout est ok', function(){
        let newGame = join(this.game, 'joueur1');
        assert.equal(newGame.players.length, 1);
        assert.equal(newGame.players[0], 'joueur1');
    });
    it('lorsque la partie est lancée', function(){

    });
    it('lorsqu\'on est deja dans la partie', function(){

    });
    it('lorsque la partie est pleine et non lancée', function(){

    });
    it('lorsque la partie est pleine et lancée', function(){

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
