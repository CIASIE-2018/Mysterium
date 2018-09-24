const config = require('./config/config');

let app    = require('express')();
let server = require('http').createServer(app);
let io     = require('socket.io').listen(server);
let fs     = require('fs');

app.get('/', (req, res) => {
    fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
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