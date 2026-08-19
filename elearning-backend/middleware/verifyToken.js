const jwt = require("jsonwebtoken");

// Token-only: token hanya dibaca dari header Authorization: Bearer <token>
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

    if (!token) {
        return res.status(401).json({
            isAuthenticated: false,
            message: "Unauthorized, token not found"
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({
            isAuthenticated: false,
            message: "Unauthorized, invalid token"
        });
    }
};

module.exports = verifyToken;
