const config     = require('./config/config');

const express    = require('express');
const app        = express();
const twig       = require('twig');
const server     = require('http').createServer(app);
const io         = require('socket.io').listen(server);

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
/*******************/

server.listen(config.app.port, () => {
    console.log(`Server run on port ${config.app.port}`);
});


/***** WEBSOCKETS SOCKET.IO *****/
io.sockets.on('connection', socket => {
    console.log(`connection ${socket.id} on a une connection au server`);
});
/********************************/


