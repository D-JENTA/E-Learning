const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");
const Student = require("../models/student");
const Class = require("../models/class");

const studentClass = sequelize.define("student_class",{
    id_student : {
        type : DataTypes.INTEGER,
    },
    id_class : {
            type : DataTypes.INTEGER,
        }
},{
    tableName : "student_classes",
    timestamps : false
});

Student.belongsToMany(Class,{
     through :studentClass, 
     foreignKey : "id_student",
     otherKey : "id_class"
    });
Class.belongsToMany(Student,{ 
     through : studentClass, 
     foreignKey : "id_class",
     otherKey : "id_student"
    }); 

module.exports = studentClass;