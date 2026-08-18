const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const User = require("../models/user");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const SECRET_KEY = process.env.JWT_SECRET;
const emailOtp = require("../models/emailOtps");
const sequelize = require("../config/db");
const sendEmail = require("../utils/sendEmail");
const uploadCloud = require("../config/cloudinary").uploadCloud;
const Mapel = require("../models/mapel");
const Class = require("../models/class");
const assignmentStudent = require("../models/assignmentStudent");
const cloudinary = require("cloudinary").v2;
const Assignment = require("../models/assignment");


// register
const register = async (req, res) => {
    let t;
    const SALT_ROUNDS = 10;
    try {
        const { username, email, password, role, nis, nip, id_class } = req.body;

        // Validation Input
        if (!username || !email) return res.status(400).json({ message: "all fields must be filled in" });
        
        if (!password || password.length < 6) return res.status(400).json({ message: "password must be more then 8 characters" });
        if (!["student", "teacher", "admin"].includes(role)) return res.status(400).json({ message: "role must be filled" });

        if (role === "student" && (!nis || nis.trim() === "")) return res.status(400).json({ message: "NIS must be filled in" });
        if (role === "teacher" && (!nip || nip.trim() === "")) return res.status(400).json({ message: "NIP must be filled in" });
        if (role === "student" && (!id_class || String(id_class).trim() === "")) return res.status(400).json({ message: "id_class must be filled in" });

        const existingUser = await User.findOne({ where: { email }, attributes: ["id_user"] });
        if (existingUser) return res.status(400).json({ message: "email is registered, please log in" });

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        t = await sequelize.transaction();

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            is_verified: false
        }, { transaction: t });

        
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        

        await emailOtp.destroy({ where: { user_id: newUser.id_user }, transaction: t });

        await emailOtp.create({
            user_id: newUser.id_user,
            otp: generatedOtp,
            expires_at: new Date(Date.now() + 5 * 60 * 1000) 
        }, { transaction: t });

        if (role === "student") {
            await Student.create({ id_student: newUser.id_user, nis, id_class, username: newUser.username }, { transaction: t });
        } else if (role === "teacher") {
            await Teacher.create({ id_teacher: newUser.id_user, nip, username: newUser.username }, { transaction: t });
        }

        await t.commit();


        setImmediate(() => {
            sendEmail(email, generatedOtp).catch(console.error);
        });

        res.status(201).json({
            message: "registration successful, check your email for otp",
            user_id: newUser.id_user,
            user: {
                id_user: newUser.id_user,
                username: newUser.username,
                role: newUser.role
            }
        });

    } catch (err) {
        if (t && !t.finished) await t.rollback();
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
};

//verify otp
const verifyOtpLogin = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { user_id, otp } = req.body;
        
        if (!user_id || !otp) {
            return res.status(400).json({ message: "user_id and otp are required" });
        }

        const user = await User.findByPk(user_id, { transaction: t });
        if (!user) {
            await t.rollback(); 
            return res.status(404).json({ message: "user not found" });
        }

        const otpData = await emailOtp.findOne({
            where: { user_id: Number(user_id) },
            order: [['created_at', 'DESC']],
            transaction: t
        });

        if (!otpData || otpData.otp !== otp.trim()) {
            await t.rollback();
            return res.status(400).json({ message: "invalid otp" });
        }


        if (otpData.expires_at < new Date()) {
            await otpData.destroy({ transaction: t });
            await t.commit();
            return res.status(400).json({ message: "otp expired" });
        }


        await otpData.destroy({ transaction: t });
        
        const verifiedUser = await user.update({ is_verified: true }, { transaction: t });

        await t.commit();


        const token = jwt.sign(
            { id: user.id_user, username: user.username, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: "1d" }
        );


        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax"
        });


        return res.json({
            message: "login success",
            token,
            user_id: user.id_user,
            user: { 
                id_user: user.id_user, 
                username: user.username, 
                role: user.role 
            }
        });

    } catch (err) {
    if (t) await t.rollback(); 
    console.error(err);
    return res.status(500).json({ message: "server error" });
}
};

// login
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });
        if (!user) return res.status(400).json({ message: "email not found" });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "wrong password" });

        if (!user.is_verified) {
            return res.status(403).json({ message: "Account not verified yet" });
        }

        if (user.role === 'admin') {
 
            await emailOtp.destroy({ where: { user_id: user.id_user } });

            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

            await emailOtp.create({
                user_id: user.id_user,
                otp: otpCode,
                expires_at: expiresAt
            });


            setImmediate(() => {
            sendEmail(email, otpCode).catch(console.error);
            });


            return res.status(200).json({
                message: 'Login tahap pertama berhasil. Silakan cek email Anda untuk kode OTP.',
                requiresTwoFactor: true,
                user_id: user.id_user, 
                email: user.email 
            });

        } else {
            await emailOtp.destroy({ where: { user_id: user.id_user } });


            const token = jwt.sign(
                { id: user.id_user, role: user.role }, 
                process.env.JWT_SECRET || "SECRET_KEY", 
                { expiresIn: "1d" }
            );

            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax"
            });
            
            return res.status(200).json({
                message: "login success",
                token,
                user_id: user.id_user,
                user: { 
                    id_user: user.id_user, 
                    username: user.username, 
                    role: user.role 
                }
            });
        }

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "server error" });
    }
};

