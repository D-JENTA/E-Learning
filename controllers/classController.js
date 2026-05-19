const Assignment = require("../models/assignment");
const generateCode = require("../models/generateCode");
const path = require("path");
const fs = require("fs/promises");
const sequelize = require("../config/db")
const { Student, Class, Teacher, studentClass } = require("../models");
const { data } = require("autoprefixer");

//create class
const createClass = async (req, res) => {
  try {
    const  id_teacher  = req.user.id;
    const { class_name } = req.body;

    if (!class_name) {
      return res.status(400).json({ message: "class name required" });
    }   

    const classCode = generateCode(6);

    const newClass = await Class.create({
      class_name,
      classCode,
      id_teacher
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

//delete class
const deleteClass = async (req, res) => {
    let t;
  try {
    const delClass = await Class.findByPk(req.params.id);
    if (!delClass)
      return res.status(404).json({ message: "class not found" });

    const assignments = await Assignment.findAll({
      where: { id_class: delClass.id_class },
      attributes: ["file_url"]
    });

    t = await sequelize.transaction();

    await delClass.destroy({ transaction: t });

    await t.commit();

    for (const item of assignments) {
      if (!item.file_url) continue;

      const filePath = path.resolve(__dirname, "..", item.file_url);
      fs.unlink(filePath).catch(() => {});
    }

    res.json({ message: "class deleted successfully" });

  } catch (err) {
    if (t && !t.finished) await t.rollback();
    console.error(err);
    res.status(500).json({ message: "server error" });
  }
};

// delete class student joined
const deleteClassStudent = async (req, res) => {
        try{
            const delClassStudent = await studentClass.findOne({
                where : {id_student : req.user.id, id_class : req.params.id_class}
            })
            if (!delClassStudent){
            return res.status(404).json({message:"class not found"})
        }
        await delClassStudent.destroy();
        res.json({message : "successfully delete class that joined"})
        } catch (err){
            console.error(err)
            res.status(500).json({message : "server error while delete class that joined"})
        }
};

//get all class
const getAllClass = async (req, res) =>{
    try {
        const classes = await Class.findAll({attributes : ["id_class","class_name","classCode"]})
        res.json(classes);
    }catch (err){
        console.error(err)
        return res.status(500).json({message : "server error"})
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

//join class
const joinClassByCode = async (req, res ) => {
    try {
        const {code} = req.body;
        const id_student = req.user.id;

        const codeFound = await Class.findOne({where : {classCode : code}});
        if (!codeFound) {
            return res.status(404).json({message : "class not found"})
        }

        const classId = codeFound.id_class;

        const alreadyJoined =  await studentClass.findOne({where : {
            id_student : id_student,
            id_class : codeFound.id_class
        }
    });
    if(alreadyJoined){
        return res.status(400).json({message : "you already joined "})
    }

    const joined = await studentClass.create({
        id_student :  id_student,
        id_class :  codeFound.id_class
    });

    console.log("student joined class : ", joined.toJSON());
    res.status(201).json({message : "success", data : joined})
    }catch (err) {
        console.error("detail error : ", err)
        return res.status(500).json({message : "server error while join to class by id"});
    }
};

//get class by student
const getClassByStudent = async (req, res) => {
    try{
        const id_student = req.user.id;

        const studentClasses = await studentClass.findAll({
            where : {id_student},
            include : [
                {
                model : Class,
                attributes : ["class_name","classCode","id_class"],
            }
        ]
        });

        if (studentClasses.length == 0) {
            return res.status(404).json({message : 'no class joined yet'})
        };

        const joinedClass = studentClasses.map((item)=> item.Class);

        res.status(200).json({message : "successfully retrieved joined class", joinedClass});
    }catch(err){
        console.error(err)
        return res.status(500).json({message : "server error while get class by student"})
    }
};

//get class by teacher
const getClassByTeacher = async(req, res) => {
    try{
        const id_teacher = req.user.id;

        const classes = await Class.findAll({
            where :{id_teacher},
            attributes :["id_class", "class_name", "classCode"]
        });

        res.status(200).json({
            message : "success",
            data :classes
        });
    } catch(err) {
        console.error (err)
        res.status(500).json({message : "server error while getClassByStudent"})
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
    deleteClass, 
    getAllClass, 
    updateClass,
    getByIdClass, 
    joinClassByCode, 
    getClassByStudent, 
    getClassByTeacher, 
    deleteClassStudent, 
    deleteStudentFromClass
    };