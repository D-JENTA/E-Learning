const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const Student = sequelize.define("Student",{
    id_student : {
        type : DataTypes.INTEGER(11),
        primaryKey : true,
        autoIncrement : true
    },
    nis : {
        type : DataTypes.STRING(20),
        allowNull : true,
        unique : true
    },
    id_class : {
        type : DataTypes.INTEGER(11),
        allowNull : false
    }
},{
    tableName : "student_tb",
    timestamps : false
}
);

module.exports = Student;