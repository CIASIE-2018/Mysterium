$(function(){
    let socket = io('/chat');//charge le module sur le client = connection au socket

    $("#msg_form").submit(function (event) {
        event.preventDefault();
        socket.emit("chat message",{// transmission du message avec son contenu et son auteur
            msg_content : $("#msg_writing").val(),
            author : username,
        })
        $("#msg_writing").val('').focus();
        return false;
    });

    socket.on('chat message', (msg) => {
        $('#msg_box').append($('<li>').html(msg));
    });
});