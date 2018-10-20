const { createGame, init, join,giveVisionsToMedium, verifyChoicePlayers, play, setReady, allIsReady, getInformations } = require('./game');

let game = createGame();
game = join(game, "johan");
game = join(game, "anthony");
game = join(game, "alex");
game = join(game, "benji");

//tous les joueurs sont reeady
game = setReady(game, "johan");
game = setReady(game, "anthony");
game = setReady(game, "alex");
game = setReady(game, "benji");

//init ju jeux
game = init(game);

//le fantome donne des cartes visions au joueurs
game = giveVisionsToMedium(game, game.mediums[0].username, [game.ghost.hand[0]]);
game = giveVisionsToMedium(game, game.mediums[1].username, [game.ghost.hand[0]]);
game = giveVisionsToMedium(game, game.mediums[2].username, [game.ghost.hand[0]]);

//les joueurs choisisent une carte du plateau   
game = play(game, game.mediums[0].username, game.persos[0]);
game = play(game, game.mediums[1].username, game.persos[0]);
game = play(game, game.mediums[2].username, game.persos[0]);

//verifie si les joueurs ont choisis la bonne carte sur le plateau 
//en fonction de leur scenario
game = verifyChoicePlayers(game);


//console.log(game);

console.log(getInformations(game, game.ghost.username));