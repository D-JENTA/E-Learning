const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Student = require("../models/student");
const Teacher = require("../models/teacher");
const SECRET_KEY = process.env.JWT_SECRET;

// register
const register = async (req, res)=>{
    try {
        const { username, email, password, role, nis, nip } = req.body;
        if (!username || !email || !password) 
            return res.status(400).json({message:"semua kolom wajib di isi"});

        if (!["student", "teacher", "admin"].includes(role))
            return res.status(400).json({message : "role wajib diisi"});

        if(role === "student" && (!nis || nis.trim() === ""))
            return res.status(400).json({message : "NIS wajib diisi"});

        if(role === "teacher" && (!nip || nip.trim() === ""))
            return res.status(400).json({message : "NIP wajib diisi"});

        const existingUser = await User.findOne({where:{email}})
        if (existingUser)
            return res.status(400).json({message:"email sudah terdaftar"});

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password : hashedPassword,
            role
        });
        
        if(role === "student") {
            await Student.create({ id_student: newUser.id_user, nis, username: newUser.username});
        }else if (role === "teacher"){
            await Teacher.create({id_teacher: newUser.id_user, nip, username: newUser.username});
        }

        res.status(201).json({
            message:"ser logged in successfully",
            User : {id : newUser.id_user, username : newUser.username, email : newUser.email, role : newUser.role}
        });
    } catch (err){
    console.error (err)
    res.status(500).json({message:"server error"})
    }
};


// login
const login = async (req, res) => {
    try {
        const { email, password} = req.body;

        const user = await User.findOne({where:{email}});
        if (!user) return res.status(400).json({message:"email not found"});
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({message:"wrong password"});

        const token = jwt.sign({id : user.id, role : user.role}, SECRET_KEY, {expiresIn : "1d"});

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
        res.status(500).json({message : " cannot run GET method"})
    }
};


// GET BY ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {attributes : {exclude : ["password"]}});
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
        const user = await User.findByPk(req.params.id);
        if (!user) return res.status(400).json({message : " User not found"});

        const {username, email, password, role} = req.body;
        let hashedPassword = user.password;
        if (password) hashedPassword = await bcrypt.hash(password, 10);

        await user.update({username, email, password : hashedPassword, role});
        res.json({message : "User data updated successfully.", data : { id : user.id, username : user.username, email : user.email, role : user.role}});
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

module.exports = {register, login, getUser, getUserById, updateUser, deleteUser};