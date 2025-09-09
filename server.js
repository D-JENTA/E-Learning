const express = require("express");
const app = express();
const PORT = 5000;
app.use(express.json());

const authRoutes = require("./routes/auth")
app.use("/api/auth", authRoutes)

app.get("/", (req, res) => {
    res.send("server express berjalan")
})

app.listen(PORT, () => {
    console.log(`server berjalan di port ${PORT}`);
});
