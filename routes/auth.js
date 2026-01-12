const express = require("express");
const loginLimiter = require("../middleware/rateLimiter")
const { register, login, getUser, getUserById, updateUser,deleteUser} = require("../controllers/authController")

const router = express.Router();


router.post("/auth/register",  register);
router.post("/auth/login", loginLimiter, login);
router.get("/auth/users", getUser);
router.get("/auth/users/:id", getUserById);
router.put("/auth/users/:id", updateUser);
router.delete("/auth/users/:id", deleteUser);


module.exports = router;    