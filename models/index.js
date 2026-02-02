const Student = require("./student");
const Teacher = require("./teacher");
const Class = require("./class");
const Assignment = require("./assignment");
const User = require("./user")
const studentClass = require("./studentClass");
const emailOtp = require("./emailOtps");

//Relation m2m student class
Student.belongsToMany(Class, {
    through: studentClass,
    foreignKey: "id_student",
    otherKey: "id_class"
});

Class.belongsToMany(Student, {
    through: studentClass,
    foreignKey: "id_class",
    otherKey: "id_student"
});

studentClass.belongsTo(Student, { foreignKey: "id_student" });
studentClass.belongsTo(Class, { foreignKey: "id_class" });

//Relation teacher class
Teacher.hasMany(Class, { foreignKey: "id_teacher" });
Class.belongsTo(Teacher, { foreignKey: "id_teacher" });

//Relation class Assignment
Class.hasMany(Assignment, {foreignKey: "id_class", onDelete : "CASCADE"});
Assignment.belongsTo(Class, { foreignKey: "id_class"});

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

User.hasMany(emailOtp, {
  foreignKey: "user_id",
  sourceKey: "id_user"
});


module.exports = {User, Student, Class, Teacher,Assignment, studentClass, emailOtp};
