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
const Class = require("../models/class");
const cloudinary = require("cloudinary").v2;

const loginAdmin = async ( req, res) => {
    try {
        const{email , password} = req.body;

        const admin = await User.findOne({where : {email, role : ["admin", "superAdmin"]}});
        if (!admin) return res.status(400).json({message : "admin not found"});

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return res.status(400).json({message : "wrong password"});

        await emailOtp.destroy({ where: { user_id: admin.id_user }});
        
        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiredAt = new Date(Date.now() + 5 * 60000);

        await emailOtp.create({
        user_id: admin.id_user,
        otp: generatedOtp,
        expires_at:expiredAt
        })

        setImmediate(() => {
            sendEmail(email, generatedOtp).catch(console.error);
        });
        const token = jwt.sign({id : admin.id_user, role : admin.role}, SECRET_KEY, {expiresIn : "1d"});

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        })
        
        res.status(200).json({message : "login success",token : token, user: { id: admin.id_user, role: admin.role }});
    } catch (err) {
        console.error(err);
        return res.status(500).json({message : "server error"});
    }
}

// register
const register = async (req, res) => {
    let t;
    const SALT_ROUNDS = 5;
    try {
        const { username, email, password, role, nis, nip } = req.body;

        // Validation Input
        if (!username || !email) return res.status(400).json({ message: "all fields must be filled in" });
        if (!password || password.length < 6) return res.status(400).json({ message: "password must be more then 8 characters" });
        if (!["student", "teacher", "admin"].includes(role)) return res.status(400).json({ message: "role must be filled" });

        if (role === "student" && (!nis || nis.trim() === "")) return res.status(400).json({ message: "NIS must be filled in" });
        if (role === "teacher" && (!nip || nip.trim() === "")) return res.status(400).json({ message: "NIP must be filled in" });

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
            await Student.create({ id_student: newUser.id_user, nis, username: newUser.username }, { transaction: t });
        } else if (role === "teacher") {
            await Teacher.create({ id_teacher: newUser.id_user, nip, username: newUser.username }, { transaction: t });
        }

        await t.commit();

        const token = jwt.sign({id : newUser.id_user, role : newUser.role}, SECRET_KEY, {expiresIn : "1d"});
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        })

        setImmediate(() => {
            sendEmail(email, generatedOtp).catch(console.error);
        });

        res.status(201).json({
            message: "registration successful, check your email for otp",
            token,
            user_id: newUser.id_user,
            user: {
                id_user: newUser.id_user,
                username: newUser.username,
                role: newUser.role,
                token: token
            }
        });

    } catch (err) {
        if (t && !t.finished) await t.rollback();
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
};

