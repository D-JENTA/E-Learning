const isAdmin = (req, res, next) => {
    if (req.user.role === "admin" || req.user.role === "superAdmin") {
        return next();
    }
    return res.status(403).json({ message:"Access denied: Admin only" });
};

const isSuperAdmin = (req, res, next) => {
    if (req.user && req.user.role === "superAdmin") {
        return next();
    }
    return res.status(403).json({ message: "Access denied: Super Admin only" });
};

const isStudent = (req, res, next) => {
    if (req.user.role === "student" || req.user.role === "superAdmin") {
        return next();
    }
    return res.status(403).json({ message: "Access denied: student only" });
};

const isTeacher = (req, res, next) => {
    if (req.user.role === "teacher" || req.user.role === "superAdmin") {
        return next();
    }
    return res.status(403).json({ message: "Access denied: Teacher only" });
};

module.exports = { isAdmin, isSuperAdmin, isStudent, isTeacher };