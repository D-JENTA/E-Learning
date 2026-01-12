const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");

const assignmentStudent = sequelize.define("assignmentStudent",{
    id_assignmentStudent : {
        type : DataTypes.INTEGER,
        allowNull : false,
        primaryKey : true,
        autoIncrement : true
    },
    title : {
        type : DataTypes.STRING(50),
        allowNull: false,
    },
    file_url :{
        type : DataTypes.STRING(255),
        allowNull : false
    },
    id_student : {
        type : DataTypes.INTEGER(11),
        allowNull : false,
        references : {
            model : "student_tb",
            key : "id_student"
        }
    },
    id_class : {
        type : DataTypes.INTEGER(11),
        allowNull : false,
        references : {
            model : "class_tb",
            key : "id_class"
        }
    }
},{
    tableName : "assignmentstudent_tb",
    timestamps : true
} );

module.exports = assignmentStudent