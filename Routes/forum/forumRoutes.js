'use strict';

const ForumController = require('../../Controllers').forum;
const config = require("../../Config");
const CONSTANT = config.constants;
const STATUS_MSG = config.statusMessages;
const util = require("../../Utils/util");
const Joi = require('joi');
const DEFAULT_HAPI_PLUGIN = CONSTANT.DEFAULT_HAPI_PLUGIN;
const routePrefix = '/api/v1/';
const defaultTags = ['api', 'forum'];

module.exports = [
    {
        method: 'POST',
        path: routePrefix + 'post/add',
        config: {
            auth: false,
            description: 'Add POST',
            tags: defaultTags,
            handler: function (request, reply) {
                let payloadData = request.payload;
                ForumController.addPost(payloadData, function (error, success) {
                    if (error) {
                        return reply(error);
                    }
                    else {
                        return reply(util.sendSuccess(STATUS_MSG.SUCCESS.CREATE_POST, success)).code(CONSTANT.STATUS_CODE.CREATED);
                    }
                });
            },
            validate: {
                payload: {
                    title: Joi.string().required().trim(),
                    description: Joi.string().required().trim()
                },
                failAction: util.failActionFunction
            },
            plugins: DEFAULT_HAPI_PLUGIN
        }
    },
    {
        method: 'POST',
        path: routePrefix + 'comment/add',
        config: {
            auth: false,
            description: 'Add Comment',
            tags: defaultTags,
            handler: function (request, reply) {
                let payloadData = request.payload;
                ForumController.addComment(payloadData, function (error, success) {
                    if (error) {
                        return reply(error);
                    }
                    else {
                        return reply(util.sendSuccess(STATUS_MSG.SUCCESS.CREATE_COMMENT, success)).code(CONSTANT.STATUS_CODE.CREATED);
                    }
                });
            },
            validate: {
                payload: {
                    id: Joi.number().required(),
                    description: Joi.string().required().trim()
                },
                failAction: util.failActionFunction
            },
            plugins: DEFAULT_HAPI_PLUGIN
        }
    },
    {
        method: 'GET',
        path: routePrefix + 'posts/get',
        config: {
            auth: false,
            description: 'Get Posts',
            tags: defaultTags,
            handler: function (request, reply) {
                let queryData = request.query;
                ForumController.fetchPosts(queryData, function (error, success) {
                    if (error) {
                        return reply(util.sendError(error));
                    } else {
                        return reply(util.sendSuccess(STATUS_MSG.SUCCESS.FETCH_DATA, success)).code(CONSTANT.STATUS_CODE.OK);
                    }
                });
            },
            validate: {
                query: {
                    limit: Joi.number().integer().required(),
                    offset: Joi.number().integer().optional()
                },
                failAction: util.failActionFunction
            },
            plugins: DEFAULT_HAPI_PLUGIN
        }
    },
    {
        method: 'GET',
        path: routePrefix + 'comments/get',
        config: {
            auth: false,
            description: 'Get Comments',
            tags: defaultTags,
            handler: function (request, reply) {
                let queryData = request.query;
                ForumController.fetchComments(queryData, function (error, success) {
                    if (error) {
                        return reply(util.sendError(error));
                    } else {
                        return reply(util.sendSuccess(STATUS_MSG.SUCCESS.FETCH_DATA, success)).code(CONSTANT.STATUS_CODE.OK);
                    }
                });
            },
            validate: {
                query: {
                    id: Joi.number().integer().required(),
                    limit: Joi.number().integer().optional(),
                    offset: Joi.number().integer().optional()
                },
                failAction: util.failActionFunction
            },
            plugins: DEFAULT_HAPI_PLUGIN
        }
    }
]