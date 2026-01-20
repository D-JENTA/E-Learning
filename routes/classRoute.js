const express = require("express");
const {createClass, deleteClass, getAllClass, updateClass,getByIdClass, joinClassByCode, getClassByStudent, getClassByTeacher} = require("../controllers/classController");
const verifyToken = require("../middleware/authMiddleware")
const {isStudent, isTeacher} = require ("../middleware/roleMiddleware")

const router = express.Router();


router.post("/teachers/me/classes",verifyToken,isTeacher, createClass);
router.get("/classes",verifyToken, getAllClass);
router.delete("/classes/:id",verifyToken, deleteClass);
router.put("/classes/:id",verifyToken, updateClass);
router.get("/classes/:id", getByIdClass);
router.post("/classes/join",verifyToken,isStudent, joinClassByCode);
router.get("/students/:id_student/classes",verifyToken, getClassByStudent);
router.get("/teachers/me/classes",verifyToken, getClassByTeacher)

module.exports = router;