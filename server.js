const config     = require('./config/config');

const express    = require('express');
const app        = express();
const twig       = require('twig');
const server     = require('http').createServer(app);
const io         = require('socket.io').listen(server);

<<<<<<< HEAD
const uniqid       = require('uniqid');
const moment       = require('moment');
const session      = require('express-session');

const bodyParser = require('body-parser')
 
=======
const bodyParser = require('body-parser');

const session    = require('express-session');

const cookieParser     = require('cookie-parser');
const expressValidator = require('express-validator');
const flash            = require('connect-flash');
const passport         = require('passport');
const mongoose         = require('mongoose');


/***** MONGODB *****/
mongoose.connect('mongodb://localhost/loginapp', {
    useCreateIndex: true,
    useNewUrlParser: true
});
/*****************************/

>>>>>>> master
app.io = io;

/***** VIEW CONFIGURATION *****/
app.set('views', __dirname + '/ressources/views');
app.set('view engine', 'twig');

if(config.app.mode == 'dev')
    twig.cache(false);
/*****************************/


/***** MIDDLEWARES *****/
app.use(session({
    secret: 'mysterium2018',
    saveUninitialized: true,
    resave: true
}));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));
<<<<<<< HEAD
app.use('/', require('./routes/routes'));
app.use(session({
    secret : 'Mysterium 2018'
}));
=======


app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        let namespace = param.split('.')
        , root    = namespace.shift()
        , formParam = root;
  
      while(namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param : formParam,
        msg   : msg,
        value : value
      };
    }
}));

app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
  });

  app.use('/', require('./routes/userRouter'));

  app.use('/', (req, res, next) => {
    req.isAuthenticated() ? next() : res.redirect('/login');
  }, require('./routes/gameRouter'));

>>>>>>> master
/*******************/


server.listen(config.app.port, () => {
    console.log(`Server run on port ${config.app.port}`);
});


/***** WEBSOCKETS SOCKET.IO *****/
io.sockets.on('connection', (socket) => {
    console.log('Nouvelle utilisateur connecté')

    socket.on('chat message', (data) => {
        let msg_time = moment().format('HH:mm:ss');
        
        let msg = {
            id      : msg_time,
            content : moment(msg_time,moment.HTML5_FMT.TIME).format('HH:mm')+"  <span class='pseudo'>"+data.author +"</span>  :   "+ data.msg_content
        }
        io.emit('chat message',msg.content);
        if(!req.app.session.messages){
            req.app.session.messages = {};
        }
        req.app.session.messages[msg.id] = msg;
    });

    //chaque socket declenchant l'ev nouvel utilisateur se verra attribuer un pseudo
    socket.on('nouvel utilisateur', (player_id) => {
        
        if(!app.session.players){ // si il n'y a pas encore de joueurs, on crée lattribut pour la session
            app.session.players = {};
        }
        app.session.players[player_id] = player_id;

        
        /**if(Object.keys(messages).length > 0){
            for(let m in messages){
                socket.emit('chat message', messages[m].content);
            }
        } */
        socket.emit('bienvenue', "Vous entrez dans le salon de chat sous le nom <span class='pseudo'>" + usr.name + "</span>");
        socket.broadcast.emit('bienvenue', "<span class='pseudo'>"+usr.name +"</span> entre dans le salon de chat")
    });

    socket.on('disconnect',() => {
        console.log("----------------------------------------");
        socket.disconnect(true);
    })
});
/********************************/


