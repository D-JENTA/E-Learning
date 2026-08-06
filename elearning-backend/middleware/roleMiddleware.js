const isAdmin = (req, res, next) => {
    if (req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ message:"Access denied: Admin only" });
};

const isWakakur = (req, res, next) => {
    if (req.user.role === "wakakur" || req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ message:"Access denied: Wakakur only" });
};

const isStudent = (req, res, next) => {
    if (req.user.role === "student" || req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ message: "Access denied: student only" });
};

const isTeacher = (req, res, next) => {
    if (req.user.role === "teacher" || req.user.role === "admin") {
        return next();
    }
    return res.status(403).json({ message: "Access denied: Teacher only" });
};

module.exports = { isAdmin, isStudent, isTeacher, isWakakur };