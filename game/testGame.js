const fs                             = require('fs');
const errors                         = require('./Error');
const config                         = require('../config/config');
const {assert, expect}               = require('chai');
const helpers                        = require('../helpers');
const {
    allIsReady,
    allMediumHasChooseScenario,
    allMediumPlayed,
    chooseScenarioFinal,
    createGame,
    getAllScenario,
    getInformations,
    giveVisionsToMedium,
    init,
    join,
    mediumHasWin,
    play,
    setReady,
    verifyChoicePlayers
} = require('./game')

beforeEach(function(){
    this.game = createGame();
});

describe('Rejoindre une partie', function(){

    beforeEach(function(){
        newGame = this.game;
    });

    it('lorsque tout est ok', function(){
        newGame = join(this.game, 'joueur1');
        assert.equal(newGame.players.length, 1);
    });

    it('lorsque la partie est lancée', function(){
        newGame.started = true;
        expect(function(){
            join(newGame, 'joueur1');
        }).to.throw(errors.GameAlreadyStarted);

    });
    it('lorsqu\'on est deja dans la partie', function(){
        newGame = join(newGame, 'joueur1');
        expect(function(){
            join(newGame, 'joueur1');
        }).to.throw(errors.PlayerAlreadyInGameError);
    });
    it('lorsque la partie est pleine et non lancée', function(){
        for(i = 1; i < 8; i++){
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
        for(i = 1; i < 4; i++) {
            nomJoueur = 'joueur' + i;
            newGame = join(newGame, nomJoueur);
            newGame = setReady(newGame, newGame.players[i - 1].username, true);
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
        let newGame = this.game;
        for(i = 1; i < 8; i++) {
            nomJoueur = 'joueur' + i;
            newGame = join(newGame, nomJoueur);
            if(i != 1) newGame = setReady(newGame, newGame.players[i - 1].username, true);
        }
        expect(function(){
            init(newGame);
        }).to.throw(errors.NotAllAreReady);
    });

    it('impossible lorsque le nombre de joueur <= 2', function(){
        let newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, newGame.players[0].username, true);
        newGame = join(newGame, 'joueur2');
        newGame = setReady(newGame, newGame.players[1].username, true);
        assert.equal(newGame.players.length, 2);
        expect(function(){
            init(newGame);
        }).to.throw(errors.NotEnoughPlayerError);
    });

    it('lorsque tout le monde est pret et le nb de joueur > 2', function(){
        let newGame = this.game;
        for(i = 1; i < 5; i++) {
            nomJoueur = 'joueur' + i;
            newGame = join(newGame, nomJoueur);
            newGame = setReady(newGame, newGame.players[i - 1].username, true);
        }
        startedGame = init(newGame);
        assert.equal(startedGame.started, true);
    });
});

describe('Mettre son statut a prêt', function () {
    it('Se mettre prêt', function () {
        let newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, newGame.players[0].username, true);
        assert.equal(newGame.players[0].ready, true);
    });

    it('Changer de prêt à pas prêt', function () {
        let newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, newGame.players[0].username, true);
        assert.equal(newGame.players[0].ready, true);
        newGame = setReady(newGame, newGame.players[0].username, false);
        assert.equal(newGame.players[0].ready, false);
    });

    it('Tout le monde est prêt ', function () {
        let newGame = this.game;
        for(i = 1; i < 8; i++) {
            nomJoueur = 'joueur' + i;
            newGame = join(newGame, nomJoueur);
            if(i != 1) newGame = setReady(newGame, newGame.players[i - 1].username, true);
        }
        assert.equal(allIsReady(newGame), false);
        newGame = setReady(newGame, newGame.players[0].username, true);
        assert.equal(allIsReady(newGame), true);

    });
});

describe('Test au commencement d\'une partie', function () {

    beforeEach(function(){
        newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, newGame.players[0].username, true);
        for(i = 2; i < 8; i++){
            idJoueur = 'joueur' + i;
            newGame = join(newGame, idJoueur);
            newGame = setReady(newGame, newGame.players[i-1].username, true);
        }
        startedGame = init(newGame);
    });

    it('chacun a un rôle attribué', function () {
        let nbPlayers = newGame.players.length;
        assert.equal(startedGame.ghost != undefined, true);
        assert.equal(startedGame.mediums.length, nbPlayers-1);

    });

    it('il n\'y a qu\'un seul fantôme', function () {
        assert.equal(startedGame.ghost != undefined, true);
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

        let json  = JSON.parse(fs.readFileSync(__dirname + '/cards.json', 'utf8'));
        let cards = json["visions"];


        let nbTotalVisions   = cards.length;
        for(var i = 0; i < nbCartesVisionsFantomes; i++) {
            assert.equal(startedGame.visions.includes(startedGame.ghost.hand[i]), false);
        }
        assert.equal(nbCartesVisionsFantomes+nbCcartesVisions, nbTotalVisions);
    });
});

