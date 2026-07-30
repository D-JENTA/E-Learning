const express = require("express");
const {createClass,
     deleteMapel,
      getAllClass,
       updateClass,
       getByIdClass,
         getMapelByStudent,
         getMapelByClassId,
         addTeacherToMapel,
          getMapelByTeacher,
            deleteStudentFromClass,
            createMapel,
        getUserClassDetails} = require("../controllers/classController");


const verifyToken = require("../middleware/verifyToken")
const {isStudent, isTeacher,isAdmin,} = require ("../middleware/roleMiddleware");
const { verify } = require("jsonwebtoken");

const router = express.Router();



router.get("/classes",verifyToken, isAdmin, getAllClass);

router.get("/classes/:id_class/mapels",verifyToken, getMapelByClassId);

router.delete("/mapels",verifyToken, isAdmin, deleteMapel);
router.put("/classes/:id",verifyToken, updateClass);

router.get("/students/me/classes",verifyToken, getMapelByStudent);

router.post("/admin/me/classes", verifyToken, isAdmin, createClass);
router.post("/admin/me/mapels", verifyToken, isAdmin, createMapel);
router.put("/admin/me/mapels/teachers", verifyToken, isAdmin, addTeacherToMapel);
router.get("/teachers/me/mapels",verifyToken, getMapelByTeacher)
router.get("/classes/:id", getByIdClass);

router.get("/users/:id_user/class-details", verifyToken, isAdmin, getUserClassDetails);

router.delete("/teachers/me/classes/:id_class",verifyToken,isTeacher, deleteStudentFromClass);

module.exports = router;