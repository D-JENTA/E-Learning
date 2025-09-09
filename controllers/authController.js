const db = require("../server");
const bcrypt = require(bcrypt);
const registrasi = async (req, res) => {
    const {username, email, password} = req.body;
    try {
        const [row] = await db.execute("SELECT * FORM user_tb WHERE email = ?",[email]);
        if(rows.length > 0) return res.status(400).json({massage:"email telah terdaftar"});
        const hashedPassword = await bcrypt.hash(password, 10);
        await db.execute("INSERT INTO users_tb (nama, email, password) VALUES (?, ?, ?)", [Nama, email, hashedPassword]);
        
        req.status(201).json({masage:"pengguna berhasil regis"});
    } catch (err) {
        console.error(err);
        res.status(500).json({massage: "server error"})
    }
};

module.exports = {register};