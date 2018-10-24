$(function(){
    let socket = io('/chat');//charge le module sur le client = connection au socket

    $("#msg_form").submit(function (event) {
        event.preventDefault();
        if($("#msg_writing").val() != '')
        {
            socket.emit("chat message",$("#msg_writing").val());
            $("#msg_writing").val('').focus();
        }
        return false;
    });

    socket.on('chat message', (msg) => {
        $('#msg_box').append($('<li>').html(msg));
        $('#msg_box').animate({scrollTop : $('#msg_box li:last-child').offset().top }, 500);
    });
});