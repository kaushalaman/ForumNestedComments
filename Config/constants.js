'use strict';

const TYPE = {
    POST: 0,
    COMMENT: 1
};

const STATUS_CODE = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    NOT_FOUND: 404
};

const DB = {
    PORT: 3306
};

const LANGUAGES = {
    EN: 'English'
};

const swaggerDefaultResponseMessages = [
    {code: 200, message: 'OK'},
    {code: 400, message: 'Bad Request'},
    {code: 401, message: 'Unauthorized'},
    {code: 404, message: 'Data Not Found'},
    {code: 500, message: 'Internal Server Error'}
];

const DEFAULT_HAPI_PLUGIN = {
    'hapi-swagger': {
        payloadType: 'form',
        responseMessages: swaggerDefaultResponseMessages
    }
};

const DEFAULT_HAPI_PLUGIN_JSON = {
    'hapi-swagger': {
        payloadType: 'json',
        responseMessages: swaggerDefaultResponseMessages
    }
};

module.exports = {
    STATUS_CODE,
    DB,
    LANGUAGES,
    swaggerDefaultResponseMessages,
    DEFAULT_HAPI_PLUGIN,
    DEFAULT_HAPI_PLUGIN_JSON,
    TYPE
};
