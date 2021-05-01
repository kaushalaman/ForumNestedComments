'use strict';

const constants = require("./constants");

const local = {
    dbName: 'forum',
    dbUsername: 'root',
    dbPass: 'localdb12'
};

const option = {
    dialect: 'mysql',
    host: '0.0.0.0',
    port: 3306,
    dialectOptions: {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        multipleStatements: true,
        useUTC : false
    },
    timezone: 'Asia/Kolkata',
};

const sqlDbObj = {
    local: local
};

let SQL_DB_OBJ = sqlDbObj.local;

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "LOCAL";
}

const sql = {
    OBJ: SQL_DB_OBJ,
    port: constants.DB.PORT
};


module.exports = {
    sql: sql,
    option: option
};
