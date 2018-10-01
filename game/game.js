let { produce } = require('immer'); /* https://github.com/mweststrate/immer */

exports.join = (baseGame, playerId) => {
    let newGame = produce(baseGame, draftGame => {
        draftGame.players.push(playerId);
    });
    return newGame;
}