
'use strict';

const HOST = '0.0.0.0';
const PORT = {
    LOCAL: 3000
};

let MY_PORT = PORT.LOCAL;

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "LOCAL";
}

module.exports = {
    PORT: MY_PORT,
    HOST: HOST
};
