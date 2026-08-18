const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    try {

        const tokenFromCookie = req.cookies.token;
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader && authHeader.startsWith("Bearer ")
            ? authHeader.split(" ")[1]
            : null;

        const token = tokenFromCookie || tokenFromHeader;
        
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