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
        allowNull:false, 
        unique:true,
        validate: {
            isEmail: true
        }
    },
    password :{
        type: DataTypes.STRING(255), 
        allowNull:false
    },
    role :{
        type : DataTypes.ENUM("student", "teacher", "admin"),
        allowNull:false
    },
    is_verified:{
        type:DataTypes.BOOLEAN,
        defaultValue: false
    },
    created_at:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    profile_picture_url :{
        type: DataTypes.STRING(255),
        allowNull: true
    }
},{
    tableName : "user_tb",
    timestamps : false
});

module.exports = User;