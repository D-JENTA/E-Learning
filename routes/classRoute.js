const express = require("express");
const {createClass, deleteClass, getAllClass, updateClass,getByIdClass, joinClassByCode, getClassByStudent, getClassByTeacher} = require("../controllers/classController");


const router = express.Router();

router.post("/teachers/:id_teacher/classes", createClass);
router.get("/classes", getAllClass);
router.delete("/classes/:id", deleteClass);
router.put("/classes/:id", updateClass);
router.get("/classes/:id", getByIdClass);
router.post("/classes/join", joinClassByCode);
router.get("/students/:id_student/classes", getClassByStudent);
router.get("/teachers/:id_teacher/classes", getClassByTeacher)

module.exports = router;