const express = require("express");
const router = express.Router();
const { uploadTeacher, uploadStudent, uploadAssignment, uploadAssignmentStudent, 
     deleteAssignment, deleteAssignmentStudent, inputScore, totalScore, getAssignmentStudent, getAssignmentTeacher,
      getAssignmentStudentById, getMySubmissions } = require("../controllers/tugasController");
const verifyToken = require("../middleware/verifyToken");
const { isTeacher, isAdmin, isStudent, onlyStudent, onlyTeacher } = require("../middleware/roleMiddleware");


const uploadHandler = (uploadMiddleware) => (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (err) return next(err); 
        next();
    });
};

router.post("/teachers/mapel/:id_mapel/assignments", verifyToken, isTeacher, 
    uploadHandler(uploadTeacher.single("file")),  
    uploadAssignment
);

router.post("/students/:id_assignment/assignments", verifyToken, isStudent, 
    uploadHandler(uploadStudent.single("file")),  
    uploadAssignmentStudent
);

router.get("/me/mapel/:id_mapel/assignmentsTeacher", verifyToken, getAssignmentTeacher);
router.get("/me/mapel/:id_mapel/assignmentsStudent", verifyToken, isTeacher, getAssignmentStudent);
router.get("/students/assignments", verifyToken, isStudent, getMySubmissions);
router.post("/assignment/:id/score", verifyToken, isTeacher, inputScore);
router.get("/student/totalScore",verifyToken,isTeacher, totalScore);
router.get("/teachers/assignments/:id_assignment", verifyToken, isTeacher, getAssignmentStudentById);
router.delete("/students/assignments/:id", verifyToken, onlyStudent, deleteAssignmentStudent);
router.delete("/teachers/assignments/:id", verifyToken, onlyTeacher, deleteAssignment);

module.exports = router;