describe('Methodes in game', function () {

    beforeEach(function(){
        newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, newGame.players[0].username, true);
        for(i = 2; i < 4; i++){
            idJoueur = 'joueur' + i;
            newGame = join(newGame, idJoueur);
            newGame = setReady(newGame, newGame.players[i-1].username, true);
        }
        startedGame = init(newGame);
    });

    it('les informations du joueur - ghost', function(){
        let infos = getInformations(startedGame, startedGame.ghost.username);

        assert.equal(infos.type, 'ghost')
        assert.equal(infos.username, startedGame.ghost.username);
        assert.equal(infos.turn, 0);
        assert.equal(infos.hand, startedGame.ghost.hand);
        assert.equal(infos.mediums.length, startedGame.mediums.length);
    });

    it('les informations du joueur - medium', function(){
        let infos = getInformations(startedGame, startedGame.mediums[0].username);

        assert.equal(infos.type, 'medium')
        assert.equal(infos.username, startedGame.mediums[0].username);
        assert.equal(infos.turn, 0);
    });

    it('les informations du joueur - joueur inexistant', function(){
        expect(function(){
            getInformations(startedGame, 'toto');
        }).to.throw()
    });

    it('Verifier le choix des joueurs - tous les joueurs n\'ont pas joué', function(){
        expect(function(){
            verifyChoicePlayers(startedGame);
        }).to.throw();
    });

    it('Verifier le choix des joueurs - 1 joueurs a trouvé la bonne carte', function(){

        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[0].username, [startedGame.ghost.hand[0]]);
        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[1].username, [startedGame.ghost.hand[3]]);

        startedGame = play(startedGame, startedGame.mediums[0].username, startedGame.mediums[0].scenario.perso)
        startedGame = play(startedGame, startedGame.mediums[1].username, startedGame.mediums[0].scenario.perso)

        startedGame = verifyChoicePlayers(startedGame);

        assert.equal(startedGame.mediums[0].state, 1);
        assert.equal(startedGame.mediums[0].visions.length,0);
        assert.isUndefined(startedGame.choosenCard);

        assert.equal(startedGame.mediums[1].state, 0);
        assert.equal(startedGame.mediums[1].visions.length,1);
        assert.isUndefined(startedGame.choosenCard);
    });

    it('Verifier le choix des joueurs - tous joueurs ont trouvé la bonne carte', function(){

        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[0].username, [startedGame.ghost.hand[0]]);
        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[1].username, [startedGame.ghost.hand[3]]);

        startedGame = play(startedGame, startedGame.mediums[0].username, startedGame.mediums[0].scenario.perso)
        startedGame = play(startedGame, startedGame.mediums[1].username, startedGame.mediums[1].scenario.perso)

        startedGame = verifyChoicePlayers(startedGame);

        assert.equal(startedGame.mediums[0].state, 1);
        assert.equal(startedGame.mediums[0].visions.length,0);
        assert.isUndefined(startedGame.choosenCard);

        assert.equal(startedGame.mediums[1].state, 1);
        assert.equal(startedGame.mediums[1].visions.length,0);
        assert.isUndefined(startedGame.choosenCard);
    });

    it('Verifier le choix des joueurs - le tour du jeu augmente', function(){

        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[0].username, [startedGame.ghost.hand[0]]);
        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[1].username, [startedGame.ghost.hand[3]]);

        startedGame = play(startedGame, startedGame.mediums[0].username, startedGame.mediums[0].scenario.perso)
        startedGame = play(startedGame, startedGame.mediums[1].username, startedGame.mediums[1].scenario.perso)

        startedGame = verifyChoicePlayers(startedGame);

        assert.equal(startedGame.turn, 1);
    });

    it('Tous les joueurs ont joués', function(){
        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[0].username, [startedGame.ghost.hand[0]]);
        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[1].username, [startedGame.ghost.hand[0]]);

        //les joueurs choisisent une carte du plateau   
        startedGame = play(startedGame, startedGame.mediums[0].username, startedGame.mediums[0].scenario.perso);
        startedGame = play(startedGame, startedGame.mediums[1].username, startedGame.mediums[1].scenario.perso);

        assert.isTrue(allMediumPlayed(startedGame))

    })

    it('Tous les joueurs ont joués - 1 n\'a pas joué', function(){
        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[0].username, [startedGame.ghost.hand[0]]);
        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[1].username, [startedGame.ghost.hand[0]]);

        //les joueurs choisisent une carte du plateau   
        startedGame = play(startedGame, startedGame.mediums[0].username, startedGame.mediums[0].scenario.perso);

        assert.isFalse(allMediumPlayed(startedGame))

    })
});

