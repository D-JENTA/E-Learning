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
  id_teacher: {
    type : DataTypes.INTEGER,
    allowNull : true,
    references : {
      model : "teacher_tb",
      key : "id_teacher"
    }
  },
  id_mapel: {
    type: DataTypes.INTEGER,
    allowNUll: false,
    references : {
      model : "mapel_tb",
      key:"id_mapel"
    },
    onDelete :"CASCADE"
  },
  file_public_id: {
    type: DataTypes.STRING,
    allowNull: true
},
  deadline : {
    type : DataTypes.DATE,
    allowNull : true
  }
}, {
  tableName: "assignment_tb",           
  timestamps: true                  
});

module.exports = Assignment;