// resend otp
const resendOtp = async (req, res) => {
    try {
        const id_user = req.user.id;
        
        const user = await User.findByPk(id_user);
        
        if (!user || !user.email) {
            return res.status(404).json({ message: "Email user tidak ditemukan" });
        }

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiredAt = new Date(Date.now() + 5 * 60000);

        await emailOtp.destroy({ where: { user_id: id_user } });

        await emailOtp.create({
            user_id: id_user,
            otp: generatedOtp,
            expires_at: expiredAt 
        });

        setImmediate(() => {
            sendEmail(user.email, generatedOtp).catch(err => {
                console.error("Nodemailer Error:", err.message);
            });
        });

        res.status(200).json({ message: "OTP resent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while resending OTP" });
    }
};

//forgot password (masukan email dulu untuk memastikan keaslian user dan gunakan api verifikasi otp , jika berhasil lanjutnya ke page baru umtuk memasukan password baru, setelah itu login kembali dengan  password baru)
const validateEmail = async (req, res) => {
    try {
        const {email} = req.body;
        const user = await User.findOne({where : {email}});
        if (!user) return res.status(400).json({message : "email not found"});
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiredAt = new Date(Date.now() + 5 * 60000);
        await emailOtp.destroy({where : {user_id : user.id_user}});
        await emailOtp.create({
            user_id : user.id_user,
            otp : generatedOtp,
            expires_at : expiredAt
        });
        setImmediate(() => {
            sendEmail(email, generatedOtp).catch(console.error);
        }
        );
        res.status(200).json({message : "otp sent to email, check your email", id_user : user.id_user})
        
    }catch (err) {
        console.error(err)
        res.status(500).json({message : "server error while forgot password"})
    }
};

//update password
const updatePassword = async (req, res) => {
    try{
        const user_id = req.user.id;
        const{newPassword} = req.body;
        if(!newPassword || newPassword.length < 6)
            return res.status(400).json({message : "new password must be more than 6 characters"});

        const user = await User.findByPk(user_id);
        if (!user) return res.status(400).json({message : "user not found"});

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await user.update({ password: hashedPassword });

        res.json({message : "Password updated successfully"});

    }catch (err) {
        console.error(err)
        res.status(500).json({message : "server error while update password"})
    }
};

// update user by admin (admin can update name, email, and role but with strict validation if admin want to change role)
const changeUserRole = async (req, res) => {
    try {
        const { id } = req.body; 
        const { targetRole } = req.body; 
        const { newNISORNIP } = req.body;


        if (targetRole === 'teacher') {
            const student = await Student.findOne({ where: { id_student: id } });
            if (!student) return res.status(404).json({ message: "Data siswa tidak ditemukan." });

            const hasClass = await User.findOne({ where: { id_student: id } });
            const hasSubmission = await assignmentStudent.findOne({ where: { id_student: id } });

            if (hasClass || hasSubmission ) {
                return res.status(400).json({
                    message: "Gagal mengubah peran! Siswa ini sudah memiliki riwayat tugas atau kelas."
                });
            }

            await Teacher.create({
                id_teacher: student.id_student,
                username: student.username,
                email: student.email,
                nip: newNISORNIP
            });

            await User.update({ role: 'teacher' }, { where: { id_user: id } });

            await student.destroy();
            return res.status(200).json({ message: "Berhasil mengubah peran Siswa menjadi Guru." });
        }

        if (targetRole === 'student') {
            const teacher = await Teacher.findOne({ where: { id_teacher: id } });
            if (!teacher) return res.status(404).json({ message: "Data guru tidak ditemukan." });

 
            const ownsClass = await Class.findOne({ where: { id_teacher: id } });
            if (ownsClass) {
                return res.status(400).json({
                    message: "Gagal mengubah peran! Guru ini masih aktif mengajar atau memiliki kelas di aplikasi."
                });
            }


            const createdAssignment = await Assignment.findOne({ where: { id_teacher: id } });
            if (createdAssignment) {
                return res.status(400).json({
                    message: "Gagal mengubah peran! Guru ini sudah memiliki riwayat membuat tugas."
                });
            }

  
            await Student.create({
                id_student: teacher.id_teacher,
                username: teacher.username,
                email: teacher.email,
                nis: newNISORNIP
            });
            
            await User.update({ role: 'student' }, { where: { id_user: id } });

            await teacher.destroy();
            return res.status(200).json({ message: "Berhasil mengubah peran Guru menjadi Siswa." });
        }

        return res.status(400).json({ message: "Target role tidak valid. Gunakan 'student' atau 'teacher'." });

    } catch (error) {
        return res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// GET all
const getUser = async ( req, res) => {
    try{
        const users = await User.findAll({attributes:{exclude : ["password"]}});
        res.json(users);
    }catch (err) {
        console.error(err)
        res.status(500).json({message : "cannot run GET method"})
    }
};

// GET BY ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {attributes: ["id_user", "username", "email", "role",'profile_picture_url'], exclude : ["password"]});
        if (!user) return res.status(400).json({message : "user not found"});
        res.json(user);

    } catch (err){
        console.error (err) 
        res.status(500).json({message :"cannot run method GET BY ID"})
    }
};

