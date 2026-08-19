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
        allowNull : false,
        unique : true
    },
    otp:{
        type: DataTypes.STRING(6),
        allowNull: false
    },
    expires_at:{
        type:DataTypes.DATE,
        allowNull:false
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