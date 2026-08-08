const Assignment = require("../models/assignment");
const generateCode = require("../models/generateCode");
const path = require("path");
const fs = require("fs/promises");
const sequelize = require("../config/db")
const { Student, Teacher, } = require("../models");
const Class = require("../models/class");
const Mapel = require("../models/mapel");
const { data } = require("autoprefixer");
const ScheduleMapel = require("../models/schedule_mapel");
const { Op } = require("sequelize");

//create class
const createClass = async (req, res) => {
  try {
    const { class_name } = req.body;

    if (!class_name) {
      return res.status(400).json({ message: "class name required" });
    }   

    const newClass = await Class.create({
      class_name
    });

    res.status(201).json({
      message: "class created successfully",
      data: newClass
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

// create mapel
const createMapel = async (req, res) => {
    try {
        const { mapel_name, id_teacher, id_class, day, jp } = req.body;

        // 1. Validasi Input Dasar
        if (!mapel_name) return res.status(400).json({ message: "mapel name must be filled" });
        if (!id_class) return res.status(400).json({ message: "class ID must be filled" });
        if (!day) return res.status(400).json({ message: "day must be filled" });
        if (!jp) return res.status(400).json({ message: "jp must be filled" });

        // 2. Format Day agar Sesuai Enum Model ("Senin", "Selasa", "Rabu", "Kamis", "Jumat")
        const formattedDay = day.trim().charAt(0).toUpperCase() + day.trim().slice(1).toLowerCase();

        // 3. Format Input JP menjadi Array Angka & String Gabungan ("4,5,6,7,8")
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
            inputJpArray = formattedJp.split(",").map(j => Number(j.trim()));
        }

        const teacherIdValue = (id_teacher && String(id_teacher).trim() !== "") ? Number(id_teacher) : null;
        const classIdValue = Number(id_class);
        const formattedMapelName = String(mapel_name).trim();

        // 4. Cari atau Buat Master Mapel (Cegah Duplikasi Mapel di Kelas)
        let mapel = await Mapel.findOne({
            where: {
                mapel_name: formattedMapelName,
                id_class: classIdValue
            }
        });

        if (!mapel) {
            mapel = await Mapel.create({
                mapel_name: formattedMapelName,
                id_class: classIdValue,
                id_teacher: teacherIdValue
            });
        } else if (teacherIdValue && mapel.id_teacher !== teacherIdValue) {
            await mapel.update({ id_teacher: teacherIdValue });
        }

        // 5. Cek Bentrok Jam di ScheduleMapel (Cek Irisan JP)
        const existingSchedules = await ScheduleMapel.findAll({
            where: {
                day: formattedDay
            },
            include: [
                {
                    model: Mapel,
                    as: "Mapel",
                    where: {
                        [Op.or]: [
                            { id_class: classIdValue },
                            ...(teacherIdValue ? [{ id_teacher: teacherIdValue }] : [])
                        ]
                    }
                }
            ]
        });

        for (const schedule of existingSchedules) {
            if (!schedule.jp) continue;

            const existingJpArray = String(schedule.jp).split(",").map(j => Number(j.trim()));
            const isConflict = inputJpArray.some(j => existingJpArray.includes(j));

            if (isConflict) {
                const conflictedMapel = schedule.Mapel;

                if (conflictedMapel.id_class === classIdValue) {
                    return res.status(400).json({
                        message: `Jam bentrok! Kelas ini sudah terisi mata pelajaran '${conflictedMapel.mapel_name}' pada hari ${formattedDay} JP (${schedule.jp}).`
                    });
                }

                if (teacherIdValue && conflictedMapel.id_teacher === teacherIdValue) {
                    return res.status(400).json({
                        message: `Jadwal guru bentrok! Guru tersebut sudah mengajar di kelas lain pada hari ${formattedDay} JP (${schedule.jp}).`
                    });
                }
            }
        }

        // 6. Simpan Slot Schedule dalam 1 Baris Data
        const newSchedule = await ScheduleMapel.create({
            day: formattedDay,
            jp: formattedJp,
            id_mapel: mapel.id_mapel
        });

        return res.status(201).json({
            message: "Schedule mapel created successfully",
            data: {
                mapel,
                schedule: newSchedule
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Server error" });
    }
};


// add teacher to mapel
const addTeacherToMapel = async (req, res) => {
    try {
        const { id_mapel, id_teacher, id_class } = req.body;

        if (!id_mapel || !id_teacher) {
            return res.status(400).json({ message: "id_mapel and id_teacher are required" });
        }

        const teacherIdValue = Number(id_teacher);
        const mapelIdValue = Number(id_mapel);

        const mapel = await Mapel.findByPk(mapelIdValue);
        if (!mapel) {
            return res.status(404).json({ message: "mapel not found" });
        }

        mapel.id_teacher = teacherIdValue;
        await mapel.save();

        const whereClause = { id_mapel: mapelIdValue };
        
        if (id_class) {
            whereClause.id_class = Number(id_class);
        }

        await classMapel.update(
            { id_teacher: teacherIdValue },
            { where: whereClause }
        );

        return res.status(200).json({ message: "successfully added teacher to mapel and class_mapel" });

    } catch (err) {
        console.error("Error addTeacherToMapel:", err);
        return res.status(500).json({ message: "server error" });
    }
};

//delete mapel
const deleteMapel = async (req, res) => {
    let t;
  try {
    const {id_mapel} = req.body;
    const delMapel = await Mapel.findByPk(id_mapel);
    if (!delMapel)
      return res.status(404).json({ message: "mapel not found" });

    const assignments = await Assignment.findAll({
      where: { id_mapel: delMapel.id_mapel },
      attributes: ["file_url"]
    });

    t = await sequelize.transaction();

    await delMapel.destroy({ transaction: t });

    await t.commit();

    for (const item of assignments) {
      if (!item.file_url) continue;

      const filePath = path.resolve(__dirname, "..", item.file_url);
      fs.unlink(filePath).catch(() => {});
    }

    res.json({ message: "mapel deleted successfully" });

  } catch (err) {
    if (t && !t.finished) await t.rollback();
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};


//get all class
const getAllClass = async (req, res) =>{
    try {
        const classes = await Class.findAll({attributes : ["id_class","class_name"]})
        res.json(classes);
    }catch (err){
        console.error(err)
        return res.status(500).json({message : "server error"})
    }
};

//get mapel by class id
const getMapelByClassId = async (req, res) => {
    try {
        const {id_class} = req.params;
        if (!id_class) {
            return res.status(400).json({message : "class ID must be filled"})
        }
        const classMapels = await Mapel.findAll({
            where : {id_class},
            include : [
                {
                    model : Mapel,
                    attributes : ["mapel_name","id_mapel"],
                }
            ]
        });
        res.json(classMapels);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
};


// // get student class details (mengambil data siswa beserta kelas yang diikuti berdasarkan id student)
// const getUserClassDetails = async (req, res) => {
//     try {
//         const { id_user } = req.params; 

//         // Langkah 1: Cek apakah user ini adalah SISWA
//         const studentData = await Student.findOne({
//             where: { id_student: id_user },
//             attributes: ["id_student", "username"],
//             include: [
//                 {
//                     model: Class,
//                     attributes: ["id_class", "class_name", "classCode"],
//                     through: { attributes: [] }
//                 }
//             ]
//         });

//         if (studentData) {
//             return res.status(200).json({
//                 message: "Berhasil mengambil kelas yang DIKUTI oleh Siswa.",
//                 role: "student",
//                 data: {
//                     id_user: studentData.id_student,
//                     name: studentData.username,
//                     email: studentData.email,
//                     classes: studentData.Classes // Berisi daftar kelas yang diikuti
//                 }
//             });
//         }

//         // Langkah 2: Jika bukan siswa, cek apakah user ini adalah GURU
//         const teacherData = await Teacher.findOne({
//             where: { id_teacher: id_user },
//             attributes: ["id_teacher", "username"]
//         });

//         if (teacherData) {
//             // Karena relasinya One-to-Many (Guru punya banyak kelas), 
//             // Kita cari kelas yang dibuat oleh id_teacher ini di tabel Class
//             const createdClasses = await Class.findAll({
//                 where: { id_teacher: id_user },
//                 attributes: ["id_class", "class_name", "classCode"]
//             });

//             return res.status(200).json({
//                 message: "Berhasil mengambil kelas yang DIBUAT oleh Guru.",
//                 role: "teacher",
//                 data: {
//                     id_user: teacherData.id_teacher,
//                     name: teacherData.username,
//                     email: teacherData.email,
//                     classes: createdClasses 
//                 }
//             });
//         }

//         // Langkah 3: Jika di kedua tabel tidak ditemukan
//         return res.status(404).json({ 
//             message: "User tidak ditemukan di data siswa maupun guru." 
//         });

//     } catch (error) {
//         return res.status(500).json({ 
//             message: "Internal server error", 
//             error: error.message 
//         });
//     }
// };

// get by id
const getByIdClass = async ( req, res) => {
    try {const classId = await Class.findByPk(req.params.id)
        if (!classId) return res.status(400).json({message : "can't find class"})
            res.json(classId)
    }catch (err){
    console.error (err)
    return res.status(500).json({message : "server error while get class by id"})
}
};

//update
const updateClass = async (req, res) => {
    try {
        const updClass = await Class.findByPk(req.params.id_class);
        if (!updClass)
            return res.status(404).json({message : "class not found "})

        const {class_name} = req.body;
        if (!class_name) {
        return res.status(400).json({ message: "you must fill class name" });
        }
        await updClass.update({class_name});
        res.status(200).json({message: "successful update class"})
    }catch (err){
        console.error(err)
        return res.status(500).json({message : "server error while run update method"})
    }
};

//update mapel
const updateMapel = async (req, res) => {
    try{
        const upMapel = await Mapel.findByPk(req.params.id_mapel);
        if (!upMapel) {
            return res.status(404).json({message : "mapel not found"})
        }
        const {mapel_name, id_teacher} = req.body;

        const newMapelName = mapel_name ? mapel_name : upMapel.mapel_name;
        const newTeacherId = id_teacher ? id_teacher : upMapel.id_teacher;

        await upMapel.update({
            mapel_name: newMapelName,
            id_teacher: newTeacherId
        });

        return res.status(200).json({ 
            message: "successful update mapel",
            data: upMapel 
        });
    }catch (err){
        console.error(err)
        return res.status(500).json({message : "server error while run update mapel method"})
    }
}

//get class by student
const getMapelByStudent = async (req, res) => {
    try{
        const id_student = req.user.id;

        const student = await Student.findByPk(id_student, {
        attributes: ["id_class"], 
        raw: true                 
        });

        
        const idClass = student ? student.id_class : null;

  
        const classMapels = await Mapel.findAll({
            where : {id_class : idClass},
            attributes : ["id_mapel", "mapel_name"],
        });

        if (classMapels.length == 0) {
            return res.status(404).json({message : 'no class joined yet'})
        };

        const joinedMapels = classMapels.map((item)=> item.Mapel);

        res.status(200).json({message : "successfully retrieved joined class", joinedMapels});
    }catch(err){
        console.error(err)
        return res.status(500).json({message : "server error while get class by student"})
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
          through: { attributes: [] }, 
          required: true
        }
      ]
    });

    
    const formattedData = mapels.map((item) => {
      const cls = item.Classes[0]; 

      return {
        id_mapel: item.id_mapel,
        id_class: cls ? cls.id_class : null,
        mapel_name: item.mapel_name,
        class_name: cls ? cls.class_name : "",
        display_name: cls 
          ? `${item.mapel_name} - ${cls.class_name}` 
          : item.mapel_name
      };
    });

    return res.status(200).json({
      message: "success",
      data: formattedData
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "server error while getMapelByTeacher" });
  }
};



module.exports = {
    createClass, 
    createMapel,
    deleteMapel, 
    getAllClass, 
    updateClass,
    updateMapel,
    getByIdClass,
    addTeacherToMapel,
    getMapelByStudent, 
    getMapelByTeacher, 
    // getUserClassDetails,
    getMapelByClassId
    };