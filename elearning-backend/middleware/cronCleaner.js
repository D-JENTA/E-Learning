const cron = require("node-cron");
const { Op } = require("sequelize");
const e = require("express");
const { User, emailOtp } = require("../models");
const fs = require("fs");
const path = require("path");


const cronCleaner = () => {

    function cleanTempUploads() {
        const tempDir = path.join(__dirname, "..", "config", "temp_uploads"); // sesuaikan path
        const oneHour = 60 * 60 * 1000;

        fs.readdir(tempDir, (err, files) => {
            if (err) return console.error("Gagal baca temp_uploads:", err.message);

            files.forEach((file) => {
                const filePath = path.join(tempDir, file);
                fs.stat(filePath, (err, stats) => {
                    if (err) return;
                    const age = Date.now() - stats.mtimeMs;
                    if (age > oneHour) {
                        fs.unlink(filePath, (err) => {
                            if (err) console.error(`Gagal hapus ${file}:`, err.message);
                            else console.log(`File temp dihapus: ${file}`);
                        });
                    }
                });
            });
        });
    }

    cron.schedule("*/30 * * * *", () => {
        console.log("[CRON] running cleanup of temp_uploads...");
        cleanTempUploads();
    });



    cron.schedule("0 2 * * *", async () => {
        try {
            console.log("[CRON] running cleanup of unverified users...");
            
            const deleted = await User.destroy({
                where: {
                    is_verified: false,
                    created_at: {   
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