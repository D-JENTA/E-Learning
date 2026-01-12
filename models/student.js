const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const Student = sequelize.define("Student",{
    id_student : {
        type : DataTypes.INTEGER(11),
        primaryKey : true,
        autoIncrement : true
    },
    username : {
        type : DataTypes.STRING(50),
        allowNull : false
    },
    nis : {
        type : DataTypes.INTEGER(17),
        allowNull : true
    }
},{
    tableName : "student_tb",
    timestamps : false
}
);

module.exports = Student;