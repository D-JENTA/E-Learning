const express = require("express");
const {createClass,
     deleteMapel,
      getAllClass,
       updateClass,
       updateMapel,
       getByIdClass,
         getMapelByStudent,
         getMapelByClassId,
         addTeacherToMapel,
          getMapelByTeacher,
            createMapel,
        // getUserClassDetails
      } = require("../controllers/classController");


const verifyToken = require("../middleware/verifyToken")
const {isStudent, isTeacher,isAdmin, isWakakur} = require ("../middleware/roleMiddleware");
const { verify } = require("jsonwebtoken");

const router = express.Router();



router.get("/classes", getAllClass);

router.get("/classes/:id_class/mapels",verifyToken, getMapelByClassId);

router.delete("/mapels",verifyToken, isAdmin, deleteMapel);
router.put("/admin/classes/:id_class", verifyToken, isAdmin, updateClass);
router.put("/admin/mapels/:id_mapel", updateMapel);

router.get("/students/me/classes",verifyToken, getMapelByStudent);

router.post("/admin/me/classes", verifyToken, isAdmin, createClass);
router.post("/admin/me/mapels", createMapel);
router.put("/admin/me/mapels/teachers", verifyToken, isWakakur, addTeacherToMapel);
router.get("/teachers/me/mapels",verifyToken, getMapelByTeacher)
router.get("/classes/:id", getByIdClass);

// router.get("/users/:id_user/class-details", verifyToken, isAdmin, getUserClassDetails);


module.exports = router;