const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");

const classMapel = sequelize.define("classMapel",{
    id_class : {
        type : DataTypes.INTEGER,
        primaryKey : true,
    },
    id_mapel : {
        type : DataTypes.INTEGER,
        primaryKey : true,
    },
    id_teacher : {
        type : DataTypes.INTEGER,
        allowNull : true
    }
},{
    tableName : "class_mapel_tb",
    timestamps : false
})

module.exports = classMapel;