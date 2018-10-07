const config     = require('./config/config');

let express      = require('express');
let app          = express();
let server       = require('http').createServer(app);
let twig         = require('twig');
let io           = require('socket.io').listen(server);


/***** VIEW CONFIGURATION *****/
app.set('views', __dirname + '/ressources/views');
app.set('view engine', 'twig');

if(config.app.mode == 'dev')
    twig.cache(false);
/*****************************/


/***** ROUTES *****/
app.use(express.static(__dirname + '/public'));
require('./routes/routes')(app);
/*******************/


server.listen(config.app.port, () => {
    console.log(`Server run on port ${config.app.port}`);
});


/***** WEBSOCKETS SOCKET.IO *****/
io.sockets.on('connection', socket => {
    console.log(`connection ${socket.id} on a une connection au server`);
});
/********************************/