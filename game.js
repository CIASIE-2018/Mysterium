
let errors = require('./Error.js');

let uniqid = require('uniqid');
let fs     = require('fs');
let helpers = require('./helpers');

const MEDIUM_STATE_NOTHING = 0;
const MEDIUM_STATE_PERSO   = 1;
const MEDIUM_STATE_LIEU    = 2;
const MEDIUM_STATE_ARME    = 3;

class Game {
    constructor(max_player = 7, max_turn = 7, difficulte = 0){
        this.id         = uniqid();
        this.max_player = max_player;
        this.players    = [];
        this.max_turn   = max_turn;
        this.turn       = 0;
        this.started    = false;
        this.difficulte = difficulte;
        this.persos     = [];
        this.lieux      = [];
        this.armes      = [];
    }

    join(playerId){

        let playerAlreadyInGame = this.players.find(function(player) {
            return player.id ==playerId;
        })

        if(!playerAlreadyInGame){

            if(!this.isFull && !this.started){
                this.players.push({
                    id    : playerId,
                    ready : false
                });
            }else{
                throw new errors.MaxPlayerReachedError();
            }
        }else{
            throw new errors.PlayerAlreadyInGameError();
        }
            
    }

    setReady(playerId, ready = true){
        let player = this.players.find(player => {
            return player.id == playerId;
        });
        player.ready = ready;
    }


    init_roles(){      
        //Attribution aleatoire role a chaque joueur
        let aleaGhost = Math.floor(Math.random() * this.players.length);
        for(let i =0 ; i< this.players.length ; i++){
            if(i == aleaGhost){
                this.players[i].role = 'ghost';
                this.players[i].hand = [];
            }else{
                this.players[i].role    = 'medium';
                this.players[i].state   = 0;
                this.players[i].visions = [];
            }
        }
    }

    generate_cards(){
        //Generation cartes du jeu
        let nb_scenarios = this.mediums.length + (this.difficulte == 0 ? 2 : (this.difficulte == 1 ? 3 : 0));
        let persos  = fs.readdirSync(__dirname + '/assets/images/personnage');
        this.persos = helpers.shuffle(persos).slice(0, nb_scenarios);

        let lieux  = fs.readdirSync(__dirname + '/assets/images/lieux');
        this.lieux = helpers.shuffle(lieux).slice(0, nb_scenarios);

        let armes  = fs.readdirSync(__dirname + '/assets/images/armes');
        this.armes = helpers.shuffle(armes).slice(0, nb_scenarios);
    }

    generate_scenarios(){
        //Generation des scenarios en fonction des cartes du jeu
        let scenarios = [];
        for(let i=0; i<this.persos.length ; i++){
            scenarios.push({
                perso : this.persos[i],
                lieu  : this.lieux[i],
                arme  : this.armes[i]
            })
        }
        return scenarios;
    }

    init_scenarios(){
        if(g.started == true){
            //Attribuer un scenario a chaque joueur + scenario final
            let scenarios             = helpers.shuffle(this.generate_scenarios());
            let index_scenarios_final = Math.floor(Math.random() * this.mediums.length);

            for(let i=0; i < this.mediums.length ; i++){
                if(i == index_scenarios_final)
                    this.scenario_final = scenarios[i];
                this.mediums[i].scenario = scenarios[i];
            }
        }
    }

    init_visions(){
        if(g.started){
            //Creer la main du fantome
            this.visions    = helpers.shuffle(fs.readdirSync(__dirname + '/assets/images/visions'));
            this.ghost.hand = this.visions.slice(0, 7);
            this.visions    = this.visions.filter(el => !this.ghost.hand.includes(el));
        }
    }

    init(){
        if(this.allIsReady){
            if(this.players.length >=3){
                this.started = true;
                this.init_roles();
                this.generate_cards();
                this.init_scenarios();
                this.init_visions();
            }else{
                throw new errors.NotEnoughPlayerError();
            }
        }else{
            throw new errors.NotAllAreReady();
        }
    }

    improveStateMedium(playerId){
        let player = this.players.find(player => {
            return player.id == playerId;
        });
        if(player.role == 'medium' && player.state < MEDIUM_STATE_ARME){
            player.state++;
            player.visions = [];
        }
    }


    get isFull(){
        return this.max_player == this.players.length;
    }

    get finished(){
        return this.max_turn == this.turn;
    }

    get mediums(){
        return this.players.filter(player => player.role == 'medium');
    }

    get ghost(){
        return this.players.find(player => player.role == 'ghost');
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
}

module.exports = Game


let g = new Game();

let user1 = uniqid();
let user2 = uniqid();
let user3 = uniqid();


g.join(user1);
g.join(user2);
g.join(user3);

g.setReady(user1, true);
g.setReady(user2, true);
g.setReady(user3, true);

g.init();

console.log(g);