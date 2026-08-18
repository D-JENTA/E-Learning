const Sequelize = require("sequelize");
require("dotenv").config()
const sequelize = new Sequelize(
    process.env.DB_NAME,
     process.env.DB_USER ,
      process.env.DB_PASSWORD, 
      {
   host: process.env.DB_HOST,
        dialect: "mariadb",
        logging: false,
        timezone: "+07:00", 
        dialectOptions: {
            dateStrings: true,
        }
      });

sequelize.authenticate()
.then(()=> console.log("successfully connected to the database"))
.catch(err => {
    console.error("unable to connect to database", err);
    process.exit(1);
});


module.exports = sequelize;