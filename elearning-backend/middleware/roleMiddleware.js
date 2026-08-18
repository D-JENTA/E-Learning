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

const onlyTeacher= (req, res, next) => {
    if (req.user.role === "teacher") {
        return next();
    }
    return res.status(403).json({ message: "Access denied: Teacher only" });
};

const onlyStudent= (req, res, next) => {
    if (req.user.role === "student") {
        return next();
    }
    return res.status(403).json({ message: "Access denied: Student only" });
};

module.exports = { isAdmin, isStudent, isTeacher, isWakakur, onlyTeacher, onlyStudent };