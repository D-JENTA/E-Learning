const express = require("express");
const router = express.Router();
const { uploadTeacher, uploadStudent, uploadAssignment, uploadAssignmentStudent, getAssignments, deleteAssignment,deleteAssignmentStudent, inputScore, totalScore} = require("../controllers/tugasController");
const verifyToken = require("../middleware/authMiddleware")

router.post("/teachers/:id_teacher/assignments",verifyToken, uploadTeacher.single("file"), uploadAssignment);
router.post("/students/:id_student/assignments",verifyToken, uploadStudent.single("file"),uploadAssignmentStudent);
router.get("/assignments",verifyToken, getAssignments);
router.delete("/teachers/assignments/:id",verifyToken, deleteAssignment);
router.delete("/students/assignments/:id",verifyToken, deleteAssignmentStudent);
router.post("/assignment/score", inputScore);
router.get("/student/totalScore",totalScore);

module.exports = router;