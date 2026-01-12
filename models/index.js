const Student = require("./student");
const Teacher = require("./teacher");
const Class = require("./class");
const Assignment = require("./assignment");
const User = require("./user")
const studentClass = require("./studentClass");

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
Student.belongsTo(User,{foreignKey: "id_user"});
User.hasOne(Student, {foreignKey: "id_user"})

//Relation User Teacher
Teacher.belongsTo(User, {foreignKey : "id_user"});
User.hasOne(Teacher, {foreignKey: "id_user"});

module.exports = {User, Student, Class, Teacher,Assignment, studentClass};
