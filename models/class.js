const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");
const Tugas = require("./assignment");
const Teacher = require("./teacher");
const Assignment = require("./assignment");

const Class = sequelize.define ("Class",{
    id_class: {
        type: DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    class_name: {
        type : DataTypes.STRING(25),
        allowNull : false
    },
    classCode : {
        type : DataTypes.STRING(6),
        allowNull : false,
    },
    id_teacher : {
        type : DataTypes.INTEGER,
        allowNull : false,
        references : {
            model : "teacher_tb",
            key : "id_teacher"
        }
    }
},{
    tableName : "class_tb",
    timestamps : false
}
);



module.exports = Class;