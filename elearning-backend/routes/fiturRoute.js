const express = require("express");
const {printDataJadwalPDF} = require("../controllers/fiturController");
const router = express.Router();

router.get("/print/jadwal", printDataJadwalPDF);

module.exports = router;