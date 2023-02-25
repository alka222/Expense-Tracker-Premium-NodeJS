const Sequelize = require('sequelize');

const sequelize = new Sequelize('expenses', 'root', 'node-database', {
    dialect: 'mysql',
    host: 'localhost'
})

module.exports = sequelize;