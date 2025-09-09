const mysql = require("mysql2/promise");

const db = mysql.creatpool({
    host: "localhost",
    user: "root",
    password: " ",
    database: "elearning_db",
    waitForConnection: true,
    connectionLimit: 10,
    queueLimti: 0,
});

modul.exports = db;