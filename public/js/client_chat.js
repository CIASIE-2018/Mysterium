$(function(){
    let socket = io('/chat');//charge le module sur le client = connection au socket

    $("#msg_form").submit(function (event) {
        event.preventDefault();
        if($("#msg_writing").val().trim() != '')
        {
            socket.emit("chat message",$("#msg_writing").val());
            $("#msg_writing").val('').focus();
        }
        return false;
    });

    socket.on('chat message', (msg) => {
        $('#msg_box').append($('<li>').html(msg));
        $('#msg_box').scrollTop($('#msg_box li:last-child').offset().top);
    });
});

$('#hideChat').click (() => {
    $('#chat_box').slideUp();
    if($('#chat_box').css('display') == 'none'){
        $('#chat_box').slideDown();
    }
})