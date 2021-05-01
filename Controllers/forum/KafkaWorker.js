'use strict';

const Async = require('async');
const Models = require("../../Models");
const LIMIT = 10;

let insertMappings = function (kafkaData, callback) {
    let ancestorsCount = 0;
    let ancestorsData = [];
    Async.doWhilst(function (internalCb) {
        Async.series([
            function (cbb) {
                Models.ThreadsTree.findAndCountAll({
                    where: {
                        'descendant': kafkaData.ancestorId
                    },
                    attributes: ['ancestor', 'level']
                }).then(function (data) {
                    if (data && data.count) {
                        ancestorsCount = data.count;
                        data.rows.forEach(function (obj) {
                            if (obj.dataValues) {
                                let tempObj = Object.assign({}, obj.dataValues);
                                tempObj.descendant = kafkaData.descendantId;
                                tempObj.level += 1;
                                ancestorsData.push(tempObj);
                            }
                        });
                    }
                    ancestorsData.push({
                        "ancestor": kafkaData.ancestorId,
                        "descendant": kafkaData.descendantId,
                        "level": 1
                    });
                    return cbb();
                }).catch(function (error) {
                    return cbb(error);
                });
            },
            function (cbb) {
                if (!ancestorsData.length) {
                    return cbb();
                }
                Models.ThreadsTree.bulkCreate(ancestorsData).then(function (data) {
                    return cbb();
                }).catch(function (error) {
                    return cbb(error);
                });
            }
        ], function (error) {
            return internalCb(error);
        });
    }, function () {
        return ancestorsCount == LIMIT;
    }, callback);
}

module.exports = {
    insertMappings
}