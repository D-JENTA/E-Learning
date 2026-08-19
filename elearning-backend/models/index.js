const Student = require("./student");
const Teacher = require("./teacher");
const Mapel = require("./mapel");
const Assignment = require("./assignment");
const assignmentStudent = require("./assignmentStudent");
const User = require("./user");
const emailOtp = require("./emailOtps");
const Class = require("./class");
const ScheduleMapel = require("./schedule_mapel");

// 1. Relasi Teacher - Mapel (Ditambahkan Alias 'teacher_tb' agar cocok dengan controller PDF)
Teacher.hasMany(Mapel, { foreignKey: "id_teacher", as: "Mapels" });
Mapel.belongsTo(Teacher, { foreignKey: "id_teacher", as: "teacher_tb" });

// 2. Relasi Mapel - Assignment
Mapel.hasMany(Assignment, { foreignKey: "id_mapel", onDelete: "CASCADE" });
Assignment.belongsTo(Mapel, { foreignKey: "id_mapel" });

// 3. Relasi Mapel - ScheduleMapel
Mapel.hasMany(ScheduleMapel, { foreignKey: "id_mapel", as: "Schedules",onDelete: "CASCADE" });
ScheduleMapel.belongsTo(Mapel, { foreignKey: "id_mapel", as: "Mapel" });

// 4. Relasi Class - Mapel
Class.hasMany(Mapel, { foreignKey: "id_class", as: "Mapels" });
Mapel.belongsTo(Class, { foreignKey: "id_class", as: "Class" });

// 5. Relasi User - Student
Student.belongsTo(User, { foreignKey: "id_student" });
User.hasOne(Student, { foreignKey: "id_student" });

// 6. Relasi User - Teacher
Teacher.belongsTo(User, { foreignKey: "id_teacher", as: "User" });
User.hasOne(Teacher, { foreignKey: "id_teacher", as: "Teacher" });

// 7. Relasi emailOtp - User
User.hasMany(emailOtp, {
    foreignKey: "user_id",
    sourceKey: "id_user",
    onDelete: "CASCADE"
});
emailOtp.belongsTo(User, {
    foreignKey: "user_id",
    targetKey: "id_user"
});

// 8. Relasi Assignment - assignmentStudent
Assignment.hasMany(assignmentStudent, { foreignKey: "id_assignment" });
assignmentStudent.belongsTo(Assignment, { foreignKey: "id_assignment" });

// 8b. Relasi Student - assignmentStudent (supaya nama siswa bisa di-join, tanpa N+1)
Student.hasMany(assignmentStudent, { foreignKey: "id_student" });
assignmentStudent.belongsTo(Student, { foreignKey: "id_student" });

// 9. Relasi Student - Class
Student.belongsTo(Class, { foreignKey: "id_class" });
Class.hasMany(Student, { foreignKey: "id_class" });

// PASTI KAN ScheduleMapel DITERUSKAN DI EXPORTS!
module.exports = {
    User,
    Student,
    Mapel,
    Teacher,
    Assignment,
    assignmentStudent,
    emailOtp,
    Class,
    ScheduleMapel
};