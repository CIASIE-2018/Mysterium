const config     = require('./config/config');

const express    = require('express');
const app        = express();
const twig       = require('twig');
const server     = require('http').createServer(app);
const io         = require('socket.io').listen(server);

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

/*******************/


server.listen(config.app.port, () => {
    console.log(`Server run on port ${config.app.port}`);
});


/***** WEBSOCKETS SOCKET.IO *****/
io.sockets.on('connection', socket => {
    console.log(`connection ${socket.id}`);
});
/********************************/


