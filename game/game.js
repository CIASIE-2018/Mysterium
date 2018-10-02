let { produce } = require('immer'); /* https://github.com/mweststrate/immer */

exports.join = (baseGame, role, playerId) => {
    let newGame = produce(baseGame, draftGame => {
        draftGame.players.push({
            role      : role,
            id        : playerId,
            ready     : false,
            state     : 0,
            visions   : [],
            hasPlayed : false
        });
    });
    return newGame;
}