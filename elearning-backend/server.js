require("dotenv").config();
const express = require("express");
const sequelize = require("./config/db");
const cors = require("cors");
const http = require("http");
const { initSocket } = require("./socket/index");
const cookieParser = require("cookie-parser")
const app = express();
const server = http.createServer(app);
const cronCleaner = require("./middleware/cronCleaner")
const PORT =5000; 
const authRoutes = require("./routes/auth");
const tugasRoutes = require("./routes/tugasRoute");
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

app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// use router
app.use("/api", authRoutes);    
app.use("/api", tugasRoutes);    
app.use("/api", classRoutes);

app.use((err, req, res, next) => {
    console.error('ERROR:', err.message);
    res.status(400).json({ message: err.message });
});
sequelize.sync();

app.get("/", (req, res) => {
    res.send("server express running");
});

cronCleaner();


server.listen(PORT, '0.0.0.0', () => { 
    console.log(`Server running on port ${PORT}`);
});