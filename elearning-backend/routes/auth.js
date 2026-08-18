const express = require("express");
const loginLimiter = require("../middleware/rateLimiter")
const { 
       register,
        login,
         getUser,
          getUserById,
            deleteUser,
              verifyOtpLogin,
               checkMe,
                logout,
                 updateProfilePicture,
                  resendOtp,
                   validateEmail,
                    updatePassword,
                      getStudentByIdClass,
                       getAllTeachers,
                        updateEmail,
                         updateUsername,
                         updateUser,
                          changeUserRole} = require("../controllers/authController")
const verifyToken = require("../middleware/verifyToken")
const {isAdmin, isStudent, isTeacher} = require("../middleware/roleMiddleware")
const {uploadCloud} = require("../config/cloudinary")


const router = express.Router();


router.post("/auth/register",  register);
router.post("/auth/profile-picture", verifyToken, uploadCloud.single("profile_picture"), updateProfilePicture);
router.post("/auth/login", loginLimiter, login);
router.post("/auth/resend-otp",verifyToken,loginLimiter, resendOtp);
router.post("/auth/verifyOtp",loginLimiter, verifyOtpLogin);
router.post("/auth/validate-email", validateEmail);
router.post("/auth/update-password",verifyToken,  updatePassword);

router.get("/auth/users/:id_class/students",verifyToken, isTeacher, getStudentByIdClass);
router.get("/auth/check-me", verifyToken, checkMe);
router.get("/auth/users",verifyToken,isAdmin, getUser);
router.get("/admin/users/teachers",verifyToken,isAdmin, getAllTeachers);
router.get("/auth/users/me",verifyToken, getUserById);

router.put("/auth/users/role", verifyToken, isAdmin, changeUserRole);
router.put("/auth/users/me/email", verifyToken, updateEmail);
router.put("/auth/users/me/username", verifyToken, updateUsername);

router.delete('/auth/logout', logout);
router.delete("/admin/users/:id", verifyToken, isAdmin,deleteUser);






module.exports = router;    