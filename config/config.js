require('dotenv').config();

module.exports = {
    app : {
        port : process.env.APP_PORT || 8080
    },
    db : {
        host     : process.env.DB_HOST     || 'localhost',
        port     : process.env.DB_PORT     || '3306',
        database : process.env.DB_DATABASE || 'db',
        username : process.env.DB_USERNAME || 'root',
        password : process.env.DB_PASSWORD || ''
    }
}
