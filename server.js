const config     = require('./config/config');

const express    = require('express');
const app        = express();
const twig       = require('twig');
const server     = require('http').createServer(app);
const io         = require('socket.io').listen(server);

const uniqid       = require('uniqid');
const moment       = require('moment');
const session      = require('express-session');

const bodyParser = require('body-parser')
 
app.io = io;

/***** VIEW CONFIGURATION *****/
app.set('views', __dirname + '/ressources/views');
app.set('view engine', 'twig');

if(config.app.mode == 'dev')
    twig.cache(false);
/*****************************/


/***** MIDDLEWARES *****/
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(__dirname + '/public'));
app.use('/', require('./routes/routes'));
app.use(session({
    secret : 'Mysterium 2018'
}));
/*******************/

server.listen(config.app.port, () => {
    console.log(`Server run on port ${config.app.port}`);
});


/***** WEBSOCKETS SOCKET.IO *****/
io.sockets.on('connection', (socket) => {
    console.log('Nouvelle utilisateur connecté')

    let usr = {};

    socket.on('chat message', (data) => {
        let msg_time = moment().format('HH:mm:ss');
        
        let msg = {
            id      : msg_time,
            content : moment(msg_time,moment.HTML5_FMT.TIME).format('HH:mm')+"  <span class='pseudo'>"+data.author +"</span>  :   "+ data.msg_content
        }
        io.emit('chat message',msg.content);
        messages[msg.id] = msg;
    });

    //chaque socket declenchant l'ev nouvel utilisateur se verra attribuer un pseudo
    socket.on('nouvel utilisateur', (pseudo) => {
        usr.name = pseudo;
        usr.id = uniqid();
        users[usr.id] = usr;
        
        if(Object.keys(messages).length > 0){
            for(let m in messages){
                socket.emit('chat message', messages[m].content);
            }
        }
        socket.emit('bienvenue', "Vous entrez dans le salon de chat sous le nom <span class='pseudo'>" + usr.name + "</span>");
        socket.broadcast.emit('bienvenue', "<span class='pseudo'>"+usr.name +"</span> entre dans le salon de chat")
    });

    socket.on('disconnect',() => {
        console.log("----------------------------------------");
        socket.disconnect(true);
    })
});
/********************************/


