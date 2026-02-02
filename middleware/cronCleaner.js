const cron = require("node-cron");
const User = require("../models/user");
const {Op} = require("sequelize");

cron.schedule("0 * * * *", async () => {
    try {
        await User.destroy({
            where: {
                is_verified : false,
                create_at: {
                    [Op.It]:new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }
        });
        console.log("unverified user cleaned")
    }catch(error){
        console.error(err);
        return res.status(500).json({message : "cron error", err})
    }
})