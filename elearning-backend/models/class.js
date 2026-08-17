const {DataTypes} = require("sequelize");
const sequelize  = require("../config/db");

const Class = sequelize.define("Class", {
    id_class: {
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
        allowNull : false
    },
    class_name : {
        type : DataTypes.STRING(80),
        allowNull : false
    }
},{
    tableName : "class_tb",
    timestamps : false
})

module.exports = Class;