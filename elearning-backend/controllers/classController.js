const { Op } = require("sequelize");
const {
  Student,
  Teacher,
  User,
  Class,
  Mapel,
  ScheduleMapel,
  Assignment,
  assignmentStudent,
} = require("../models");
const { destroyCloudinaryFiles } = require("../config/cloudinary");

//create class
const createClass = async (req, res) => {
  try {
    const { class_name } = req.body;

    if (!class_name) {
      return res.status(400).json({ message: "class name required" });
    }

    const newClass = await Class.create({
      class_name,
    });

    res.status(201).json({
      message: "class created successfully",
      data: newClass,
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "class name already exists" });
    }
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

// create mapel
const createMapel = async (req, res) => {
  try {
    const { mapel_name, id_teacher, id_class, day, jp } = req.body;

    if (!mapel_name)
      return res.status(400).json({ message: "mapel name must be filled" });
    if (!id_class)
      return res.status(400).json({ message: "class ID must be filled" });
    if (!day) return res.status(400).json({ message: "day must be filled" });
    if (!jp) return res.status(400).json({ message: "jp must be filled" });

    const formattedDay =
      day.trim().charAt(0).toUpperCase() + day.trim().slice(1).toLowerCase();

    let inputJpArray = [];
    let formattedJp = "";

    if (Array.isArray(jp)) {
      inputJpArray = jp.map(Number);
      formattedJp = inputJpArray.join(",");
    } else if (typeof jp === "string" && jp.includes("-")) {
      const [start, end] = jp.split("-").map(Number);
      for (let i = start; i <= end; i++) {
        inputJpArray.push(i);
      }
      formattedJp = inputJpArray.join(",");
    } else {
      formattedJp = String(jp).trim();
      inputJpArray = formattedJp.split(",").map((j) => Number(j.trim()));
    }

    const teacherIdValue =
      id_teacher && String(id_teacher).trim() !== ""
        ? Number(id_teacher)
        : null;
    const classIdValue = Number(id_class);
    const formattedMapelName = String(mapel_name).trim();

    let mapel = await Mapel.findOne({
      where: {
        mapel_name: formattedMapelName,
        id_class: classIdValue,
      },
    });

    if (!mapel) {
      mapel = await Mapel.create({
        mapel_name: formattedMapelName,
        id_class: classIdValue,
        id_teacher: teacherIdValue,
      });
    } else if (mapel.id_teacher == null && teacherIdValue) {
      // mapel lama belum punya guru -> boleh diisi
      await mapel.update({ id_teacher: teacherIdValue });
    } else if (teacherIdValue && mapel.id_teacher !== teacherIdValue) {
      // jangan pindahkan guru diam-diam (semua jadwal mapel ini ikut berubah)
      return res.status(409).json({
        message: `Mapel '${formattedMapelName}' di kelas ini sudah diampu guru lain. Gunakan endpoint update mapel kalau memang mau ganti guru.`,
        id_mapel: mapel.id_mapel,
        id_teacher: mapel.id_teacher,
      });
    }

    const existingSchedules = await ScheduleMapel.findAll({
      where: {
        day: formattedDay,
      },
      include: [
        {
          model: Mapel,
          as: "Mapel",
          where: {
            [Op.or]: [
              { id_class: classIdValue },
              ...(teacherIdValue ? [{ id_teacher: teacherIdValue }] : []),
            ],
          },
        },
      ],
    });

    for (const schedule of existingSchedules) {
      if (!schedule.jp) continue;

      const existingJpArray = String(schedule.jp)
        .split(",")
        .map((j) => Number(j.trim()));
      const isConflict = inputJpArray.some((j) => existingJpArray.includes(j));

      if (isConflict) {
        const conflictedMapel = schedule.Mapel;

        if (conflictedMapel.id_class === classIdValue) {
          return res.status(400).json({
            message: `Jam bentrok! Kelas ini sudah terisi mata pelajaran '${conflictedMapel.mapel_name}' pada hari ${formattedDay} JP (${schedule.jp}).`,
          });
        }

        if (teacherIdValue && conflictedMapel.id_teacher === teacherIdValue) {
          return res.status(400).json({
            message: `Jadwal guru bentrok! Guru tersebut sudah mengajar di kelas lain pada hari ${formattedDay} JP (${schedule.jp}).`,
          });
        }
      }
    }

    const newSchedule = await ScheduleMapel.create({
      day: formattedDay,
      jp: formattedJp,
      id_mapel: mapel.id_mapel,
    });

    return res.status(201).json({
      message: "Schedule mapel created successfully",
      data: {
        mapel,
        schedule: newSchedule,
      },
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Jadwal yang sama sudah ada." });
    }
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

//delete mapel
const deleteMapel = async (req, res) => {
  try {
    const { id_mapel } = req.body;
    const delMapel = await Mapel.findByPk(id_mapel);
    if (!delMapel) return res.status(404).json({ message: "mapel not found" });

    // file guru + file pengumpulan siswa (keduanya ikut CASCADE terhapus di DB)
    const files = await Assignment.findAll({
      where: { id_mapel: delMapel.id_mapel },
      attributes: ["file_public_id", "file_url"],
      raw: true,
    });
    const submissionFiles = await assignmentStudent.findAll({
      where: { id_mapel: delMapel.id_mapel },
      attributes: ["file_public_id", "file_url"],
      raw: true,
    });

    await delMapel.destroy();

    await destroyCloudinaryFiles([...files, ...submissionFiles]);

    res.json({ message: "mapel deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

// delete class
const deleteClass = async (req, res) => {
  try {
    const { id_class, confirm } = req.body;
    const delClass = await Class.findByPk(id_class);
    if (!delClass) {
      return res.status(404).json({ message: "class not found" });
    }

    // student_tb -> class_tb ON DELETE RESTRICT: tanpa cek ini FK error jadi 500 tanpa penjelasan
    const totalStudents = await Student.count({ where: { id_class } });
    if (totalStudents > 0) {
      return res.status(409).json({
        message: `Kelas tidak bisa dihapus: masih ada ${totalStudents} siswa di kelas ini. Pindahkan atau hapus siswanya dulu.`,
        students: totalStudents,
      });
    }

    const mapels = await Mapel.findAll({
      where: { id_class },
      attributes: ["id_mapel"],
      raw: true,
    });
    const mapelIds = mapels.map((m) => m.id_mapel);

    if (mapelIds.length > 0) {
      const [totalAssignments, totalSubmissions] = await Promise.all([
        Assignment.count({ where: { id_mapel: mapelIds } }),
        assignmentStudent.count({ where: { id_mapel: mapelIds } }),
      ]);

      // mapel_tb -> class_tb CASCADE: menghapus kelas ikut menghapus mapel + tugas + nilai
      if (confirm !== true) {
        return res.status(409).json({
          message:
            "Kelas ini masih punya data terkait. Kirim ulang dengan confirm: true kalau memang mau dihapus semua.",
          affected: {
            mapels: mapelIds.length,
            assignments: totalAssignments,
            submissions: totalSubmissions,
          },
        });
      }
    }

    const files = mapelIds.length
      ? await Assignment.findAll({
          where: { id_mapel: mapelIds },
          attributes: ["file_public_id", "file_url"],
          raw: true,
        })
      : [];
    const submissionFiles = mapelIds.length
      ? await assignmentStudent.findAll({
          where: { id_mapel: mapelIds },
          attributes: ["file_public_id", "file_url"],
          raw: true,
        })
      : [];

    await delClass.destroy();

    await destroyCloudinaryFiles([...files, ...submissionFiles]);

    return res.status(200).json({ message: "class deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

//get all class
const getAllClass = async (req, res) => {
  try {
    const classes = await Class.findAll({
      attributes: ["id_class", "class_name"],
    });
    res.json(classes);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

//get all mapel
const getAllMapel = async (req, res) => {
  try {
    const mapels = await Mapel.findAll({
      attributes: ["id_mapel", "mapel_name"],
      include: {
        model: Class,
        as: "Class",
        attributes: ["id_class", "class_name"],
      },
    });
    res.json(mapels);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error" });
  }
};

//get mapel by class id
const getMapelByClassId = async (req, res) => {
  try {
    const { id_class } = req.params;
    if (!id_class) {
      return res.status(400).json({ message: "class ID must be filled" });
    }
    const classMapels = await Mapel.findAll({
      where: { id_class },
      attributes: ["id_mapel", "mapel_name"],
      include: [
        { model: ScheduleMapel, as: "Schedules", attributes: ["day", "jp"] },
        {
          model: Teacher,
          as: "teacher_tb",
          include: [{ model: User, as: "User", attributes: ["username"] }],
        },
        { model: Class, as: "Class", attributes: ["id_class", "class_name"] },
      ],
    });

    const groupedByDay = {};

    classMapels.forEach((m) => {
      const schedules = m.Schedules || [];

      const mapelData = {
        id_mapel: m.id_mapel,
        mapel_name: m.mapel_name,
        class_name: m.Class?.class_name || null,
        id_class: m.Class?.id_class || null,
        teacher_name: m.teacher_tb?.User?.username || null,
      };

      if (schedules.length === 0) return; // mapel belum ada jadwal, skip

      schedules.forEach((s) => {
        if (!s.day) return;

        if (!groupedByDay[s.day]) groupedByDay[s.day] = [];
        groupedByDay[s.day].push({
          jp: s.jp,
          day: s.day,
          ...mapelData,
        });
      });
    });

    res.json(groupedByDay);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

//update
const updateClass = async (req, res) => {
  try {
    const updClass = await Class.findByPk(req.params.id_class);
    if (!updClass) return res.status(404).json({ message: "class not found " });

    const { class_name } = req.body;
    if (!class_name) {
      return res.status(400).json({ message: "you must fill class name" });
    }
    await updClass.update({ class_name });
    res.status(200).json({ message: "successful update class" });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "class name already exists" });
    }
    console.error(err);
    return res
      .status(500)
      .json({ message: "server error while run update method" });
  }
};
// update mapel
const updateMapel = async (req, res) => {
  try {
    const upMapel = await Mapel.findByPk(req.params.id_mapel);
    if (!upMapel) {
      return res.status(404).json({ message: "mapel not found" });
    }

    // ambil id_schedule spesifik kalau dikirim, supaya tidak salah pilih
    // jadwal saat mapel punya lebih dari satu baris jadwal
    const { mapel_name, id_teacher, jp, day, id_schedule } = req.body;

    let upScheduleMapel;
    if (id_schedule) {
      upScheduleMapel = await ScheduleMapel.findOne({
        where: { id_schedule, id_mapel: upMapel.id_mapel },
      });
    } else {
      const allSchedules = await ScheduleMapel.findAll({
        where: { id_mapel: upMapel.id_mapel },
      });
      if (allSchedules.length > 1) {
        return res.status(400).json({
          message:
            "mapel ini punya lebih dari satu jadwal, sertakan id_schedule untuk menentukan jadwal mana yang diupdate",
        });
      }
      upScheduleMapel = allSchedules[0];
    }

    if (!upScheduleMapel) {
      return res.status(404).json({ message: "schedule not found" });
    }

    const newMapelName = mapel_name
      ? String(mapel_name).trim()
      : upMapel.mapel_name;

    // normalisasi id_teacher:
    // - tidak dikirim (undefined)      -> pertahankan nilai lama
    // - null / "" / 0 dikirim eksplisit -> kosongkan guru (null)
    // - angka valid lainnya             -> pakai id itu
    let newTeacherId;
    if (id_teacher === undefined) {
      newTeacherId = upMapel.id_teacher;
    } else if (
      id_teacher === null ||
      String(id_teacher).trim() === "" ||
      Number(id_teacher) === 0
    ) {
      newTeacherId = null;
    } else {
      newTeacherId = Number(id_teacher);
    }

    // kalau guru diisi (bukan null), pastikan guru itu memang ada
    if (newTeacherId !== null) {
      const teacherExists = await Teacher.findByPk(newTeacherId);
      if (!teacherExists) {
        return res.status(400).json({ message: "teacher not found" });
      }
    }

    // normalisasi day sama seperti createMapel
    const newDay = day
      ? day.trim().charAt(0).toUpperCase() + day.trim().slice(1).toLowerCase()
      : upScheduleMapel.day;

    // normalisasi jp sama seperti createMapel
    let newJpArray = [];
    let newJp;
    if (jp === undefined || jp === null) {
      newJp = upScheduleMapel.jp;
      newJpArray = String(newJp)
        .split(",")
        .map((j) => Number(j.trim()));
    } else if (Array.isArray(jp)) {
      newJpArray = jp.map(Number);
      newJp = newJpArray.join(",");
    } else if (typeof jp === "string" && jp.includes("-")) {
      const [start, end] = jp.split("-").map(Number);
      for (let i = start; i <= end; i++) newJpArray.push(i);
      newJp = newJpArray.join(",");
    } else {
      newJp = String(jp).trim();
      newJpArray = newJp.split(",").map((j) => Number(j.trim()));
    }

    // cek bentrok jadwal, kecuali dengan baris jadwal miliknya sendiri
    const existingSchedules = await ScheduleMapel.findAll({
      where: {
        day: newDay,
        id_schedule: { [Op.ne]: upScheduleMapel.id_schedule },
      },
      include: [
        {
          model: Mapel,
          as: "Mapel",
          where: {
            [Op.or]: [
              { id_class: upMapel.id_class },
              ...(newTeacherId ? [{ id_teacher: newTeacherId }] : []),
            ],
          },
        },
      ],
    });

    for (const schedule of existingSchedules) {
      if (!schedule.jp) continue;

      const existingJpArray = String(schedule.jp)
        .split(",")
        .map((j) => Number(j.trim()));
      const isConflict = newJpArray.some((j) => existingJpArray.includes(j));

      if (isConflict) {
        const conflictedMapel = schedule.Mapel;

        if (conflictedMapel.id_class === upMapel.id_class) {
          return res.status(400).json({
            message: `Jam bentrok! Kelas ini sudah terisi mata pelajaran '${conflictedMapel.mapel_name}' pada hari ${newDay} JP (${schedule.jp}).`,
          });
        }

        if (newTeacherId && conflictedMapel.id_teacher === newTeacherId) {
          return res.status(400).json({
            message: `Jadwal guru bentrok! Guru tersebut sudah mengajar di kelas lain pada hari ${newDay} JP (${schedule.jp}).`,
          });
        }
      }
    }

    await upMapel.update({
      mapel_name: newMapelName,
      id_teacher: newTeacherId,
    });
    await upScheduleMapel.update({
      jp: newJp,
      day: newDay,
    });

    return res.status(200).json({
      message: "successful update mapel",
      data: {
        mapel: upMapel,
        schedule: upScheduleMapel,
      },
    });
  } catch (err) {
    if (err.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ message: "mapel dengan nama tersebut sudah ada di kelas ini" });
    }
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res
        .status(400)
        .json({ message: "teacher ID tidak valid / tidak ditemukan" });
    }
    console.error(err);
    return res
      .status(500)
      .json({ message: "server error while run update mapel method" });
  }
};
//get class by student
const getMapelByStudent = async (req, res) => {
  try {
    const student = await Student.findByPk(req.user.id, {
      attributes: ["id_student", "id_class"],
      raw: true,
    });

    const classMapels = student
      ? await Mapel.findAll({
          where: { id_class: student.id_class },
          attributes: ["id_mapel", "mapel_name"],
          include: [
            {
              model: ScheduleMapel,
              as: "Schedules",
              attributes: ["day"],
            },
          ],
        })
      : [];

    return res.status(200).json({
      message: classMapels.length
        ? "successfully retrieved joined class subjects"
        : "No subjects found for this class",
      data: classMapels,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: "server error while get class by student" });
  }
};

//get class by teacher
const getMapelByTeacher = async (req, res) => {
  try {
    const id_teacher = req.user.id;

    const mapels = await Mapel.findAll({
      where: { id_teacher },
      attributes: ["id_mapel", "mapel_name"],
      include: [
        {
          model: Class,
          attributes: ["id_class", "class_name"],
          as: "Class",
        },
      ],
    });
    const formattedData = mapels.map((item) => ({
      id_mapel: item.id_mapel,
      id_class: item.Class ? item.Class.id_class : null,
      mapel_name: item.mapel_name,
      class_name: item.Class ? item.Class.class_name : "",
    }));
    return res.status(200).json({
      message: "success",
      data: formattedData,
    });
  } catch (err) {
    console.error("Error getMapelByTeacher:", err);
    return res
      .status(500)
      .json({ message: "server error while getMapelByTeacher" });
  }
};

module.exports = {
  createClass,
  createMapel,
  getAllClass,
  getAllMapel,
  getMapelByStudent,
  getMapelByTeacher,
  getMapelByClassId,
  updateClass,
  updateMapel,
  deleteMapel,
  deleteClass,
};
