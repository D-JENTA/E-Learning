
const mysql = require("mysql2/promise");

const db = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "",
    database: "elearning_db",
    waitForConnection: true,
    connectionLimit: 10,
    queueLimit: 0,
});

module.exports = db;