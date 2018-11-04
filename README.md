# Pré-requis pour lancer le jeu

### Docker
Assurez-vous d'avoir téléchargé docker, qu'il est bien installé et lancé. Pour cela utilisé la commande ```docker version``` depuis n'importe quel dossier.

# Telechargement du jeu
Placez-vous dans le dossier dans lequel vous souhaitez telecharer le jeu puis ouvrez un terminal de commande et lancer la commande : ```git clone https://github.com/CIASIE-2018/Mysterium.git```

# Installation du jeu
Dans le dossier où vous avez téléchargé le jeu, lancer la commande ```make install```,  cette commande sert à installer tout les modules necessaires au bon fonctionnement du jeu.

# Lancement du jeu
Dans le dossier du jeu, lancez la commande ```make run```, cette commande permet de lancer notre serveur web et compiler notre code scss afin d'avoir un rendu visuel du jeu.

# Connexion au serveur et lancement d'une partie
Pour vous connectez au serveur et lancer une partie, vous aurez besoin de deux navigateurs, un pour lequel vous ouvrirez un onglet standar et un onglet de navigation privée, l'autre avec un onglet standard.
Connectez-vous dans votre barre d'URL à l'adresse http://localhost:3000 Pour arriver sur la page d'accueil.
Une fois sur cette page, vous disposez déjà de trois comptes pour pouvoir lancer une partie :

Nom d'utilisateur    Mot de passe

eee                  eee
rrr                  rrr
ttt                  ttt


Une fois les trois comptes connectés dans les trois onglets ouverts, cliquez sur rejoindre une partie et cliquez sur "Prêt" avec les trois comptes.

# Le jeu

Un horrible crime à été commit, le fantôme de la victime hante encore les lieux. Il vous donnera dans un premier temps de potentiel scenarios du crime que vous devrez élucider. Une fois tout les scénarios trouvés, à vous de trouvez lequel est le bon.

### Les règles du jeu

Chaque compte se voit assigné un rôle aléatoirement ainsi qu'un scenario, vous êtes soit medium, soit fantôme et il ne peut y avoir qu'un seul fantôme. Un scenario final est également choisit parmit les scenarios générés, vous ne pourrez le trouver qu'une fois que tout les médiums auront résolu leur scénario respectif. Vous disposez de 7 tours pour réussir à atteindre le scénario final et le trouver.

##### Médium
Au début du jeu, les médium se voient chacun attribuer un scenario qu'ils ne connaissent pas et doivent deviner grâce a des cartes visions distribuées par le fantôme qui doivent, par les éléments présents sur la carte, vous aider à trouver votre élément de scénario. À chaque élément de scénario trouvé, ils passent au prochain élément, l'ordre étant le suivant : Le criminel -> Lieu du crime -> Arme du crime.

##### Fantôme
Vous êtes le fantôme, votre but et d'aider les médiums à trouver les éléments qui composent les possibles scénario de votre mort. A chaque tour, vous choisirez, en fonction des cartes visions dans votre main et de l'élément de scénario à trouver pour chaque médium, à quel médium vous souhaitez distribuer des cartes. L'élément de scénario à trouver pour chaque médium est indiqué lorsque vous cliquer sur le pseudo d'un joueur.
Vous disposez de 7 cartes visions dans votre main, qui sera remplie à chaque distribution de cartes pour un maximum de 7 cartes en main. 
