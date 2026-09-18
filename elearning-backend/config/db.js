const Sequelize = require("sequelize");
require("dotenv").config()

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mariadb",
    logging: false,
    timezone: "+07:00",
    dialectOptions: {
      dateStrings: true,
    },
    pool: {
      max: 20,        // maksimum koneksi bersamaan (default cuma 5, sekarang 20)
      min: 0,          // minimum koneksi yang dipertahankan idle
      idle: 10000,     // koneksi idle ditutup setelah 10 detik
      acquire: 30000,  // tunggu maksimum 30 detik untuk dapat koneksi sebelum error
    },
  }
);

sequelize.authenticate()
  .then(() => console.log("successfully connected to the database"))
  .catch(err => {
    console.error("unable to connect to database", err);
    process.exit(1);
  });

module.exports = sequelize;