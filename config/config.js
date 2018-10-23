require('dotenv').config();

module.exports = {
    app : {
        port : process.env.APP_PORT || 8080,
        mode : process.env.APP_MODE || 'prod'
    },
    db : {
        host     : process.env.DB_HOST     || 'mongodb:27017',
        database : process.env.DB_DATABASE || 'mysterium'
    },
    directory : {
        images   : __dirname + '/../public/images'
    }
}
