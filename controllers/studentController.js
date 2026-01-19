// const Class = require("../models/class");
// const Student = require("../models/student");
// require ("../models/studentClass")

// const getStudentDashboard = async (req , res) => {
//     try {
//         const {id_student} = req.params;

//         const student = await Student.findIdByPk(id_student, {
//             include : [
//                 {
//                     model : Class,
//                     through : {attributes : []},
//                     attributes : {class_name}
//                 }
//             ]
//         });
//         if (!student) {
//             return res.status(400).json({message : "id not found"})
//         }

//         res.status(200).json({message : "dashboard fetching successfully",student})
//     }catch (err){
//         console.error (err)
//         return res.status(500).json({message : "server error while get Class"})
//     }
// };

// module.exports = {getStudentDashboard};