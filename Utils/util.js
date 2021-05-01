"use strict";
const config = require('../Config');
const STATUS_MSG = config.statusMessages;
const Boom = require('boom');


const failActionFunction = function (request, reply, source, error) {

    let customErrorMessage = '';

    if (error.output.payload.message.indexOf("[") > -1) {

        customErrorMessage = error.output.payload.message.substr(error.output.payload.message.indexOf("["));

    } else {

        customErrorMessage = error.output.payload.message;

    }

    customErrorMessage = customErrorMessage.replace(/"/g, '');

    customErrorMessage = customErrorMessage.replace('[', '');

    customErrorMessage = customErrorMessage.replace(']', '');

    error.output.payload.message = customErrorMessage;

    delete error.output.payload.validation;

    return reply(error);
};

/**
 *
 * @param successMsg
 * @param data
 * @returns {*}
 */

let sendSuccess = function (successMsg, data) {
    successMsg = successMsg || STATUS_MSG.SUCCESS.DEFAULT.message;
    if (typeof successMsg == 'object' && successMsg.hasOwnProperty('statusCode') && successMsg.hasOwnProperty('message')) {
        return {statusCode: successMsg.statusCode, message: successMsg.message, data: data || {}};
    } else {
        return {statusCode: 200, message: successMsg, data: data || {}};
    }
};

/**
 *
 * @param error
 * @returns {*}
 */

let sendError = function (error) {

    if (error["name"]) {

        if (error["name"] === "SequelizeUniqueConstraintError") {

            let attributes = [];

            for (let i in error["fields"]) attributes.push(i);

            let errorMsg;

            if (attributes[0] === "socialID") {

                errorMsg = "Already registered with this facebookId or emailId. It must be unique.";
            }
            else if (attributes[0] === "uniqueRegion") {

                errorMsg = "Region with this name has been already created. Please enter different region name.";

            }
            else if (attributes[0] === "phoneNumber") {
                errorMsg = "Already registered with this Phone number. It must be unique.";
            }
            else {

                errorMsg = "Already registered with this " + attributes[0].toProperCase() + ". It must be unique.";
            }

            let returnErrMsg = {
                statusCode: 400,
                message: errorMsg,
                type: 'UNIQUE_VALIDATION_ERROR'
            };

            return returnErrMsg;
        }
        if (error["name"] === "SequelizeValidationError") {

            let errorMsg = error["errors"][0]["message"].toProperCase();

            let returnErrMsg = {
                statusCode: 400,
                message: errorMsg,
                type: 'VALIDATION_ERROR'
            };

            return returnErrMsg;
        }
        if (error["name"] === "SequelizeDatabaseError") {

            let errorMsg = error["message"];

            let returnErrMsg;

            if (errorMsg.indexOf("ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") !== -1) {

                returnErrMsg = {
                    statusCode: 400,
                    message: "Please enter valid content.",
                    type: 'DATABASE_ERROR'
                };

            }
            else {

                returnErrMsg = {
                    statusCode: 400,
                    message: errorMsg,
                    type: 'DATABASE_ERROR'
                };
            }

            return returnErrMsg;

        }
        else {

            if (typeof error === 'object') {
                return error;
            }
            else {
                return Boom.create(400, error);
            }

        }
    }
    else {

        if (typeof error === 'object') {
            return error;
        }
        else {
            return Boom.create(400, error);
        }
    }
};

module.exports = {
    sendSuccess,
    sendError,
    failActionFunction
};

