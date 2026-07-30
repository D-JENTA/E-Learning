const Student = require("./student");
const Teacher = require("./teacher");
const Mapel = require("./mapel");
const Assignment = require("./assignment");
const assignmentStudent = require("./assignmentStudent");
const User = require("./user")
const studentMapel = require("./studentMapel");
const emailOtp = require("./emailOtps");
const Class = require("./class");
const classMapel = require("./classMapel");

//Relation m2m student Mapel
Student.belongsToMany(Mapel, {
    through: studentMapel,
    foreignKey: "id_student",
    otherKey: "id_Mapel"
});

Mapel.belongsToMany(Student, {
    through: studentMapel,
    foreignKey: "id_Mapel",
    otherKey: "id_student"
});

studentMapel.belongsTo(Student, { foreignKey: "id_student" });
studentMapel.belongsTo(Mapel, { foreignKey: "id_Mapel" });

//Relation teacher Mapel
Teacher.hasMany(Mapel, { foreignKey: "id_teacher" });
Mapel.belongsTo(Teacher, { foreignKey: "id_teacher" });

//Relation Mapel Assignment
Mapel.hasMany(Assignment, {foreignKey: "id_Mapel", onDelete : "CASCADE"});
Assignment.belongsTo(Mapel, { foreignKey: "id_Mapel"});

//Relation user student
Student.belongsTo(User,{foreignKey: "id_student"});
User.hasOne(Student, {foreignKey: "id_student"})

//Relation User Teacher
Teacher.belongsTo(User, {foreignKey : "id_teacher"});
User.hasOne(Teacher, {foreignKey: "id_teacher"});

//Relation emailOtp User
User.hasMany(emailOtp,{
    foreignKey: "user_id",
    sourceKey:"id_user",
    onDelete:"CASCADE"
});

emailOtp.belongsTo(User, {
    foreignKey :"user_id",
    targetKey:"id_user"
});


// relation assignmentStudent assignment
Assignment.hasMany(assignmentStudent, { foreignKey: "id_assignment" });
assignmentStudent.belongsTo(Assignment, { foreignKey: "id_assignment" });


// relation class mapel
Mapel.belongsToMany(Class, {
  through: classMapel,
  foreignKey: "id_mapel",
  otherKey: "id_class"
});

Class.belongsToMany(Mapel, {
  through: classMapel,
  foreignKey: "id_class",
  otherKey: "id_mapel"
});


classMapel.belongsTo(Mapel, { foreignKey: "id_mapel" });
classMapel.belongsTo(Class, { foreignKey: "id_class" });

//relation student class
Student.belongsTo(Class, { foreignKey: "id_class" });
Class.hasMany(Student, { foreignKey: "id_class" });



module.exports = {User, Student, Mapel, Teacher,Assignment, assignmentStudent, studentMapel, emailOtp, Class, classMapel};
