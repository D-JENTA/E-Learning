const Assignment = require("../models/assignment");
const generateCode = require("../models/generateCode");
const path = require("path");
const fs = require("fs/promises");
const sequelize = require("../config/db")
const { Student, Teacher, } = require("../models");
const studentMapel = require("../models/studentMapel");
const classMapel = require("../models/classMapel");
const Class = require("../models/class");
const Mapel = require("../models/mapel");
const { data } = require("autoprefixer");

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

//create mapel
const createMapel = async (req, res) => {
    try{
        const {mapel_name, id_teacher, id_class} = req.body;

        if (!mapel_name) {
            return res.status(400).json({message : "mapel name must be filled"})
        }

        const teacherIdValue = (id_teacher && String(id_teacher).trim() !== "") ? Number(id_teacher) : null;
        if (!id_class) {
            return res.status(400).json({message : "class ID must be filled"})
        }
        const newMapel =await Mapel.create({
            mapel_name,
            id_teacher : teacherIdValue
        })

        await classMapel.create({
            id_class,
            id_mapel : newMapel.id_mapel,
            id_teacher : teacherIdValue
        })

        res.status(201).json({message : "mapel created successfully"})
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "server error" });
    }
}

//add teacher to mapel
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
        const classMapels = await classMapel.findAll({
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


// get student class details (mengambil data siswa beserta kelas yang diikuti berdasarkan id student)
const getUserClassDetails = async (req, res) => {
    try {
        const { id_user } = req.params; 

        // Langkah 1: Cek apakah user ini adalah SISWA
        const studentData = await Student.findOne({
            where: { id_student: id_user },
            attributes: ["id_student", "username"],
            include: [
                {
                    model: Class,
                    attributes: ["id_class", "class_name", "classCode"],
                    through: { attributes: [] }
                }
            ]
        });

        if (studentData) {
            return res.status(200).json({
                message: "Berhasil mengambil kelas yang DIKUTI oleh Siswa.",
                role: "student",
                data: {
                    id_user: studentData.id_student,
                    name: studentData.username,
                    email: studentData.email,
                    classes: studentData.Classes // Berisi daftar kelas yang diikuti
                }
            });
        }

        // Langkah 2: Jika bukan siswa, cek apakah user ini adalah GURU
        const teacherData = await Teacher.findOne({
            where: { id_teacher: id_user },
            attributes: ["id_teacher", "username"]
        });

        if (teacherData) {
            // Karena relasinya One-to-Many (Guru punya banyak kelas), 
            // Kita cari kelas yang dibuat oleh id_teacher ini di tabel Class
            const createdClasses = await Class.findAll({
                where: { id_teacher: id_user },
                attributes: ["id_class", "class_name", "classCode"]
            });

            return res.status(200).json({
                message: "Berhasil mengambil kelas yang DIBUAT oleh Guru.",
                role: "teacher",
                data: {
                    id_user: teacherData.id_teacher,
                    name: teacherData.username,
                    email: teacherData.email,
                    classes: createdClasses 
                }
            });
        }

        // Langkah 3: Jika di kedua tabel tidak ditemukan
        return res.status(404).json({ 
            message: "User tidak ditemukan di data siswa maupun guru." 
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Internal server error", 
            error: error.message 
        });
    }
};

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
        const updClass = await Class.findByPk(req.params.id);
        if (!updClass)
            return res.status(404).json({message : "class not found"})

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

//get class by student
const getMapelByStudent = async (req, res) => {
    try{
        const id_student = req.user.id;

        const student = await Student.findByPk(id_student, {
        attributes: ["id_class"], 
        raw: true                 
        });

        
        const idClass = student ? student.id_class : null;

  
        const classMapels = await classMapel.findAll({
            where : {id_class : idClass},
            include : [
                {
                model : Mapel,
                attributes : ["mapel_name","id_mapel"],
            }
        ]
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

// delete student from class that joined by teacher
const deleteStudentFromClass = async (req, res) => {
    try{
        const {id_class} = req.params;
        const {id_student} = req.body;

        const delStudent = await studentClass.findOne({ 
            where : {
                id_student,
                id_class
            }
        });
        if (!delStudent){
            return res.status(404).json({message : "student not found in this class"})
        }
        await delStudent.destroy();
        res.status(200).json({message : "successfully delete student from class that joined by teacher"})
    }catch (err){
    console.error(err)
    res.status(500).json({message : "server error while delete student from class that joined by teacher"})
}
};

module.exports = {
    createClass, 
    createMapel,
    deleteMapel, 
    getAllClass, 
    updateClass,
    getByIdClass,
    addTeacherToMapel,
    getMapelByStudent, 
    getMapelByTeacher, 
    deleteStudentFromClass,
    getUserClassDetails,
    getMapelByClassId
    };