//fichier qui contient toutes les erreurs qui peuvent être renvoyées par l'appli

class MaxPlayerReachedError extends Error{
    constructor(){
        super('Le nombre maximum de joueur pour cette partie est déjà atteint')
    }
}

class PlayerAlreadyInGameError  extends Error{
    constructor(){
        super('Vous êtes déjà dans la parti')
    }
}

class NotEnoughPlayerError  extends Error{
    constructor(){
        super('Il n\'y a pas asser de joueurs')
    }
}

class NotAllAreReady  extends Error{
    constructor(){
        super('Tout le monde n\'est pas prêt')
    }
}

class GameAlreadyStarted extends Error{
    constructor(){
        super('Le jeu est déjà lancé')
    }
}

module.exports = {
    PlayerAlreadyInGameError,
    MaxPlayerReachedError,
    NotEnoughPlayerError,
    NotAllAreReady,
    GameAlreadyStarted
}