const Assignment = require("../models/assignment");
const { Op } = require("sequelize");
const { data } = require("autoprefixer");
const sequelize = require("../config/db")
const path = require("path");
const fs = require("fs/promises");
const { Student, Teacher, } = require("../models");
const Class = require("../models/class");
const Mapel = require("../models/mapel");
const ScheduleMapel = require("../models/schedule_mapel");

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

        if (!mapel_name) return res.status(400).json({ message: "mapel name must be filled" });
        if (!id_class) return res.status(400).json({ message: "class ID must be filled" });
        if (!day) return res.status(400).json({ message: "day must be filled" });
        if (!jp) return res.status(400).json({ message: "jp must be filled" });

        const formattedDay = day.trim().charAt(0).toUpperCase() + day.trim().slice(1).toLowerCase();

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

// delete class
const deleteClass = async (req, res) => {
    let t;
    try {
        const { id_class } = req.body;
        const delClass = await Class.findByPk(id_class);
        if (!delClass) {
            return res.status(404).json({ message: "class not found" });
        }

        await Class.destroy({ where: { id_class } });
        return res.status(200).json({ message: "class deleted successfully" });
        
    } catch (err) {
        if (t && !t.finished) await t.rollback();
        console.error(err);
        return res.status(500).json({ message: "server error" });
    }
}

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
            attributes : ["id_mapel", "mapel_name"],
            include : [
                {
                    model : Teacher,
                    as: "teacher_tb",
                    attributes : [ "username"]
                },
                {
                    model : Class,
                    as: "Class",
                    attributes : ["class_name"]
                }
            ],
            
        });

        res.json(classMapels);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
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
        const id_student = req.user.id_user || req.user.id_student || req.user.id;
        console.log("Student ID from Token:", id_student);

        const student = await Student.findByPk(id_student, {
            attributes: ["id_student", "username", "id_class"],
            raw: true
        });

        console.log("Student Data:", student);
        
        
        const idClass = student ? student.id_class : null;
        
        console.log("Class ID:", idClass);

        const classMapels = await Mapel.findAll({
            where : {id_class : idClass},
            attributes : ["id_mapel", "mapel_name"],
        });

        if (classMapels.length === 0) {
            return res.status(200).json({ message: "No subjects found for this class" });
        }


        const joinedMapels = classMapels.map((item) => {
            const cls = item.Class || item.class_tb;
            return {
                id_mapel: item.id_mapel,
                mapel_name: item.mapel_name
            };
        });

        return res.status(200).json({
            message: "successfully retrieved joined class subjects",
            data: joinedMapels
        });
    }catch(err){
        console.error(err)
        return res.status(500).json({message : "server error while get class by student"})
    }
};

//get class by teacher
const getMapelByTeacher = async (req, res) => {
      try {
    const id_teacher = req.user.id_user || req.user.id_teacher || req.user.id; 

    if (!id_teacher) {
      return res.status(400).json({ message: "Teacher ID not found in token" });
    }

    const mapels = await Mapel.findAll({
        where : {id_teacher},
        attributes : ["id_mapel", "mapel_name"],
        include : [
            {
                model: Class,
                attributes: ["id_class", "class_name"],
                as: "Class"
            }
        ]
    });
    const formattedData = mapels.map((item) => {
        const cls = item.Class || item.class_tb

        return {
            id_mapel: item.id_mapel,
            id_class: cls ? cls.id_class : null,
            mapel_name: item.mapel_name,
            class_name: cls ? cls.class_name : "",
            display_name: cls 
            ? `${item.mapel_name} - ${cls.class_name}` 
            : item.mapel_name
        }
    })
    return res.status(200).json({
      message: "success",
      id_teacher: id_teacher,
      data: formattedData
    });

  } catch (err) {
    console.error("Error getMapelByTeacher:", err);
    return res.status(500).json({ message: "server error while getMapelByTeacher", error: err.message });
  }
};


module.exports = {
    createClass, 
    createMapel,
    getAllClass, 
    getMapelByStudent, 
    getMapelByTeacher, 
    getMapelByClassId,
    updateClass,
    updateMapel,
    deleteMapel, 
    deleteClass,
    };