//verify otp
const verifyOtp = async (req,res) => {
    const t = await sequelize.transaction();
    try {
        const {user_id, otp} =req.body;
        if(!user_id || !otp) {
            return res.status(400).json({message : "user_id and otp are required"});
        }

        const user = await User.findByPk(user_id, {transaction : t});
        if (!user) {
            return res.status(404).json({message: "user not found"})
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

        if(otpData.expires_at < new Date()) {
            await otpData.destroy({transaction : t});
            await t.commit();
            return res.status(400).json({message: "otp expired"})
        }

        await user.update(
            {is_verified : true},
            {transaction : t}
        );

        await otpData.destroy({transaction : t});

        await t.commit();

        return res.json({message : "OTP verified successfully",
        user : {id_user : user.id_user,
        username : user.username,
        email : user.email,
        role : user.role 
        }})
    }catch (err){
        if(!t.finished){await t.rollback()};
        console.error(err)
        return res.status(500).json({message : "server error"})
    }
};

// login
const login = async (req, res) => {
    try {
        const { email, password} = req.body;

        const user = await User.findOne({where:{email, role : ["student", "teacher"]}});
        if (!user) return res.status(400).json({message:"email not found"});
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({message:"wrong password"});

        await emailOtp.destroy({ where: { user_id: user.id_user }});

        const token = jwt.sign({id : user.id_user, role : user.role}, SECRET_KEY, {expiresIn : "1d"});

        res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        })
        
        res.json({
        message: "login success, check your email for otp",
        token,
        user_id: user.id_user,
        user: { 
            id_user: user.id_user, 
            username: user.username, 
            role: user.role 
        }
});
    } catch (err) {
        console.error (err)
        res.status(500).json({message : "server error"})
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

// input user by superAdmin

const inputUser = async (req, res) => {
    try {
        const { username, email, password, role, nis, nip } = req.body;
        if (!username || !email) return res.status(400).json({ message: "all fields must be filled in" });
        if (!password || password.length < 6) return res.status(400).json({ message: "password must be more then 8 characters" });
        if (!["student", "teacher", "admin"].includes(role)) return res.status(400).json({ message: "role must be filled" });
        if (role === "student" && (!nis || nis.trim() === "")) return res.status(400).json({ message: "NIS must be filled in" });
        if (role === "teacher" && (!nip || nip.trim() === "")) return res.status(400).json({ message: "NIP must be filled in" });

        const existingUser = await User.findOne({ where: { email }, attributes: ["id_user"] });
        if (existingUser) return res.status(400).json({ message: "email already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            username,
            email,
            password: hashedPassword,
            role,
            nis,
            nip,
            is_verified: true
        });

        res.status(201).json({ message: "User created successfully", data: user });
    }catch (err) {
        console.error(err)
        res.status(500).json({message : "server error while input user by super admin"})
    }
}

//update password
const updatePassword = async (req, res) => {
    try{
        
        const{user_id, newPassword} = req.body;
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

// GET PROFILE PICTURE URL
const getProfilePicture = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ["profile_picture_url"],
            raw: true
        });
        
        if (!user) return res.status(400).json({ message: "user not found" });
        
        res.json({ 
            profile_picture_url: user.profile_picture_url || null,
            message: user.profile_picture_url ? "profile picture found" : "no profile picture set"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
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
}

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

// update role for admin and super admin
const updateRole = async (req, res) => {
    try {
        const { id_user, role } = req.body; 
        if (!id_user) return res.status(404).json({ message: "User not found" });
        
        if (!["student", "teacher", "admin"].includes(role)) 
            return res.status(400).json({ message: "Invalid role" });

        await User.update({ role: role }, { where: { id_user: id_user } });

      
        const updatedUser = await User.findByPk(id_user);

        res.json({ 
            message: "User role updated successfully.", 
            data: updatedUser 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while updating role" });
    }
};
// update profile picture
const updateProfilePicture = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);

        if (user.profile_picture_url && user.profile_picture_url.includes('cloudinary')) {
            try {
                const publicId = user.profile_picture_url.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`e-learning_profiles/${publicId}`);
            } catch (cloudErr) {
                console.error("Cloudinary Destroy Error:", cloudErr);
                
            }
        }

        // Pastikan req.file ada
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        const newImageUrl = req.file.path;
        await user.update({ profile_picture_url: newImageUrl });

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

// DELETE for super admin only
const deleteUser = async ( req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if(!user) return res.status(400).json({message : " User not found"});

        await user.destroy();
        res.json({message: "success delete user ", data : { id : user.id, username : user.username, email : user.email, role : user.role}});
    } catch (err) {
        console.error (err)
        res.status(500).json({message : " cannot run method DELETE for super admin only"})
    }
};

// delete for admin
const deleteForAdmin = async ( req , res) => {
    try {
        const id_user = req.params.id;
        const user = await User.findByPk(id_user);
        if (!user) return res.status(400).json({message : "user not found"});
        if (user.role === "superAdmin") return res.status(403).json({message : "you are not allowed to delete super admin"});
        await user.destroy();
        res.json({message : "success delete user by admin", data : { id : user.id, username : user.username, email : user.email, role : user.role}});
    }catch ( error){
    console.error(error)
    res.status(500).json({message : "cannot run method Delete for admin"})
}
}
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
    loginAdmin,
    register, 
    login, 
    getUser, 
    getUserById, 
    deleteUser, 
    deleteForAdmin, 
    verifyOtp, 
    checkMe, 
    logout,
    updateProfilePicture,
    resendOtp,
    validateEmail,
    updatePassword,
    inputUser,
    getStudentByIdClass,
    updateEmail,
    updateUsername,
    getProfilePicture,
    updateRole
    };