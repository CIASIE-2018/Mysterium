let socket = io();//charge le module sur le client = connection au socket

let pseudo = prompt('Quel est votre pseudo pour cette session ?')
socket.emit('nouvel utilisateur', pseudo);

$("#msg_form").submit(function (event) {
    event.preventDefault();
    socket.emit("chat message",{// transmission du message avec son contenu et son auteur
        msg_content : $("#msg_writing").val(),
        author : pseudo,
    })
    $("#msg_writing").val('').focus();
    return false;
});

socket.on('chat message', (msg) => {
    $('#msg_box').append($('<li>').html(msg));
});

//message a afficher a la connexion d'un joueur
socket.on ('bienvenue', (msg) => {
    $('#msg_box').append($('<li>').html(msg));
});