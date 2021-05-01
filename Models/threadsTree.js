'use strict';

const MODELS = require('./../Config/modelEntity');

module.exports = function (sequelize, DataTypes) {
    let ThreadsTree = sequelize.define(MODELS.ENTITIES.THREADS_TREE, {
        id: {
            type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true
        },
        ancestor: {
            type: DataTypes.INTEGER,
            notEmpty: true,
            allowNull: false,
            references: {
                model: "ForumThreads",
                key: "id"
            }
        },
        descendant: {
            type: DataTypes.INTEGER,
            notEmpty: true,
            allowNull: false,
            references: {
                model: "ForumThreads",
                key: "id"
            }
        },
        level: {
            type: DataTypes.INTEGER,
            notEmpty: true,
            allowNull: false
        }
    }, {
        indexes: [{
            type: "unique",
            fields: ['ancestor', 'descendant'],
            name: 'uniqueMap'

        }, {
            fields: ['descendant'],
            name: 'idxdes'
        }],
        freezeTableName: true,
        paranoid: true,
        classMethods: {
            associate: function (models) {
                ThreadsTree.belongsTo(models.ForumThreads, {foreignKey: 'ancestor'});
                ThreadsTree.belongsTo(models.ForumThreads, {foreignKey: 'descendant'});
            }
        }
    });
    return ThreadsTree;
};
