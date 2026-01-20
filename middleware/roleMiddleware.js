const isAdmin = (req, res, next) => {
        if (req.user.role !== "admin") {
            return res.status(403).json({message:"admin only"});
            }
        next()
};

const isStudent = (req, res, next) => {
    if(req.user.role !== "student"){
        return res.status(403).json({message:"student only"})
    }
    next()
};

const isTeacher = (req, res, next) => {
    if(req.user.role !== "teacher") {
        return res.status(403).json({message:"teacher only"})
    }
    next()
};

module.exports = {isAdmin, isStudent, isTeacher};