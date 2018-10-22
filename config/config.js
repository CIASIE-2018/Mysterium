require('dotenv').config();

module.exports = {
    app : {
        port : process.env.APP_PORT || 8080,
        mode : process.env.APP_MODE || 'prod'
    },
    db : {
        host     : process.env.DB_HOST     || 'mongo',
        port     : process.env.DB_PORT     || '27017',
        database : process.env.DB_DATABASE || 'docker-node-mongo'
    },
    directory : {
        images   : __dirname + '/../public/images'
    }
}
