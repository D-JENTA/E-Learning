const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const SECRET_KEY = process.env.JWT_SECRET;
const emailOtp = require("../models/emailOtps");
const sequelize = require("../config/db");
const sendEmail = require("../utils/sendEmail");



// register
const register = async (req, res)=>{
    let t;
    const SALT_ROUNDS = 5;
    try {
        const { username, email, password, role, nis, nip } = req.body;
       
        if (!username || !email ) 
            return res.status(400).json({message:"all fields must be filled in"});
        if (!password || password.length < 8)
            return res.status(400).json({message:"password must be more then 8 characters"})
        if (!["student", "teacher", "admin"].includes(role))
            return res.status(400).json({message : "role must be filled"});

        if(role === "student" && (!nis || nis.trim() === ""))
            return res.status(400).json({message : "NIS must be filled in"});

        if(role === "teacher" && (!nip || nip.trim() === ""))
            return res.status(400).json({message : "NIP must be filled in"});

        const existingUser = await User.findOne({where:{email},attribute : ["id_user"]})

        if (existingUser)
            return res.status(400).json({message:"email is registered"});

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        t = await sequelize.transaction();

        const newUser = await User.create({
            username,
            email,
            password : hashedPassword,
            role,
            is_verified: false
        },{transaction : t});

        const otp = Math.floor(100000 + Math.random() *900000).toString();

        await emailOtp.create({
            user_id: newUser.id_user,
            otp,
            expires_at: new Date(Date.now() + 5 * 60 * 1000)
        },{transaction : t});
        
        if(role === "student") {
            await Student.create({ id_student: newUser.id_user, nis, username: newUser.username},{transaction : t});
        }else if (role === "teacher"){
            await Teacher.create({id_teacher: newUser.id_user, nip, username: newUser.username}, {transaction : t});
        }
        await t.commit();
       
        res.status(201).json({
            message:"register successfully, check your email for otp",
            user_id :newUser.id_user
        });

    setImmediate(() => {
      sendEmail(email, otp).catch(console.error);
    });



    } catch (err){
        if(!t.finished){
            await t.rollback();
        }
    console.error (err);
    res.status(500).json({message:"server error"})
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

        const otpData = await emailOtp.findOne({where: {user_id, otp},transaction : t })

        if(!otpData){
            return res.status(400).json({message: "invalid otp"})
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

        return res.json({message : "OTP verified successfully"})
    }catch (err){
        if(!t.finished){await t.rollback()};
        console.error(err)
        return res.status(500).json({message : "server error"})
    }
}

// login
const login = async (req, res) => {
    try {
        const { email, password} = req.body;

        const user = await User.findOne({where:{email}, attribute : ["id_user","username","email","role"]});
        if (!user) return res.status(400).json({message:"email not found"});
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({message:"wrong password"});

        const token = jwt.sign({id : user.id_user, role : user.role}, SECRET_KEY, {expiresIn : "1d"});

        res.json ({
            message : "login success",
            token,
            user : { id : user.id, username : user.username, email : user.email, role : user.role}
        });
    } catch (err) {
        console.error (err)
        res.status(500).json({message : "server error"})
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
        const user = await User.findByPk(req.user.id, {attributes : {exclude : ["password"]}});
        if (!user) return res.status(400).json({message : "user not found"});
        res.json(user);

    } catch (err){
        console.error (err) 
        res.status(500).json({message :"cannot run method GET BY ID"})
    }
};

// UPDATE USER
const updateUser = async (req, res) => {
    try {
        const userId = await User.findByPk(req.user.id);
        console.log("req.user : " ,req.user);
        if (!userId) return res.status(404).json({message : " User not found"});
        
        const {username, email, password} = req.body;
        let hashedPassword = userId.password;
        if (password) hashedPassword = await bcrypt.hash(password, 10);

        await userId.update({username, email, password : hashedPassword});
        res.json({message : "User data updated successfully.", data : { id : userId.id, username : userId.username, email : userId.email}});
    } catch (err) {
        console.error(err)
        res.status(500).json({message : "cannot run method UPDATE"})
    }
};

// DELETE
const deleteUser = async ( req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if(!user) return res.status(400).json({message : " User not found"});

        await user.destroy();
        res.json({message: "success delete user ", data : { id : user.id, username : user.username, email : user.email, role : user.role}});
    } catch (err) {
        console.error (err)
        res.status(500).json({message : " cannot run method DELETE"})
    }
};

module.exports = {register, login, getUser, getUserById, updateUser, deleteUser, verifyOtp};