let helpers                            = require('../helpers');
let uniqid                             = require('uniqid');
let errors                             = require('./Error');
let {assert, expect}                   = require('chai');
let {join, createGame, init, setReady, allIsReady} = require('./game')

beforeEach(function(){
    this.game = createGame();
});

describe('Rejoindre une partie', function(){
    it('lorsque tout est ok', function(){
        let newGame = join(this.game, 'joueur1');
        assert.equal(newGame.players.length, 1);
    });
    it('lorsque la partie est lancée', function(){
        let newGame = this.game;
        newGame.started = true;
        expect(function(){
            join(newGame, 'joueur1');
        }).to.throw(errors.GameAlreadyStarted);

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
            nomJoueur = 'joueur' + i;
            newGame = join(newGame, nomJoueur);
        }
        assert.equal(newGame.players.length, newGame.max_player);
        assert.equal(newGame.started, false);
        expect(function(){
            join(newGame, 'joueur8');
        }).to.throw(errors.MaxPlayerReachedError);
    });

    it('lorsque la partie est lancée', function(){
        let newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, newGame.players[0].id, true);
        for(i = 2; i < 8; i++) {
            nomJoueur = 'joueur' + i;
            newGame = join(newGame, nomJoueur);
            newGame = setReady(newGame, newGame.players[i - 1].id, true);
        }
        let startedGame = init(newGame);
        assert.equal(startedGame.started, true);
        expect(function(){
            join(startedGame, 'joueur4');
        }).to.throw(errors.GameAlreadyStarted);

    });
});



