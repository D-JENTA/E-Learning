const express = require("express");
const router = express.Router();
const { uploadTeacher, uploadStudent, uploadAssignment, uploadAssignmentStudent, getAssignments, deleteAssignment,deleteAssignmentStudent, inputScore, totalScore, getAssignmentStudent, getAssignmentTeacher} = require("../controllers/tugasController");
const verifyToken = require("../middleware/verifyToken")
const {isTeacher,isAdmin,isStudent,isSuperAdmin} = require("../middleware/roleMiddleware")

router.post("/teachers/class/:id_class/assignments",verifyToken,isTeacher, uploadTeacher.single("file"), uploadAssignment);
router.post("/students/:id_student/assignments",verifyToken,isStudent, uploadStudent.single("file"),uploadAssignmentStudent);

router.get("/assignments",verifyToken, getAssignments);
router.get("/me/class/:id_class/assignmentsTeacher",verifyToken, getAssignmentTeacher);
router.get("/me/class/:id_class/assignmentsStudent",verifyToken,isTeacher, getAssignmentStudent);

router.delete("/teachers/assignments/:id",verifyToken,isTeacher, deleteAssignment); 
router.delete("/students/assignments/:id",verifyToken,isStudent, deleteAssignmentStudent);
router.post("/assignment/score",verifyToken,isTeacher, inputScore);
router.get("/student/totalScore",totalScore);

module.exports = router;    