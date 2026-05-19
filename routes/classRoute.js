const express = require("express");
const {createClass, deleteClass, getAllClass, updateClass,getByIdClass, joinClassByCode, getClassByStudent, getClassByTeacher, deleteClassStudent, deleteStudentFromClass} = require("../controllers/classController");
const verifyToken = require("../middleware/verifyToken")
const {isStudent, isTeacher,isAdmin,isSuperAdmin} = require ("../middleware/roleMiddleware");
const { verify } = require("jsonwebtoken");

const router = express.Router();



router.get("/classes",verifyToken, getAllClass);
router.delete("/classes/:id",verifyToken, deleteClass);
router.put("/classes/:id",verifyToken, updateClass);

router.post("/classes/join",verifyToken,isStudent, joinClassByCode);
router.get("/students/me/classes",verifyToken, getClassByStudent);
router.delete("/students/me/classes/:id_class",verifyToken,isStudent, deleteClassStudent);

router.post("/teachers/me/classes",verifyToken,isTeacher, createClass);
router.get("/teachers/me/classes",verifyToken, getClassByTeacher)
router.get("/classes/:id", getByIdClass);

router.delete("/teachers/me/classes/:id_class",verifyToken,isTeacher, deleteStudentFromClass);

module.exports = router;