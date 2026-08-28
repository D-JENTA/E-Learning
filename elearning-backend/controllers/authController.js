const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
    User,
    Student,
    Teacher,
    Mapel,
    Assignment,
    assignmentStudent,
    emailOtp
} = require("../models");
const sequelize = require("../config/db");
const {sendEmail, sendTeacherCredentialsEmail} = require("../utils/sendEmail");
const { destroyCloudinaryFiles } = require("../config/cloudinary");
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
const crypto = require("crypto");

//generate pw teacher
const generateTempPassword = (length = 6) => {
    return crypto.randomBytes(length).toString("base64url").slice(0, length);
};

// satu OTP aktif per user (UNIQUE(user_id) di DB) -> upsert, bukan destroy+create
const issueOtp = async (user_id, transaction) => {
    const otp = generateOtp();
    await emailOtp.upsert(
        {
            user_id,
            otp,
            expires_at: new Date(Date.now() + 5 * 60 * 1000),
            created_at: new Date()
        },
        { transaction }
    );
    return otp;
};

const signToken = (user) =>
    jwt.sign({ id: user.id_user, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

// register student
const registerStudent = async (req, res) => {
    let t;
    const SALT_ROUNDS = 10;
    try {
        const { username, email, password, nis, id_class } = req.body;

        // Validation Input
        if (!username || !email) return res.status(400).json({ message: "all fields must be filled in" });
        
        if (!password || password.length < 6) return res.status(400).json({ message: "password must be at least 6 characters" });

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const fixrole = "student";

        t = await sequelize.transaction();

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role : fixrole,
            is_verified: false
        }, { transaction: t });

        const generatedOtp = await issueOtp(newUser.id_user, t);
       
        await Student.create({ id_student: newUser.id_user, nis, id_class }, { transaction: t });

        await t.commit();


        setImmediate(() => {
            sendEmail(email, generatedOtp).catch(console.error);
        });

        res.status(201).json({
            message: "registration successful, check your email for otp",
            user: {
                id_user: newUser.id_user,
                username: newUser.username,
                role: newUser.role
            }
        });

    } catch (err) {
        if (t && !t.finished) await t.rollback();
        // race register: dua request email sama -> 400, bukan 500
        if (err.name === "SequelizeUniqueConstraintError") {
            const field = Object.keys(err.fields || {})[0] || "";
            if (field.includes("nis")) return res.status(400).json({ message: "NIS is already used" });
            if (field.includes("nip")) return res.status(400).json({ message: "NIP is already used" });
            return res.status(400).json({ message: "email is registered, please log in" });
        }
        if (err.name === "SequelizeValidationError") {
            return res.status(400).json({ message: err.errors.map(e => e.message).join(", ") });
        }
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
};

//register teacher
const registerTeacher = async (req, res) => {
    let t;
    const SALT_ROUNDS = 10;
    try {
        const { username, email, nip } = req.body;
        
        if (!username || !email || !nip) return res.status(400).json({ message: "all fields must be filled in" });
        
        const tempPassword = generateTempPassword(6)
        const hashedPassword = await bcrypt.hash(tempPassword, SALT_ROUNDS);

        const fixrole = "teacher";

        t = await sequelize.transaction();

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
            role : fixrole,
            is_verified: true
        }, { transaction: t });
       
        await Teacher.create({ id_teacher: newUser.id_user, nip, }, { transaction: t });

        await t.commit();

        setImmediate(() => {
            sendTeacherCredentialsEmail(email, username, tempPassword).catch(console.error);
        });

        res.status(201).json({
            message: "registration successful, check your email for your password",
            user: {
                id_user: newUser.id_user,
                username: newUser.username,
                role: newUser.role
            }
        });

    } catch (err) {
        if (t && !t.finished) await t.rollback();
        // race register: dua request email sama -> 400, bukan 500
        if (err.name === "SequelizeUniqueConstraintError") {
            const field = Object.keys(err.fields || {})[0] || "";
            if (field.includes("nis")) return res.status(400).json({ message: "NIS is already used" });
            if (field.includes("nip")) return res.status(400).json({ message: "NIP is already used" });
            return res.status(400).json({ message: "email is registered, please log in" });
        }
        if (err.name === "SequelizeValidationError") {
            return res.status(400).json({ message: err.errors.map(e => e.message).join(", ") });
        }
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

        await user.update({ is_verified: true }, { transaction: t });

        await t.commit();


        return res.json({
            message: "login success",
            token: signToken(user),
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

            const otpCode = await issueOtp(user.id_user);

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

            return res.status(200).json({
                message: "login success",
                token: signToken(user),
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

// resend otp (tanpa token: dipakai tepat setelah register, saat user belum punya token)
const resendOtp = async (req, res) => {
    try {
        const { user_id, email } = req.body;
        if (!user_id && !email) {
            return res.status(400).json({ message: "user_id atau email wajib diisi" });
        }

        const user = user_id
            ? await User.findByPk(user_id)
            : await User.findOne({ where: { email } });

        if (!user || !user.email) {
            return res.status(404).json({ message: "Email user tidak ditemukan" });
        }

        const generatedOtp = await issueOtp(user.id_user);

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
        const generatedOtp = await issueOtp(user.id_user);
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

// update role by admin (student <-> teacher, semua mutasi dalam satu transaction)
const changeUserRole = async (req, res) => {
    const { id, targetRole, newNISORNIP, id_class } = req.body;

    if (!id) return res.status(400).json({ message: "id user wajib diisi." });
    if (!["student", "teacher"].includes(targetRole)) {
        return res.status(400).json({ message: "Target role tidak valid. Gunakan 'student' atau 'teacher'." });
    }
    if (!newNISORNIP || String(newNISORNIP).trim() === "") {
        return res.status(400).json({ message: targetRole === "teacher" ? "NIP baru wajib diisi." : "NIS baru wajib diisi." });
    }
    if (targetRole === "student" && !id_class) {
        return res.status(400).json({ message: "id_class wajib diisi saat mengubah guru menjadi siswa." });
    }

    const t = await sequelize.transaction();
    try {
        if (targetRole === 'teacher') {
            const student = await Student.findOne({ where: { id_student: id }, transaction: t });
            if (!student) {
                await t.rollback();
                return res.status(404).json({ message: "Data siswa tidak ditemukan." });
            }

            // pengumpulan tugas ikut CASCADE terhapus kalau baris siswa dihapus -> blokir
            const hasSubmission = await assignmentStudent.findOne({ where: { id_student: id }, transaction: t });
            if (hasSubmission) {
                await t.rollback();
                return res.status(400).json({
                    message: "Gagal mengubah peran! Siswa ini sudah memiliki riwayat pengumpulan tugas."
                });
            }

            await Teacher.create({ id_teacher: student.id_student, nip: newNISORNIP }, { transaction: t });
            await User.update({ role: 'teacher' }, { where: { id_user: id }, transaction: t });
            await student.destroy({ transaction: t });

            await t.commit();
            return res.status(200).json({ message: "Berhasil mengubah peran Siswa menjadi Guru." });
        }

        const teacher = await Teacher.findOne({ where: { id_teacher: id }, transaction: t });
        if (!teacher) {
            await t.rollback();
            return res.status(404).json({ message: "Data guru tidak ditemukan." });
        }

        // class_tb tidak punya kolom guru; kepemilikan guru ada di mapel_tb.id_teacher
        // (FK-nya SET NULL, jadi kalau baris guru dihapus mapel jadi tanpa guru tanpa jejak)
        const stillTeaching = await Mapel.findOne({ where: { id_teacher: id }, transaction: t });
        if (stillTeaching) {
            await t.rollback();
            return res.status(400).json({
                message: "Gagal mengubah peran! Guru ini masih mengajar mata pelajaran di aplikasi."
            });
        }

        const createdAssignment = await Assignment.findOne({ where: { id_teacher: id }, transaction: t });
        if (createdAssignment) {
            await t.rollback();
            return res.status(400).json({
                message: "Gagal mengubah peran! Guru ini sudah memiliki riwayat membuat tugas."
            });
        }

        await Student.create({ id_student: teacher.id_teacher, nis: newNISORNIP, id_class }, { transaction: t });
        await User.update({ role: 'student' }, { where: { id_user: id }, transaction: t });
        await teacher.destroy({ transaction: t });

        await t.commit();
        return res.status(200).json({ message: "Berhasil mengubah peran Guru menjadi Siswa." });

    } catch (error) {
        if (!t.finished) await t.rollback();
        if (error.name === "SequelizeUniqueConstraintError") {
            return res.status(400).json({ message: "NIS/NIP tersebut sudah dipakai user lain." });
        }
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// GET all
const getUser = async ( req, res) => {
    try{
        const users = await User.findAll({attributes : ["id_user", "username", "email", "role"]});
        res.json(users);
    }catch (err) {
        console.error(err)
        res.status(500).json({message : "cannot run GET method"})
    }
};

// GET BY ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {attributes: ["id_user", "username", "email", "role", "profile_picture_url"]});
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

        const students = await Student.findAll({
            where: { id_class },
            attributes: ["id_student", "nis"],
            include: [{ model: User, attributes: ["username"] }]
        });

        res.json(students.map(s => ({
            id_student: s.id_student,
            nis: s.nis,
            username: s.User ? s.User.username : null
        })));
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error while get student by id class" });
    }
};

//get all teachers
const getAllTeachers = async (req, res) => {
    try{
        const teachers = await Teacher.findAll({
            attributes : ["id_teacher"],
            include : [{ model: User, as: "User", attributes: ["username"] }]
        });
        res.json(teachers.map(t => ({
            id_teacher: t.id_teacher,
            username: t.User ? t.User.username : null
        })));
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
        res.json({message : "User updated successfully.", data : { id_user : user.id_user, username : user.username, email : user.email, role : user.role}});
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
        res.json({message : "User email updated successfully.", data : { id_user : userId.id_user, username : userId.username, email : userId.email}});
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
        res.json({message : "User username updated successfully.", data : { id_user : userId.id_user, username : userId.username, email : userId.email}});
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

        const oldFile = { file_public_id: user.profile_public_id, file_url: user.profile_picture_url };

        const newImageUrl = req.file.path;
        const newPublicId = req.file.filename;


        await user.update({
            profile_picture_url: newImageUrl,
            profile_public_id: newPublicId
        });

        await destroyCloudinaryFiles([oldFile]);

        return res.status(200).json({
            message: "Profile picture updated successfully",
            profile_picture_url: newImageUrl
        });

    } catch (err) {
        console.error("Error Detail:", err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


// delete for admin
const deleteUser = async ( req , res) => {
    try {
        const id_user = req.params.id;
        const user = await User.findByPk(id_user);
        if (!user) return res.status(400).json({message : "user not found"});
        await user.destroy();
        res.json({message : "success delete user by admin", data : { id_user : user.id_user, username : user.username, email : user.email, role : user.role}});
    }catch ( error){
    console.error(error)
    res.status(500).json({message : "cannot run method Delete for admin"})
}
};

// check me
const checkMe = async (req, res) => {
    res.status(200).json({
        isAuthenticated: true,
        user: {
            id: req.user.id,
            role: req.user.role
        }
    });
};

// logout (token-only: server tidak menyimpan sesi, FE yang membuang tokennya)
const logout = (req, res) => res.json({ success: true });



module.exports = {
    registerStudent, 
    registerTeacher,
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