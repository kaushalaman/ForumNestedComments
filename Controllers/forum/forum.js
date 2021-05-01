const async = require('async');
const config = require('../../Config');
const CONSTANT = config.constants;
const ERROR_MESSAGE = config.statusMessages.ERROR;
const Models = require("../../Models");
const KafkaWorker = require('./KafkaWorker');
const MAX_LIMIT = 50;

let fetchPosts = function (queryData, callback) {

    queryData.limit = queryData.limit <= MAX_LIMIT ? queryData.limit : MAX_LIMIT;
    queryData.offset = queryData.offset || 0;

    let dataToReturn = [];

    Models.ForumThreads.findAll({
        where: {
            type: CONSTANT.TYPE.POST
        },
        limit: queryData.limit, offset: queryData.offset, order: 'createdAt DESC'
    }).then(function (posts) {
        if (posts && posts.length) {
            posts.forEach(function (p) {
                dataToReturn.push(p.dataValues);
            });
        }
        return callback(null, dataToReturn);
    }).catch(function (error) {
        return callback(error);
    });
}

let fetchComments = function (queryData, callback) {

    queryData.limit = queryData.limit || 10;
    queryData.limit = queryData.limit <= MAX_LIMIT ? queryData.limit : MAX_LIMIT;
    queryData.offset = queryData.offset || 0;

    let criteria = {
        where: {
            ancestor: queryData.id,
            level: 1
        },
        include: [
            {
                model: Models.ForumThreads,
                attributes: ['id', 'text', 'type', 'createdAt', 'updatedAt'],
                paranoid: false
            }
        ],
        limit: queryData.limit, offset: queryData.offset, order: 'createdAt DESC'
    };

    let commentMap = {}, commentData = [];

    async.series([
        function (internalCb) {
            /**
             * First Level Descendent
             * @type {*|number}
             */
            let filter = criteria;
            Models.ThreadsTree.findAll(filter).then(function (data) {
                if (data && data.length > 0) {
                    data.forEach(function (temp) {
                        if (temp.ForumThread && temp.ForumThread.dataValues) {
                            let firstLevelChild = temp.ForumThread.dataValues;
                            firstLevelChild.childComments = [];
                            commentMap[firstLevelChild.id] = firstLevelChild;
                        }
                    });
                }
                return internalCb(null);
            }).catch(function (error) {
                return internalCb(error);
            });
        },
        function (internalCb) {
            /**
             * First Level Descendent of previous descendents
             */
            async.eachLimit(Object.keys(commentMap), 5, function (commentId, cb) {
                let filter = Object.assign({}, criteria);
                filter.where.ancestor = Number(commentId);
                Models.ThreadsTree.findAll(filter).then(function (data) {
                    if (data && data.length > 0) {
                        data.forEach(function (temp) {
                            if (temp.ForumThread && temp.ForumThread.dataValues) {
                                let nextLevelChild = temp.ForumThread.dataValues;
                                commentMap[commentId]['childComments'].push(nextLevelChild);
                            }
                        });
                    }
                    return cb(null);
                }).catch(function (error) {
                    return cb(error);
                });
            }, function (error) {
                commentData = Object.keys(commentMap).map(function (c) {
                    return commentMap[c];
                })
                return internalCb(error);
            });
        }
    ], function (error) {
        return callback(error, commentData);
    });
}

let addPost = function (payloadData, callback) {
    let ancestorId = null;
    let dataToReturn = {};
    async.series([
        function (internalCb) {
            let dataToSave = {};
            dataToSave.type = CONSTANT.TYPE.POST;
            dataToSave.text = payloadData.description;
            dataToSave.title = payloadData.title;
            Models.ForumThreads.create(dataToSave).then(function (data) {
                if (data) {
                    if (data.dataValues) {
                        dataToReturn = data.dataValues;
                        ancestorId = dataToReturn.id;
                        return internalCb();
                    }
                } else {
                    throw new Error(ERROR_MESSAGE.INSERT_FAIL);
                }
            }).catch(function (error) {
                return internalCb({
                    message: error.message,
                    statusCode: CONSTANT.STATUS_CODE.BAD_REQUEST
                });
            });
        }
    ], function (error) {
        return callback(error, dataToReturn);
    });
}

let addComment = function (payloadData, callback) {
    let descendantId = null;
    let dataToReturn = {};
    async.series([
        function (internalCb) {
            Models.ForumThreads.find({
                where: {
                    id: Number(payloadData.id)
                }
            }).then(function (data) {
                if (data && data.dataValues) {
                    let dataToSave = {};
                    dataToSave.type = CONSTANT.TYPE.COMMENT;
                    dataToSave.text = payloadData.description;
                    dataToSave.parentId = payloadData.id;
                    return Models.ForumThreads.create(dataToSave);
                } else {
                    throw new Error(ERROR_MESSAGE.INVALID_REQUEST);
                }
            }).then(function (createdData) {
                if (createdData && createdData.dataValues) {
                    dataToReturn = createdData.dataValues;
                    descendantId = dataToReturn.id;
                }
                return internalCb();
            }).catch(function (error) {
                return internalCb({message: error.message, statusCode: CONSTANT.STATUS_CODE.BAD_REQUEST});
            });
        },
        function (internalCb) {
            /**
             * Insert new descendant mappings with its all ancestors is a bulk write Task
             * So I will Publish the input data {descendant: <value>, immediate_ancestor: <value>} to Kafka
             * where our consumer will be working on updating this tree. We should not make user to wait until these
             * mappings get inserted.
             */

            /** ============================= **/

                // For now we will request Kafka worker function directly

            let dataToPublish = {
                    ancestorId: payloadData.id, descendantId: descendantId
                };
            KafkaWorker.insertMappings(dataToPublish, function (error) {
                if (error) {
                    // retry logic
                    return internalCb();
                }
                return internalCb();
            });
        }
    ], function (error) {
        return callback(error, dataToReturn);
    });
}


module.exports = {
    fetchPosts,
    fetchComments,
    addPost,
    addComment
};