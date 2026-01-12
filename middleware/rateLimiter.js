const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs : 1 * 60 * 1000,
    max:5,
    message : {
        message : "too many login attempts, try again after 1 minute"
    },
    standardHeaders: true,
    legacyHeaders:false
})

module.exports = loginLimiter;