const express = require("express");
const {printDataJadwalPDF, getSchedule} = require("../controllers/fiturController");
const router = express.Router();

router.get("/print/jadwal", printDataJadwalPDF);
router.get("/schedule", getSchedule);

module.exports = router;