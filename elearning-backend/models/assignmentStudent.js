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
    id_mapel : {
        type : DataTypes.INTEGER(11),
        allowNull : false,
        references : {
            model : "mapel_tb",
            key : "id_mapel"
        }
    },
    id_assignment : {
        type : DataTypes.INTEGER(11),
        allowNull : false,
        references : {
            model : "assignment_tb",
            key : "id_assignment"
        }
    },
    score :{
        type : DataTypes.INTEGER,
        allowNull : true
    },
    file_public_id: {
    type: DataTypes.STRING,
    allowNull: true  
    },
    file_extension: {
    type: DataTypes.STRING,
    allowNull: true
}
},{
    tableName : "assignmentstudent_tb",
    timestamps : true,
    indexes : [
        // satu siswa = satu pengumpulan per tugas (resubmit = replace)
        { unique : true, name : "uq_submission_student_assignment", fields : ["id_student", "id_assignment"] }
    ]
} );

module.exports = assignmentStudent