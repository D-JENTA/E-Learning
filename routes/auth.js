const express = require("express");
const loginLimiter = require("../middleware/rateLimiter")
const { register, login, getUser, getUserById, updateUser,deleteUser,verifyOtp} = require("../controllers/authController")
const verifyToken = require("../middleware/authMiddleware")
const {isAdmin} = require("../middleware/roleMiddleware")


const router = express.Router();


router.post("/auth/register",  register);
router.post("/auth/verifyOtp", verifyOtp);
router.post("/auth/login", loginLimiter, login);
router.get("/auth/users",verifyToken,isAdmin, getUser);
router.get("/auth/users/me",verifyToken, getUserById);
router.put("/auth/users/me",verifyToken, updateUser);
router.delete("/auth/users/:id", deleteUser);
// ,verifyToken,isAdmin

module.exports = router;    