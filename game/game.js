let { produce } = require('immer'); /* https://github.com/mweststrate/immer */

exports.join = (baseGame, playerId) => {
    let newGame = produce(baseGame, draftGame => {
        draftGame.players.push({
            role      : null,
            id        : playerId,
            ready     : false,
            state     : 0,
            visions   : [],
            hasPlayed : false
        });
    });
    return newGame;
}