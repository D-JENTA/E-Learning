const path = require("path");
const { Assignment, assignmentStudent, Student, User } = require("../models");
const { destroyCloudinaryFiles } = require("../config/cloudinary");
const assertOwnsMapel = require("../utils/assertOwnsMapel");

// File sudah di Cloudinary begitu multer selesai (storage-nya streaming).
// Kalau request akhirnya ditolak/gagal, filenya harus dibuang supaya tidak jadi orphan.
const uploadedFile = (req) =>
  req.file
    ? [{ file_public_id: req.file.filename, file_url: req.file.path }]
    : [];

const isValidUrl = (str) => {
  try {
    const u = new URL(str);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

// POST method assignment
const uploadAssignment = async (req, res) => {
  try {
    const id_teacher = req.user.id;
    const { assignment_title, description, assignment_link } = req.body;
    const id_mapel = req.params.id_mapel;

    // pastikan teacher yang login memang pemilik mapel ini
    // (asumsi: assertOwnsMapel melempar error dengan `err.status` = 403/404 kalau gagal)
    await assertOwnsMapel(req.user, id_mapel);

    const hasFile = !!req.file;
    const hasLink = !!assignment_link && assignment_link.trim() !== "";

    // helper untuk cleanup file yang sudah kepalang naik ke Cloudinary
    const cleanupFile = async () => {
      if (hasFile) {
        await destroyCloudinaryFiles(uploadedFile(req));
      }
    };

    // wajib salah satu: file ATAU link
    if (!hasFile && !hasLink) {
      return res
        .status(400)
        .json({ message: "Wajib upload file atau isi link tugas" });
    }

    // tolak kalau dua-duanya dikirim sekaligus, biar tidak ambigu sumber datanya
    if (hasFile && hasLink) {
      await cleanupFile();
      return res.status(400).json({
        message: "Pilih salah satu: upload file atau isi link, jangan keduanya",
      });
    }

    if (hasLink && !isValidUrl(assignment_link)) {
      await cleanupFile();
      return res
        .status(400)
        .json({ message: "Link tidak valid, gunakan format URL http/https" });
    }

    const missing = [];
    if (!assignment_title) missing.push("assignment_title");
    if (!description) missing.push("description");
    if (missing.length) {
      await cleanupFile();
      return res
        .status(400)
        .json({ message: `field wajib belum diisi: ${missing.join(", ")}` });
    }

    // validasi deadline: kalau dikirim tapi formatnya rusak, tolak sebagai 400 (bukan 500)
    let deadline = null;
    if (req.body.deadline) {
      deadline = new Date(req.body.deadline);
      if (isNaN(deadline.getTime())) {
        await cleanupFile();
        return res.status(400).json({ message: "Format deadline tidak valid" });
      }
    }

    const assignment = await Assignment.create({
      assignment_title,
      description,
      file_url: hasFile ? req.file.path : assignment_link.trim(),
      file_public_id: hasFile ? req.file.filename : null,
      file_extension: hasFile
        ? path.extname(req.file.originalname).slice(1).toLowerCase()
        : "link",
      id_mapel,
      id_teacher,
      deadline,
    });

    res.status(201).json({
      message: "Assignment uploaded successfully",
      data: {
        id: assignment.id_assignment,
        title: assignment.assignment_title,
        fileUrl: assignment.file_url,
        isLink: !hasFile,
        deadline: assignment.deadline,
      },
    });
  } catch (err) {
    await destroyCloudinaryFiles(uploadedFile(req));
    console.error(err);

    // kalau assertOwnsMapel / error lain sudah punya status sendiri (403/404), pakai itu
    const status = err.status || 500;
    const message =
      status !== 500 ? err.message : "Server failed to upload assignment";
    res.status(status).json({ message });
  }
};

// POST method assignment submission (student) - mendukung file ATAU link
const uploadAssignmentStudent = async (req, res) => {
  try {
    const id_student = req.user.id;
    const id_assignment = req.params.id_assignment;
    const { title, submission_link } = req.body;

    const hasFile = !!req.file;
    const hasLink = !!submission_link && submission_link.trim() !== "";

    // helper untuk cleanup file yang sudah kepalang naik ke Cloudinary
    const cleanupFile = async () => {
      if (hasFile) await destroyCloudinaryFiles(uploadedFile(req));
    };

    // wajib salah satu: file ATAU link
    if (!hasFile && !hasLink) {
      return res
        .status(400)
        .json({ message: "Wajib upload file atau isi link tugas" });
    }

    // tolak kalau dua-duanya dikirim sekaligus, biar tidak ambigu sumber datanya
    if (hasFile && hasLink) {
      await cleanupFile();
      return res.status(400).json({
        message: "Pilih salah satu: upload file atau isi link, jangan keduanya",
      });
    }

    if (hasLink && !isValidUrl(submission_link)) {
      // link tidak valid tidak pernah membuat file ke-upload duluan, tapi jaga-jaga tetap panggil cleanup
      await cleanupFile();
      return res
        .status(400)
        .json({ message: "Link tidak valid, gunakan format URL http/https" });
    }

    if (!title) {
      await cleanupFile();
      return res
        .status(400)
        .json({ message: "field wajib belum diisi: title" });
    }

    // tugas + deadline + status dinilai sudah dicek canSubmitAssignment (sebelum upload jalan)
    const assignmentData = req.assignment;

    // dicek ulang: guru bisa menilai selama upload berjalan
    const existing = await assignmentStudent.findOne({
      where: { id_student, id_assignment },
    });
    if (existing && existing.score !== null && existing.score !== undefined) {
      await cleanupFile();
      return res.status(400).json({
        message: "Tugas sudah dinilai guru, tidak bisa dikumpulkan ulang.",
      });
    }

    const newFileUrl = hasFile ? req.file.path : submission_link.trim();
    const newFilePublicId = hasFile ? req.file.filename : null;
    const newFileExtension = hasFile
      ? path.extname(req.file.originalname).slice(1).toLowerCase()
      : "link";

    let assignmentS;
    if (existing) {
      // hapus file Cloudinary lama HANYA kalau submission lama memang berupa file
      // (kalau submission lama itu link, file_public_id sudah NULL, tidak ada yang perlu dihapus)
      const oldFile = existing.file_public_id
        ? {
            file_public_id: existing.file_public_id,
            file_url: existing.file_url,
          }
        : null;

      assignmentS = await existing.update({
        title,
        file_url: newFileUrl,
        file_public_id: newFilePublicId,
        file_extension: newFileExtension,
        id_mapel: assignmentData.id_mapel,
      });

      if (oldFile) await destroyCloudinaryFiles([oldFile]);
    } else {
      assignmentS = await assignmentStudent.create({
        title,
        file_url: newFileUrl,
        file_public_id: newFilePublicId,
        file_extension: newFileExtension,
        id_mapel: assignmentData.id_mapel,
        id_assignment,
        id_student,
      });
    }

    res.status(201).json({
      message: existing
        ? "Assignment replaced successfully"
        : "Assignment submitted successfully",
      data: {
        id: assignmentS.id_assignmentStudent,
        title: assignmentS.title,
        fileUrl: assignmentS.file_url,
        isLink: !hasFile,
        score: assignmentS.score,
      },
    });
  } catch (err) {
    await destroyCloudinaryFiles(uploadedFile(req));
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(404).json({
        message: "Tugas sudah dihapus oleh guru saat upload berjalan.",
      });
    }
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ message: "Pengumpulan sedang diproses, coba lagi." });
    }
    console.error(err);
    res.status(500).json({ message: "Server failed to submit assignment" });
  }
};

