const express = require("express");
const loginLimiter = require("../middleware/rateLimiter")
const { loginAdmin,register, login, getUser, getUserById, getProfilePicture,deleteUser,deleteForAdmin,verifyOtp,checkMe,logout,
     updateProfilePicture, resendOtp, validateEmail, updatePassword, inputUser, getStudentByIdClass, updateEmail,
      updateUsername, changeUserRole} = require("../controllers/authController")
const verifyToken = require("../middleware/verifyToken")
const {isAdmin, isStudent, isTeacher} = require("../middleware/roleMiddleware")
const {uploadCloud} = require("../config/cloudinary")


const router = express.Router();


router.post("/auth/register",  register);
router.post("/auth/profile-picture", verifyToken, uploadCloud.single("profile_picture"), updateProfilePicture);

router.post("/superAdmin/input-user",verifyToken, isAdmin, inputUser);

router.post("/auth/login", loginLimiter, login);
router.post("/auth/loginAdmin-onlyAdmin", loginAdmin);
router.get("/auth/check-me", verifyToken, checkMe);
router.delete('/api/auth/logout', verifyToken, logout);

router.put("/auth/users/me/email", verifyToken, updateEmail);
router.put("/auth/users/me/username", verifyToken, updateUsername);
router.put("/auth/users/role", verifyToken, isAdmin, changeUserRole);

router.get("/auth/users/:id_class/students",verifyToken, isTeacher, getStudentByIdClass);

router.post("/auth/resend-otp",verifyToken, resendOtp);
router.post("/auth/verifyOtp", verifyOtp);

router.get("/auth/users",verifyToken,isAdmin, getUser);
router.get("/auth/users/me",verifyToken, getUserById);
router.get("/auth/profile-picture", verifyToken, getProfilePicture);
router.delete("/auth/users/superAdmin/:id",verifyToken,isAdmin, deleteUser);
router.delete("/auth/users/admin/:id",verifyToken,isAdmin, deleteForAdmin);

router.post("/auth/validate-email", validateEmail);
router.post("/auth/update-password",  updatePassword);


module.exports = router;    