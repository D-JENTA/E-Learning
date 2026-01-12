const express = require("express")
const {getStudentDasboard} = require ("../controllers/studentController");

const router = express.Router();

router.get("/student/:id_student/dashboard", getStudentDasboard);

module.exports = router;