//get assignment teacher by id_mapel
const getAssignmentTeacher = async (req, res) => {
  try {
    const { id_mapel } = req.params;

    const assignments = await Assignment.findAll({
      where: {
        id_mapel,
      },
      attributes: [
        "id_assignment",
        "assignment_title",
        "description",
        "file_url",
        "deadline",
      ],
    });
    res.status(200).json({
      status: "success",
      data: assignments.map((item) => ({
        id: item.id_assignment,
        title: item.assignment_title,
        description: item.description,
        fileUrl: item.file_url,
        deadline: item.deadline,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      message:
        "server error while executing the get assignment for student by id_mapel method",
    });
  }
};

// get assignment student by id mapel
const getAssignmentStudent = async (req, res) => {
  try {
    const { id_mapel } = req.params;
    await assertOwnsMapel(req.user, id_mapel);
    const assignments = await assignmentStudent.findAll({
      where: { id_mapel },
      attributes: [
        "id_assignmentStudent",
        "title",
        "file_url",
        "score",
        "createdAt",
      ],
    });
    res.status(200).json({
      status: "success",
      data: assignments.map((item) => ({
        id: item.id_assignmentStudent,
        title: item.title,
        fileUrl: item.file_url,
        score: item.score,
        createdAt: item.createdAt,
      })),
    });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    console.error(err);
    return res.status(500).json({
      message:
        "server error while executing the get assignment student by id_mapel method",
    });
  }
};

//get assignment student by id_assignment
const getAssignmentStudentById = async (req, res) => {
  try {
    const { id_assignment } = req.params;

    const assignment = await Assignment.findByPk(id_assignment, {
      attributes: ["id_mapel"],
    });
    if (!assignment) {
      return res.status(404).json({ message: "Tugas tidak ditemukan" });
    }
    await assertOwnsMapel(req.user, assignment.id_mapel);

    const assignments = await assignmentStudent.findAll({
      where: { id_assignment },
      attributes: [
        "id_assignmentStudent",
        "title",
        "file_url",
        "score",
        "id_student",
        "createdAt",
      ],
      include: [
        {
          model: Student,
          attributes: ["nis"],
          include: [{ model: User, attributes: ["username"] }],
        },
      ],
    });
    res.status(200).json({
      message: "success get assignment student by id_assignment",
      data: assignments.map((item) => ({
        id: item.id_assignmentStudent,
        id_student: item.id_student,
        nis: item.Student ? item.Student.nis : null,
        username:
          item.Student && item.Student.User ? item.Student.User.username : null,
        title: item.title,
        fileUrl: item.file_url,
        score: item.score,
        createdAt: item.createdAt,
      })),
    });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    console.error(err);
    return res.status(500).json({
      message:
        "server error while executing the get assignment student by id_assignment method",
    });
  }
};

// get my submissions (assignment student by id_student)
const getMySubmissions = async (req, res) => {
  try {
    const id_student = req.user.id;
    if (!id_student) {
      return res.status(400).json({ message: "Student ID is required" });
    }
    const submissions = await assignmentStudent.findAll({
      where: { id_student: id_student },
      attributes: [
        "id_assignmentStudent",
        "id_assignment",
        "title",
        "file_url",
        "score",
      ],
    });

    res.status(200).json({
      message: "Success get student submissions",
      data: submissions,
    });
  } catch (err) {
    console.error("Error getMySubmissions:", err);
    return res
      .status(500)
      .json({ message: "Server error saat mengambil data pengumpulan" });
  }
};

// DELETE method assignment teacher
const deleteAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);

    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }

    await assertOwnsMapel(req.user, assignment.id_mapel);

    // pengumpulan siswa ikut CASCADE terhapus -> filenya juga harus dibersihkan
    const submissionFiles = await assignmentStudent.findAll({
      where: { id_assignment: assignment.id_assignment },
      attributes: ["file_public_id", "file_url"],
      raw: true,
    });

    await assignment.destroy();

    await destroyCloudinaryFiles([
      {
        file_public_id: assignment.file_public_id,
        file_url: assignment.file_url,
      },
      ...submissionFiles,
    ]);

    res.status(200).json({ message: "Assignment has been deleted" });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: "Server error while deleting assignment" });
  }
};