describe('Phase finale', function(){

    beforeEach(function(){
        newGame = join(this.game, 'joueur1');
        newGame = setReady(newGame, newGame.players[0].username, true);
        for(i = 2; i < 5; i++){
            idJoueur = 'joueur' + i;
            newGame = join(newGame, idJoueur);
            newGame = setReady(newGame, newGame.players[i-1].username, true);
        }
        startedGame = init(newGame);

        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[0].username, [startedGame.ghost.hand[0]]);
        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[1].username, [startedGame.ghost.hand[0]]);
        startedGame = giveVisionsToMedium(startedGame, startedGame.mediums[2].username, [startedGame.ghost.hand[0]]);

        //les joueurs choisisent une carte du plateau   
        startedGame = play(startedGame, startedGame.mediums[0].username, startedGame.mediums[0].scenario.perso);
        startedGame = play(startedGame, startedGame.mediums[1].username, startedGame.mediums[1].scenario.perso);
        startedGame = play(startedGame, startedGame.mediums[2].username, startedGame.mediums[2].scenario.perso);

        //verifie si les joueurs ont choisis la bonne carte sur le plateau 
        //en fonction de leur scenario
        startedGame = verifyChoicePlayers(startedGame);

        startedGame = play(startedGame, startedGame.mediums[0].username, startedGame.mediums[0].scenario.lieu);
        startedGame = play(startedGame, startedGame.mediums[1].username, startedGame.mediums[1].scenario.lieu);
        startedGame = play(startedGame, startedGame.mediums[2].username, startedGame.mediums[2].scenario.lieu);

        startedGame = verifyChoicePlayers(startedGame);

        startedGame = play(startedGame, startedGame.mediums[0].username, startedGame.mediums[0].scenario.arme);
        startedGame = play(startedGame, startedGame.mediums[1].username, startedGame.mediums[1].scenario.arme);
        startedGame = play(startedGame, startedGame.mediums[2].username, startedGame.mediums[2].scenario.arme);

        startedGame = verifyChoicePlayers(startedGame);
    });

    it('Avoir tous les scénarios des joueurs', function(){
        let scenarios = getAllScenario(startedGame);
        assert.equal(scenarios.length, 3);
    })

    it('Un joueur peut choisir un scénario', function(){
        game = chooseScenarioFinal(startedGame, startedGame.mediums[0].username, 0);
        
        let medium = game.mediums.find(medium => medium.username == startedGame.mediums[0].username);
        
        assert.isObject(medium.scenarioFinalChoose);
        
    })

    it('Un joueur peut choisir un scénario - scenario faux', function(){
        expect(function(){
            chooseScenarioFinal(startedGame, startedGame.mediums[0].username, 4);
        }).to.throw();
    })

    it('Savoir si tous les mediums ont choisis un scenario', function(){
        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[0].username, 0);
        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[1].username, 0);
        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[2].username, 0);
        
        assert.isTrue(allMediumHasChooseScenario(startedGame));
    })

    it('Savoir si tous les mediums ont choisis un scenario - 1 medium n\'a pas choisi', function(){
        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[0].username, 0);
        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[1].username, 0)
        
        assert.isFalse(allMediumHasChooseScenario(startedGame));
    })

    it('Les mediums ont gagné', function(){


        let scenarios = getAllScenario(startedGame);
        let scenario_gagnant = startedGame.scenario_final;

        let index = scenarios.indexOf(scenario_gagnant);     

        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[0].username, index);
        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[1].username, index);
        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[2].username, 0);
        
        assert.isTrue(mediumHasWin(startedGame));
    })

    it('Les mediums ont perdus', function(){

        let scenarios = getAllScenario(startedGame);
        let scenario_gagnant = startedGame.scenario_final;

        let index = scenarios.indexOf(scenario_gagnant);     

        let otherIndex = 0;
        if(index == 0)
            otherIndex = 1
        else if(index == 1)
            otherIndex = 2
        else
            otherIndex = 0;


        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[0].username, index);
        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[1].username, otherIndex);
        startedGame = chooseScenarioFinal(startedGame, startedGame.mediums[2].username, otherIndex);
        
        assert.isFalse(mediumHasWin(startedGame));
    })
})

if(config.app.mode == 'dev'){

    describe('Test des fonctions privées', function () {

        beforeEach(function(){
            newGame = join(this.game, 'joueur1');
            newGame = setReady(newGame, newGame.players[0].username, true);
            for(i = 2; i < 4; i++){
                idJoueur = 'joueur' + i;
                newGame = join(newGame, idJoueur);
                newGame = setReady(newGame, newGame.players[i-1].username, true);
            }
            startedGame = init(newGame);
        });


        it('type du joueur', function(){
            assert.equal(getPlayerType(startedGame, startedGame.mediums[0].username), "medium");
            assert.equal(getPlayerType(startedGame, startedGame.ghost.username), "ghost");
        })  

        it('type du joueur ne peux pas etre retourné', function(){
            expect(function(){
                getPlayerType(startedGame, "inexistant")
            }).to.throw();
        }) 

        it('le joueur peut jouer car c\'est son tour', function(){
            assert.isTrue(canPlay(startedGame, startedGame.mediums[0].username))
        });

        it('le joueur ne peut pas jouer', function(){
            startedGame = play(startedGame, startedGame.mediums[0].username, startedGame.persos[0])
            assert.isTrue(canPlay(startedGame, startedGame.mediums[0].username))
        });
    })
    
}