'use strict';

const MODELS = require('./../Config/modelEntity');

module.exports = function (sequelize, DataTypes) {
    let ForumThreads = sequelize.define(MODELS.ENTITIES.FORUM_THREADS, {
        id: {
            type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
        },
        type: {
            type: DataTypes.INTEGER,
            notEmpty: true,
            allowNull: false
        },
        text: {
            type: DataTypes.STRING,
            notEmpty: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: true,
            defaultValue: null
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: null
        }
    }, {
        indexes: [{
            fields: ['type'],
            name: 'idxtp'
        }],
        freezeTableName: true,
        paranoid: true,
        classMethods: {
            associate: function (models) {
                ForumThreads.hasMany(models.ThreadsTree, {foreignKey: 'ancestor'});
                ForumThreads.hasMany(models.ThreadsTree, {foreignKey: 'descendant'});
            }
        }
    });
    return ForumThreads;
};
