const express = require("express");
const {printDataJadwalPDF, getSchedule} = require("../controllers/fiturController");
const {isWakakur} = require("../middleware/roleMiddleware");
const verifyToken = require("../middleware/verifyToken");
const limit = require("express-rate-limit");
const router = express.Router();

const limiter = limit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10 // limit each IP to 10 requests per windowMs
});


router.get("/print/jadwal", verifyToken, isWakakur,limiter, printDataJadwalPDF);
router.get("/schedule", verifyToken, isWakakur, getSchedule);

module.exports = router;