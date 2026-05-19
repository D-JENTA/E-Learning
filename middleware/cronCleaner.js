const cron = require("node-cron");
const { User } = require("../models/user"); 
const { Op } = require("sequelize");
const e = require("express");
const { emailOtp } = require("../models");


const cronCleaner = () => {
    cron.schedule("0 2 * * *", async () => {
        try {
            console.log("[CRON] running cleanup of unverified users...");
            
            const deleted = await User.destroy({
                where: {
                    is_verified: false,
                    createdAt: { 
                        [Op.lt]: new Date(Date.now() - 24 * 60 * 60 * 1000)
                    }
                }
            });

            console.log(`[CRON] Successfully deleted ${deleted} unverified users.`);
        } catch (error) {
            console.error("[CRON] Error:", error.message);
        }
    });
    cron.schedule("0 2 * * *", async () => {
        try {
            console.log("[CRON] running cleanup of expired OTP codes...");
            const deleted = await emailOtp.destroy({
                where: {
                    expiredAt: { [Op.lt]: new Date() }
                }
            });
            console.log(`[CRON] Successfully deleted ${deleted} expired OTP codes.`);
        } catch (error) {
            console.error("[CRON] Error:", error.message);
        }
});
};

module.exports = cronCleaner;