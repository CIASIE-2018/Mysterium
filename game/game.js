let { produce } = require('immer'); /* https://github.com/mweststrate/immer */

exports.game = {
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
    ],
}

exports.join = (baseGame, playerId) => {
    let newGame = produce(baseGame, draftGame => {
        draftGame.players.push(playerId);
    });
    return newGame;
}