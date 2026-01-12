const Sequelize = require("sequelize");
require("dotenv").config()
const sequelize = new Sequelize(
    process.env.DB_NAME,
     process.env.DB_USER ,
      process.env.DB_PW, 
      {
    host:process.env.BD_HOST,
    dialect:"mysql",
    logging: false,
      });

sequelize.authenticate()
.then(()=> console.log("successfully connected to the database"))
.catch(err => console.log("unable to connect to database", err));

module.exports = sequelize;