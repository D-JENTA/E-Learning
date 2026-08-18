// utils/assertOwnsMapel.js
const { Mapel, Teacher } = require("../models");

const assertOwnsMapel = async (id_teacher, id_mapel) => {
    const mapel = await Mapel.findOne({
        where: { id_mapel, id_teacher }
    });

    if (!mapel) {
        const error = new Error("Anda tidak memiliki akses ke mapel ini");
        error.status = 403; 
        throw error;
    }

    return mapel;
};

module.exports = assertOwnsMapel;