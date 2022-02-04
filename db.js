const {Sequelize} = require('sequelize');

module.exports = new Sequelize(
    'HatoriChise',
    'worldlolxd121',
    'world1147856',
    {
        host: '5.188.77.26',
        port: '6432',
        dialect: 'postgres'
    }
)