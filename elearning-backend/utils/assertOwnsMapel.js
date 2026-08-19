// utils/assertOwnsMapel.js
const { Mapel } = require("../models");

// admin dilewatkan (route isTeacher memang mengizinkan admin); guru wajib pemilik mapel
const assertOwnsMapel = async (user, id_mapel) => {
    if (user.role === "admin") return null;

    const mapel = await Mapel.findOne({
        where: { id_mapel, id_teacher: user.id }
    });

    if (!mapel) {
        const error = new Error("Anda tidak memiliki akses ke mapel ini");
        error.status = 403;
        throw error;
    }

    return mapel;
};

module.exports = assertOwnsMapel;
