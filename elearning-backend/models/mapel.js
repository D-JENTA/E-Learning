const {DataTypes} = require("sequelize");
const sequelize = require("../config/db");


const Mapel = sequelize.define ("Mapel",{
    id_mapel: {
        type: DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true
    },
    mapel_name: {
        type : DataTypes.STRING(25),
        allowNull : false
    },
    id_teacher : {
        type : DataTypes.INTEGER,
        allowNull : true,
        references : {
            model : "teacher_tb",
            key : "id_teacher"
        }
    },
    id_class :{
        type : DataTypes.INTEGER,
        allowNull : false,
        references : {
            model : "class_tb",
            key : "id_class"
        }
    }
},{
    tableName : "mapel_tb",
    timestamps : false
}
);



module.exports = Mapel;