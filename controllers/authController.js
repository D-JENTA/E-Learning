const db = require("../config/db");
const bcrypt = require("bcrypt"); 
const register = async (req, res) => {
    const {username, email, password, role} = req.body;
    try {
        const [rows] = await db.execute("SELECT * FROM user_tb WHERE email = ?",[email]);
        if(rows.length > 0) return res.status(400).json({massage:"email telah terdaftar"});
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute("INSERT INTO user_tb (nama, email, password, role) VALUES (?, ?, ?, ?)", [username, email, hashedPassword, "siswa"]); 
        
        res.status(201).json({message:"pengguna berhasil regis"});
    } catch (err) {
        console.error(err);
        res.status(500).json({message: "server error"})
    }
};

module.exports = {register};