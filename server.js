const config = require('./config/config');

let express      = require('express');
let app          = express();
let server       = require('http').createServer(app);
let io           = require('socket.io').listen(server);

app.set('views', __dirname + '/ressources/views');
app.set("twig options", {
    allow_async: true,
    strict_variables: false
});

app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
    res.render('game.twig');
});

//Middleware when route not exist
app.use(function(req, res, next){
    res.status(404);
    res.type('txt').send('Not found');
});

server.listen(config.app.port, () => {
    console.log(`Server run on port ${config.app.port}`);
});


io.sockets.on('connection', socket => {
    console.log(`connection ${socket.id}`);
});