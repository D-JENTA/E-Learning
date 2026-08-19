require("dotenv").config();
const express = require("express");
const sequelize = require("./config/db");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket/index");
const app = express();
const server = http.createServer(app);
const cronCleaner = require("./middleware/cronCleaner")
const PORT =5000; 
const authRoutes = require("./routes/auth");
const tugasRoutes = require("./routes/tugasRoute");
const fiturRoutes = require("./routes/fiturRoute");
const classRoutes = require("./routes/classRoute");
const path = require('path');


initSocket(server);
app.set("trust proxy", 1);

app.use(cors({
    origin:true,
    credentials:true
})); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// use router
app.use("/api", authRoutes);    
app.use("/api", tugasRoutes);    
app.use("/api", classRoutes);
app.use("/api", fiturRoutes);

app.get("/", (req, res) => {
    res.send("server express running");
});

app.use((err, req, res, next) => {
    console.error('ERROR:', err.message);

if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Ukuran file melebihi batas 100MB.' });
  }

  // error dari Cloudinary (file rusak, format ditolak, dsb) bukan server error kita
  if (err.http_code) {
    return res.status(err.http_code >= 500 ? 502 : 400).json({ message: err.message });
  }

  const statusCode = err.status || 500;
    res.status(statusCode).json({ message: err.message });
});

sequelize.sync();
cronCleaner();


server.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server running on port ${PORT}`);
});