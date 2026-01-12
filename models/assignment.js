const { DataTypes } = require("sequelize");
const sequelize = require("../config/db"); 

const Assignment = sequelize.define("Assignment", {
  id_assignment: {
    type: DataTypes.INTEGER,      
    autoIncrement: true,          
    primaryKey: true              
  },
  assignment_title: {
    type: DataTypes.STRING,
    allowNull: false       
  },
  description: {
    type: DataTypes.STRING,         
    allowNull: false
  },
  file_url: {
    type: DataTypes.STRING,        
    allowNull: false
  }, 
  id_student : {
    type: DataTypes.INTEGER,
    allowNUll: true,
    references : {
      model : "student_tb",
      key : "id_student"
    }
  },
  id_teacher: {
    type : DataTypes.INTEGER,
    allowNull : true,
    references : {
      model : "teacher_tb",
      key : "id_teacher"
    }
  },
  id_class: {
    type: DataTypes.INTEGER,
    allowNUll: false,
    references : {
      model : "class_tb",
      key:"id_class"
    },
    onDelete :"CASCADE"
  }
}, {
  tableName: "assignment_tb",           
  timestamps: true                  
});

module.exports = Assignment;

