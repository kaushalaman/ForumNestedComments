"use strict";

const fs = require("fs"),
    path = require("path"),
    config = require('../Config'),
    Sequelize = require("sequelize");


const sqlObj = config.dbConfig.sql.OBJ;
const options = config.dbConfig.option;

let sequelize = new Sequelize(sqlObj.dbName, sqlObj.dbUsername, sqlObj.dbPass, options);
let db = {};

fs
    .readdirSync(__dirname)
    .filter(function (file) {
        return (file.indexOf(".") !== 0) && (file !== "index.js");
    })
    .forEach(function (file) {
        let model = sequelize["import"](path.join(__dirname, file));
        db[model.name] = model;
    });

Object.keys(db).forEach(function (modelName) {

    if ("associate" in db[modelName]) {

        db[modelName].associate(db);

    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;


