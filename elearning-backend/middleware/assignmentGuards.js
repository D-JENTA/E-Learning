const { Assignment, assignmentStudent } = require("../models");
const assertOwnsMapel = require("../utils/assertOwnsMapel");

// Guard ini SENGAJA dipasang sebelum multer.
// Upload sekarang stream langsung ke Cloudinary, jadi begitu multer jalan filenya sudah naik.
// Semua penolakan yang bisa diputuskan dari URL + token harus terjadi di sini,
// supaya request yang ditolak tidak menghabiskan bandwidth sama sekali.

// Guru hanya boleh menaruh tugas di mapel yang dia ampu
const canPostAssignment = async (req, res, next) => {
    try {
        await assertOwnsMapel(req.user, req.params.id_mapel);
        next();
    } catch (err) {
        if (err.status) return res.status(err.status).json({ message: err.message });
        console.error(err);
        return res.status(500).json({ message: "server error" });
    }
};

// Siswa: tugas harus ada, belum lewat deadline, dan belum dinilai
const canSubmitAssignment = async (req, res, next) => {
    try {
        const { id_assignment } = req.params;

        const assignment = await Assignment.findByPk(id_assignment, {
            attributes: ["id_assignment", "id_mapel", "deadline"],
            raw: true
        });

        if (!assignment) {
            return res.status(404).json({ message: "Tugas tidak ditemukan atau sudah dihapus oleh guru." });
        }

        if (assignment.deadline && Date.now() > new Date(assignment.deadline).getTime()) {
            return res.status(400).json({ message: "Deadline sudah lewat. Tidak bisa mengumpulkan tugas." });
        }

        const existing = await assignmentStudent.findOne({
            where: { id_student: req.user.id, id_assignment },
            attributes: ["id_assignmentStudent", "score"]
        });

        if (existing && existing.score !== null && existing.score !== undefined) {
            return res.status(400).json({ message: "Tugas sudah dinilai guru, tidak bisa dikumpulkan ulang." });
        }

        req.assignment = assignment;
        next();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "server error" });
    }
};

module.exports = { canPostAssignment, canSubmitAssignment };