// get student by id class 
const getStudentByIdClass = async (req, res) => {
    try {
        const id_class = req.params.id_class;
        if (!id_class) return res.status(400).json({ message: "id class is required" });

        const students = await Class.findAll({
            where: {
                id_class: id_class
            },
            attributes: [], 
            include: [
                {
                    model: Student,
                    attributes: ['id_student', 'username', 'nis'] 
                }
            ]
        });

        res.json(students);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error while get student by id class" });
    }
};

//get all teachers
const getAllTeachers = async (req, res) => {
    try{
        const teachers = await Teacher.findAll({
            attributes : ["id_teacher", "username"]
        })
        res.json(teachers);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error while get all teachers" });
    }
};
//update user
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        if (!user ) return res.status (404).json({message : "user not found"});
        const {username, email, role} = req.body;
        await user.update({username, email, role});
        res.json({message : "User updated successfully.", data : { id : user.id, username : user.username, email : user.email, role : user.role}});
    }catch (err) {
        console.error(err)
        res.status(500).json({message : "server error while update user"})
    }
};
// update email 
const updateEmail = async (req, res) => {
    try{
        const userId = await User.findByPk(req.user.id);
        if (!userId) return res.status(404).json({message : " User not found"});
        const {email} = req.body;
        await userId.update({email});
        res.json({message : "User email updated successfully.", data : { id : userId.id, username : userId.username, email : userId.email}});
    }catch (err) {
        console.error(err)
        res.status(500).json({message : "server error while update email"})
    }
};

// update username
const updateUsername = async (req, res) => {
    try{
        const userId = await User.findByPk(req.user.id);
        if (!userId) return res.status(404).json({message : " User not found"});
        const {username} = req.body;
        await userId.update({username});
        res.json({message : "User username updated successfully.", data : { id : userId.id, username : userId.username, email : userId.email}});
    }catch (err) {
        console.error(err)
        res.status(500).json({message : "server error while update username"})
    }
};

// update profile picture
const updateProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const user = await User.findByPk(req.user.id);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const oldPublicId = user.profile_public_id; 

        const newImageUrl = req.file.path;
        const newPublicId = req.file.filename; 

      
        await user.update({
            profile_picture_url: newImageUrl,
            profile_public_id: newPublicId
        });

        if (oldPublicId) {
            try {
                await cloudinary.uploader.destroy(oldPublicId);
            } catch (cloudErr) {
                console.error("Cloudinary Destroy Error:", cloudErr);
            }
        }

        return res.status(200).json({
            message: "Profile picture updated successfully",
            profile_picture_url: newImageUrl
        });

    } catch (err) {
        console.error("Error Detail:", err);
        return res.status(500).json({
            message: "Internal Server Error",
            error: err.message
        });
    }
};


// delete for admin
const deleteUser = async ( req , res) => {
    try {
        const id_user = req.params.id;
        const user = await User.findByPk(id_user);
        if (!user) return res.status(400).json({message : "user not found"});
        await user.destroy();
        res.json({message : "success delete user by admin", data : { id : user.id, username : user.username, email : user.email, role : user.role}});
    }catch ( error){
    console.error(error)
    res.status(500).json({message : "cannot run method Delete for admin"})
}
};

// check me
const checkMe = async (req, res) => {
    try {
        res.status(200).json({
            isAuthenticated: true,
            user: {
                id: req.user.id,
                role: req.user.role,
                username: req.user.username
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "cannot run method CHECK ME" });
    }
};

// logout
const logout = (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    path: '/'
  });
  return res.json({ success: true });
};



module.exports = {
    register, 
    login, 
    resendOtp,
    verifyOtpLogin, 
    getUser, 
    getUserById, 
    getAllTeachers,
    getStudentByIdClass,
    validateEmail,
    checkMe, 
    updateProfilePicture,
    updatePassword,
    updateEmail,
    updateUser,
    updateUsername,
    logout,
    changeUserRole,
    deleteUser, 
    };