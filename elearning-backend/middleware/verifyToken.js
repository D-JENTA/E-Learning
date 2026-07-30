const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {

        const token = req.cookies.token; 

        if (!token) {
            return res.status(401).json({ message: "Unauthorized, token not found" });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded; 
        
        next();
    } catch (error) {
        return res.status(401).json({ 
            isAuthenticated: false,
            message: "Unauthorized, invalid token",
            error: error.message
         });
    }
};

module.exports = verifyToken;