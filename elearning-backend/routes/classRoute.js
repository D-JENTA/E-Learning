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



router.post("/admin/me/mapels",verifyToken, isAdmin, createMapel);
router.post("/admin/me/classes", verifyToken, isAdmin, createClass);

router.get("/classes", getAllClass);
router.get("/classes/:id_class/mapels", getMapelByClassId);
router.get("/teachers/me/mapels",verifyToken, getMapelByTeacher)
router.get("/students/me/classes",verifyToken, getMapelByStudent);

router.delete("/mapels",verifyToken, isAdmin, deleteMapel);
router.delete("/classes",verifyToken, isAdmin, deleteClass);
router.put("/admin/classes/:id_class", verifyToken, isAdmin, updateClass);
router.put("/admin/mapels/:id_mapel",verifyToken, isWakakur, updateMapel);





module.exports = router;