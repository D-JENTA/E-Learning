const express = require("express");
const {createClass,
     deleteMapel,
     deleteClass,
      getAllClass,
       updateClass,
       updateMapel,
         getMapelByStudent,
         getMapelByClassId,
          getMapelByTeacher,
            createMapel,
      } = require("../controllers/classController");


const verifyToken = require("../middleware/verifyToken")
const {isStudent, isTeacher,isAdmin, isWakakur} = require ("../middleware/roleMiddleware");
const { verify } = require("jsonwebtoken");

const router = express.Router();



router.get("/classes", getAllClass);

router.get("/classes/:id_class/mapels", getMapelByClassId);

router.delete("/mapels",verifyToken, isAdmin, deleteMapel);
router.delete("/classes",verifyToken, isAdmin, deleteClass);
router.put("/admin/classes/:id_class", verifyToken, isAdmin, updateClass);
router.put("/admin/mapels/:id_mapel",verifyToken, isWakakur, updateMapel);

router.get("/students/me/classes",verifyToken, getMapelByStudent);

router.post("/admin/me/classes", verifyToken, isAdmin, createClass);
router.post("/admin/me/mapels", createMapel);
router.get("/teachers/me/mapels",verifyToken, getMapelByTeacher)



module.exports = router;