const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");

const emailOtp = sequelize.define("emailOtp",{
    id:{
        type: DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement: true,
        allowNull: false
    },
    user_id:{
        type: DataTypes.INTEGER,
        allowNull : false
    },
    otp:{
        type: DataTypes.STRING(6),
        allowNUll: false
    },
    expires_at:{
        type:DataTypes.DATE,
        allowNUll:false
    },
    created_at:{
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
},{
    tableName:"email_otps",
    timestamps :false
});
module.exports = emailOtp;