describe('Lancer une partie', function(){

    it('impossible lorsqu\'une personne n\'est pas pret', function(){
        let newGame = join(this.game, 'joueur1');
        for(i = 2; i < 8; i++) {
            nomJoueur = 'joueur' + i;
            newGame = join(newGame, nomJoueur);
            newGame = setReady(newGame, newGame.players[i - 1].id, true);
        }
        expect(function(){
            init(newGame);
        }).to.throw(errors.NotAllAreReady);
    });

    it('impossible lorsque le nombre de joueur <= 2', function(){
        let newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, newGame.players[0].id, true);
        newGame = join(newGame, 'joueur2');
        newGame = setReady(newGame, newGame.players[1].id, true);
        assert.equal(newGame.players.length, 2);
        expect(function(){
            init(newGame);
        }).to.throw(errors.NotEnoughPlayerError);
    });

    it('lorsque tout le monde est pret et le nb de joueur > 2', function(){
        let newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, newGame.players[0].id, true);
        for(i = 2; i < 5; i++){
            idJoueur = 'joueur' + i;
            newGame = join(newGame, idJoueur);
            newGame = setReady(newGame, newGame.players[i-1].id, true);
        }
        startedGame = init(newGame);
        assert.equal(startedGame.started, true);
    });
});
/*
describe('Mettre son statut a prêt', function () {
    it('Se mettre prêt', function () {
        let newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, 'joueur1', true);
        assert.equal(newGame.players[0].ready, true);
    });

    it('Changer de prêt à pas prêt', function () {
        let newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, 'joueur1', true);
        assert.equal(newGame.players[0].ready, true);
        newGame = setReady(newGame, 'joueur1', false); //faire une méthode switchReady() ?
        assert.equal(newGame.players[0].ready, false);
    });

    it('Tout le monde est prêt ', function () {
        let newGame = join(this.game, 'joueur1');
        for(i = 2; i < 8; i++){
            idJoueur = 'joueur' + i;
            newGame = join(newGame, idJoueur);
            newGame = setReady(newGame, idJoueur, true);
        }
        assert.equal(allIsReady(newGame), false);
        newGame = setReady(newGame, 'joueur1', true);
        assert.equal(allIsReady(newGame), true);

    });
});

describe('test au commencement d\'une partie', function () {

    beforeEach(function(){
        newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, 'joueur1', true);
        for(i = 2; i < 8; i++){
            idJoueur = 'joueur' + i;
            newGame = join(newGame, idJoueur);
            newGame = setReady(newGame, idJoueur, true);
        }
        startedGame = init(newGame);
    });

    it('chacun a un rôle attribué', function () {
        let nbPlayers = newGame.players.length;
        assert.equal(startedGame.ghost != undefined, true);
        assert.equal(startedGame.mediums.length, nbPlayers-1);

    });

    it('il n\'y a qu\'un seul fantôme', function () {
        //Il ne peut pas il y avoir plusieurs ghost ?
        // game.ghost n'est pas un tableau
    });

    it('il y a le bon nombre de medium', function () {
        assert.equal(startedGame.mediums.length, newGame.players.length  - 1);
    });

    it('les scenarios sont initialisés, difficulté 0', function () {

        let nb_scenarios = startedGame.mediums.length+2;

        assert.equal(startedGame.persos.length, nb_scenarios)
        assert.equal(startedGame.armes.length, nb_scenarios)
        assert.equal(startedGame.lieux.length, nb_scenarios)


    });

    it('les scenarios sont initialisés, difficulté 1', function () {

        let startedGameDiffuculty1 = init(
            {
                id: 'GSza62H48Jdo8j9jk84w2MvAi6HjdBZWJdQQajNRsN2N',
                max_player: 7,
                max_turn: 7,
                turn: 0,
                started: false,
                difficulte: 1,
                persos: [],
                lieux: [],
                armes: [],
                players:
                    [{id: 'joueur1', ready: true},
                        {id: 'joueur2', ready: true},
                        {id: 'joueur3', ready: true},
                        {id: 'joueur4', ready: true},
                        {id: 'joueur5', ready: true},
                        {id: 'joueur6', ready: true},
                        {id: 'joueur7', ready: true}]
            });
        let nb_scenarios = startedGameDiffuculty1.mediums.length+3;
        assert.equal(startedGameDiffuculty1.persos.length, nb_scenarios)
        assert.equal(startedGameDiffuculty1.armes.length, nb_scenarios)
        assert.equal(startedGameDiffuculty1.lieux.length, nb_scenarios)

    });

    it('chaque medium a un scenario', function () {

        startedGame.mediums.forEach(medium => {
            assert.equal(medium.scenario.perso != undefined, true);
            assert.equal(startedGame.persos.includes(medium.scenario.perso), true);

            assert.equal(medium.scenario.lieu != undefined, true);
            assert.equal(startedGame.lieux.includes(medium.scenario.lieu), true);

            assert.equal(medium.scenario.arme != undefined, true);
            assert.equal(startedGame.armes.includes(medium.scenario.arme), true);
        });

    });

    it('il n\'y a pas deux scenarios identiques', function () {
        let persosJoueurs = [];
        let armesJoueurs = [];
        let lieuxJoueurs = [];
        startedGame.mediums.forEach(medium => {
            persosJoueurs.push(medium.scenario.perso);
            armesJoueurs.push(medium.scenario.arme);
            lieuxJoueurs.push(medium.scenario.lieu);
        });

        for(var i = 0; i <= persosJoueurs; i++) {
            for(var j = i; j <= persosJoueurs; j++) {
                assert.equal((i != j && persosJoueurs[i] == persosJoueurs[j]), false);
            }
        }
        for(var i = 0; i <= armesJoueurs; i++) {
            for(var j = i; j <= armesJoueurs; j++) {
                assert.equal((i != j && armesJoueurs[i] == armesJoueurs[j]), false);
            }
        }
        for(var i = 0; i <= lieuxJoueurs; i++) {
            for (var j = i; j <= lieuxJoueurs; j++) {
                assert.equal((i != j && lieuxJoueurs[i] == lieuxJoueurs[j]), false);
            }
        }
    });

    it('cartes visions correctement chargées ', function () {
        let nbCartesVisionsFantomes = startedGame.ghost.hand.length;
        let nbCcartesVisions = startedGame.visions.length;
        let nbTotalVisions   = helpers.getRandomFiles(config.directory.images + '/visions');
        for(var i = 0; i < nbCartesVisionsFantomes; i++) {
            assert.equal(startedGame.visions.includes(startedGame.ghost.hand[i]), false);
        }

        assert.equal(nbCartesVisionsFantomes+nbCcartesVisions, vnbTotalVisions);
    });
});*/

describe('tests fonctionnalités InGame', function () {
    
})