// DELETE assignment student
const deleteAssignmentStudent = async (req, res) => {
  try {
    const id_student = req.user.id;
    const { id } = req.params;

    const assignment = await assignmentStudent.findOne({
      where: { id_assignmentStudent: id },
      include: [
        {
          model: Assignment,
          attributes: ["deadline"],
        },
      ],
    });

    if (!assignment) {
      return res
        .status(404)
        .json({ message: "Pengumpulan tugas tidak ditemukan." });
    }

    if (assignment.id_student !== id_student) {
      return res.status(403).json({
        message:
          "Akses ditolak. Anda hanya dapat menghapus tugas milik sendiri.",
      });
    }

    if (assignment.score !== null && assignment.score !== undefined) {
      return res.status(400).json({
        message:
          "Tugas tidak dapat dihapus karena sudah diberi nilai oleh guru.",
      });
    }

    const deadline = assignment.Assignment?.deadline;
    if (deadline && Date.now() > new Date(deadline).getTime()) {
      return res.status(400).json({
        message:
          "Deadline sudah lewat. Tugas yang sudah terkirim tidak dapat dihapus.",
      });
    }

    const file = {
      file_public_id: assignment.file_public_id,
      file_url: assignment.file_url,
    };

    await assignment.destroy();

    await destroyCloudinaryFiles([file]);

    res.status(200).json({ message: "Pengumpulan tugas berhasil dihapus." });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Terjadi kesalahan server saat menghapus tugas." });
  }
};

// post score
const inputScore = async (req, res) => {
  try {
    const { score } = req.body;
    if (
      score === undefined ||
      score === null ||
      Number.isNaN(Number(score)) ||
      score < 0 ||
      score > 100
    ) {
      return res
        .status(400)
        .json({ message: "score wajib berupa angka 0-100" });
    }

    const submission = await assignmentStudent.findByPk(req.params.id, {
      attributes: ["id_assignmentStudent", "id_mapel"],
    });
    if (!submission) {
      return res.status(404).json({ message: "assignment not found" });
    }

    await assertOwnsMapel(req.user, submission.id_mapel);

    await submission.update({ score });

    res.json({ message: "success saving score" });
  } catch (err) {
    if (err.status)
      return res.status(err.status).json({ message: err.message });
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

//total Score
const totalScore = async (req, res) => {
  try {
    const { id_student, id_mapel } = req.query;

    if (!id_student || !id_mapel) {
      return res.status(400).json({
        message:
          "Parameter 'id_student' dan 'id_mapel' wajib diisi pada query URL.",
      });
    }

    await assertOwnsMapel(req.user, id_mapel);

    const total = await assignmentStudent.sum("score", {
      where: { id_student, id_mapel },
    });
    const count = await assignmentStudent.count({
      where: { id_student, id_mapel },
    });

    const average_value = count > 0 ? (total || 0) / count : 0;

    res.json({
      summary: {
        total_assignments: count,
        total_score: total || 0,
        average_value: Number(average_value.toFixed(2)),
        id_mapel: Number(id_mapel),
      },
    });
  } catch (error) {
    if (error.status)
      return res.status(error.status).json({ message: error.message });
    console.error(error);
    res
      .status(500)
      .json({ message: "server error while counting total score" });
  }
};

module.exports = {
  uploadAssignment,
  uploadAssignmentStudent,
  inputScore,
  getAssignmentTeacher,
  getAssignmentStudent,
  getAssignmentStudentById,
  getMySubmissions,
  totalScore,
  deleteAssignmentStudent,
  deleteAssignment,
};
