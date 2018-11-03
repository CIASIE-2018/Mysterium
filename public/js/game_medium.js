function initBoard(socket){
    new Swiper('.game_plateau .swiper-container', {
        slidesPerView : 6,
        spaceBetween : 30
    });

    let firstCardId = $($('.game_plateau .swiper-slide')[0]).data('idcard');
    setScenarioCard(firstCardId);

    $('.game_plateau .swiper-slide').on('click', function(e){
        let cardId = $(e.currentTarget).data('idcard');
        $('input[name=selected-card]').val(cardId);
        setScenarioCard(cardId);
    });
    $('#selected_card_form').on('submit', function(e){
        e.preventDefault();
        let cardId = $('input[name=selected-card]').val();
        socket.emit('choice_card', parseInt(cardId));
    });
}

function setScenarioCard(cardId){
    $('.card_selected_content img').attr('src', `/images/cards/${cardId}.png`);
}

function initHand(){
    if($('.cards_hand_list_item img').length > 0){
        let firstCardId = $($('.cards_hand_list_item img')[0]).data('idcard');
        setHandCard(firstCardId);
        $('.cards_hand_list_item img').on('click', function(e){
            let cardId = $(e.currentTarget).data('idcard');
            setHandCard(cardId);
        });
    }else{
        setHandCard("default");
    }
}

function setHandCard(cardId){
    let imgElement = $('.cards_hand .cards_hand_detail img');
    imgElement.fadeOut('fast', function() {
        imgElement.attr('src', `/images/cards/${cardId}.png`);
        imgElement.fadeIn('fast', function(){
            imgElement.magnify({
                src : imgElement.attr('src')
            });
        });
    });
}
    

$(function(){

   let socketGame = io('/game');

    initBoard(socketGame);
    initHand();

    socketGame.on('messages', function(html){
        $('.messages').html(html);
    });

    socketGame.on('resetSendMessage', function(){
        $('.messages p').remove();
    });

    socketGame.on('player_list', function(html){
        $('.player_list').html(html);
    });

    socketGame.on('hand', function(html){
        $('.cards_hand_list').html(html);
        initHand();
    });

    socketGame.on('board', function(html){
        $('.game_plateau').html(html);
        initBoard(socketGame);
    });
});