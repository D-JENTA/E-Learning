const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");


const Teacher = sequelize.define("teacher_tb",{
    id_teacher: {
        type : DataTypes.INTEGER(11),
        primaryKey : true,
        autoIncrement : true
    },
    nip : {
        type : DataTypes.STRING(20),
        allowNull : true,
        unique : true
    }},{
    tableName : "teacher_tb",
    timestamps : false
}
);


module.exports = Teacher;