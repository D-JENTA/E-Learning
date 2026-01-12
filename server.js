const express = require("express");
const sequelize = require("./config/db");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT;
const authRoutes = require("./routes/auth");
const tugasRoutes = require("./routes/tugasRoute");
const classRoutes = require("./routes/classRoute");
const getStudentDasboard = require("./routes/studentRoute");
require("dotenv").config();

// midleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// gunakan router
app.use("/api", authRoutes);    
app.use("/api", tugasRoutes);    
app.use("/api", classRoutes);
app.use("/api",getStudentDasboard);

sequelize.sync()

app.get("/", (req, res) => {
    res.send("server express running") 
})

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
