const express = require("express");
const sequelize = require("./config/db");
const app = express();
const cors = require("cors");
const PORT = process.env.PORT;
const authRoutes = require("./routes/auth");
const tugasRoutes = require("./routes/tugasRoute");
const classRoutes = require("./routes/classRoute");
// const studentRoutes = require("./routes/studentRoute");
require("dotenv").config();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: "http://localhost:5173"
}));


// use router
app.use("/api", authRoutes);    
app.use("/api", tugasRoutes);    
app.use("/api", classRoutes);
// app.use("/api",studentRoutes);

sequelize.sync()

app.get("/", (req, res) => {
    res.send("server express running") 
})

app.listen(PORT, () => {
    console.log(`server running on port ${PORT}`);
});
