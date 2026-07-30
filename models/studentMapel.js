const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");
const Student = require("./student");
const Class = require("./mapel");

const studentMapel = sequelize.define("student_mapel",{
    id_student : {
        type : DataTypes.INTEGER,
    },
    id_class : {
            type : DataTypes.INTEGER,
        }
},{
    tableName : "student_mapel",
    timestamps : false
});

Student.belongsToMany(Class,{
     through :studentMapel, 
     foreignKey : "id_student",
     otherKey : "id_class"
    });
Class.belongsToMany(Student,{ 
     through : studentMapel, 
     foreignKey : "id_class",
     otherKey : "id_student"
    }); 

module.exports = studentMapel;