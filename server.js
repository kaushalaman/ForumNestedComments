'use strict';

const Hapi = require('hapi'),
    debug = require('debug')('server'),
    config = require('./Config'),
    Plugins = require('./Plugins'),
    Routes = require('./Routes'),
    Models = require('./Models'),
    server = new Hapi.Server();

let os = require('os');
os.tmpdir = os.tmpdir;

/**
 * @type {{port: (*|number), host, routes: {cors: {origin: string[]}}}}
 * Connection Options Object
 */

let connectionOptions = {
    port: config.serverConfig.PORT,
    host: config.serverConfig.HOST,
    routes: {
        cors: {origin: ['*']}
    }
};

server.connection(connectionOptions);

if (!process.env.NODE_ENV) {
    process.env.NODE_ENV = "LOCAL";
}

server.register(Plugins, (error) => {
    if (error) {
        server.error('Error while loading Plugins : ' + error);
    } else {
        server.log('info', 'Plugins Loaded');
    }
});

Routes.forEach((api) => {
    server.route(api);
});
server.views({
    engines: {
        html: require('handlebars')
    },
    relativeTo: __dirname,
    path: './Views'
});

/**
 * Authenticate DB Connection and sync all tables in SQL Database
 */
Models.sequelize.authenticate().then((authenticateTask) => {
    debug('Server Connection to SQL DB is authenticated %s', server.info.uri);

    Models.sequelize.sync({force: false}).then((syncTask) => {
        server.start((error) => {
            if (error) {
                throw error;
            }
            else {
                Models.sequelize.query("ALTER TABLE forumThreads AUTO_INCREMENT=1;").spread(function (results, metadata) {
                    debug('Server running at: %s', server.info.uri);
                });
            }
        });
    }).catch(function (error) {
        debug("<=======================================DB Sync Error:===================================> %s", JSON.stringify(error));
        process.exit(1);
    });
}).catch((error) => {
    debug("Error While connecting MySql: %s", JSON.stringify(error));
    process.exit(1);
}).done();







