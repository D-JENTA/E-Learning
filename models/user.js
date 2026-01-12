const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define("User", {
    id_user :{ 
        type: DataTypes.INTEGER,
         primaryKey : true,
          autoIncrement: true 
    },
    username :{
        type: DataTypes.STRING(100),
        allowNull:false
    },
    email :{
        type: DataTypes.STRING(100), 
        allowNull:false, unique:true
    },
    password :{
        type: DataTypes.STRING(255), 
        allowNull:false
    },
    role :{
        type : DataTypes.ENUM("student", "teacher", "admin")
        , allowNull:false
    }
},{
    tableName : "user_tb",
    timestamps : false
});

module.exports = User;