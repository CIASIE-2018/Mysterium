/* Gestion liste des mediums */
        
function initPlayerList(mediums, selectedUsernameMedium = null){
    $('.player_list_item').removeClass('selected');
    if(selectedUsernameMedium != null)
        $(`.player_list_item[data-username=${selectedUsernameMedium}]`).addClass('selected');
    else
        $($('.player_list_item')[0]).addClass('selected');
    
    $('.player_list_item').off('click');
    $('.player_list_item').on('click', function(e){
        $('.player_list_item').removeClass('selected');
        $(e.currentTarget).addClass('selected');
        let username = $(e.currentTarget).data('username');
        $('input[name=player-receiver]').val(username);
        let data = mediums[username]; 
        setBoard(data.cards);
        setScenarioCard(data.card);
    });
}

function setBoard(cards){
    let swiper = $('.swiper-container')[0].swiper;
    swiper.removeAllSlides();
    let tab = cards.map(function(card){
        return `
        <div class='swiper-slide'>
            <img src='/images/cards/${card}.png'>
        </div>`
    });
    swiper.addSlide(1,tab);
}

function setScenarioCard(cardId){
    $('.card_selected_content img').attr('src', `/images/cards/${cardId}.png`);
}


/* Gestion main du fantome */

function initHand(socket){
    let firstCardId = $($('.cards_hand_list_item img')[0]).data('idcard');
    setHandCard(firstCardId);
    $('.cards_hand_list_item img').on('click', function(e){
        let cardId = $(e.currentTarget).data('idcard');
        setHandCard(cardId);
    });
    initGhostHandForm(socket);
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


function initGhostHandForm(socket){
    $('#hand_form').on('submit', function(e){
        e.preventDefault();
        let cards = [];
        $('input[name=cards_hand]:checked').each(function(i,card){
            cards.push(parseInt($(card).val()));
        });
        if(cards.length > 0){
            let username = $('input[name=player-receiver]').val();
            socket.emit('send_card_to_medium', {
                receiver : username,
                cards    : cards
            });
        }
    });
}

function initFormFinal(socket){
    $('#hand_form').off('submit');
    $('#hand_form').on('submit', function(e){
        e.preventDefault();
        let cards = [];
        $('input[name=cards_hand]:checked').each(function(i,card){
            cards.push(parseInt($(card).val()));
        });
        if(cards.length > 0){
            socket.emit('send_final_cards', cards);
        }
    });
}

function resetBoard(mediums){
    let infoFirstMedium = mediums[Object.keys(mediums)[0]];
    setBoard(infoFirstMedium.cards);
    setScenarioCard(infoFirstMedium.card);
    $('.player_list_item').removeClass('selected');
    $($('.player_list_item')[0]).addClass('selected');
}

$(function(){
    new Swiper('.game_plateau .swiper-container', {
            slidesPerView : 6,
            spaceBetween : 30
    });

    $.post("/ajax/mediums", function(mediums){
        if(mediums != null){

            let socketGame = io('/game');

            initPlayerList(mediums);
            initHand(socketGame);

            socketGame.on('messages', function(html){
                let element = $(html);
                $('.messages').append(element);
                setTimeout(function(){
                    element.fadeOut();
                }, 3000);
            });

            socketGame.on('player_list', function(html){
                let lastMediumUsernameSelected = $('.player_list_item.selected').data('username');
                $('.player_list').html(html);
                initPlayerList(mediums, lastMediumUsernameSelected);
            });

            socketGame.on('hand', function(html){
                $('.cards_hand_list').html(html);
                initHand(socketGame);
            });

            socketGame.on('mediums', function(m){
                mediums = m;
                resetBoard(mediums);
            });

            socketGame.on('finalScenario', function(html){
                $('.game_plateau').remove();
                $('.card_selected').html(html);
                initFormFinal(socketGame);
            });

            socketGame.on('final_resultat', function(html){
                $('.card_selected').html(html);
            });
        }
    });
});