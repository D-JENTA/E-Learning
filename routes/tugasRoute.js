const express = require("express");
const router = express.Router();
const { uploadTeacher, uploadStudent, uploadAssignment, uploadAssignmentStudent, getAssignments, deleteAssignment,deleteAssignmentStudent} = require("../controllers/tugasController");

router.post("/teachers/:id_teacher/assignments", uploadTeacher.single("file"), uploadAssignment);
router.post("/students/:id_student/assignments", uploadStudent.single("file"),uploadAssignmentStudent);
router.get("/assignments", getAssignments);
router.delete("/teachers/assignments/:id", deleteAssignment);
router.delete("/students/assignments/:id",deleteAssignmentStudent);

module.exports = router;