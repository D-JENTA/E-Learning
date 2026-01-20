const Assignment = require("../models/assignment");
const generateCode = require("../models/generateCode");
const path = require("path");
const fs = require("fs");
const { Student, Class, Teacher, studentClass } = require("../models");

//create class
const createClass = async (req, res) => {
  try {
    const  id_teacher  = req.user.id;
    const { class_name } = req.body;

    if (!class_name) {
      return res.status(400).json({ message: "class name required" });
    }

    const teacher = await Teacher.findByPk(id_teacher);
    if (!teacher) {
      return res.status(400).json({ message: "invalid teacher id" });
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
    try {
        const delClass = await Class.findByPk(req.params.id);
         if (!delClass)
            return res.status(400).json({message : " failed to find class"});

        const assignments = await Assignment.findAll({
            where : {id_class: delClass.id_class}
        });

        for (const item of assignments) {
            if (item.file_url){
                const filePath = path.resolve(__dirname, "..", item.file_url);
                if (fs.existsSync(filePath)){
                    fs.unlinkSync(filePath);
                    console.log(`class delete : ${filePath}`);
                }else {
                    console.warn(`class not found : ${filePath}`);
                }
            }
        }

        await delClass.destroy();
        
        res.status(200).json({message : " successful delete"});
    } catch (err) {
        console.error(err)
        return res.status(500).json({message : " server error"});
    }
};

//get all
const getAllClass = async (req, res) =>{
    try {
        const classes = await Class.findAll()
        res.json(classes);
    }catch (err){
        console.error(err)
        return res.status(500).json({message : "server error"})
    }
}
// get by id
const getByIdClass = async ( req, res) => {
    try {const classId = await Class.findByPk(req.params.id)
        if (!classId) return res.status(400).json({message : "can't find class"})
            res.json(classId)
    }catch (err){
    console.error (err)
    return res.status(500).json({message : "server error while get class by id"})
}
}
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
        res.status(201).json({message: "successful update class"})
    }catch (err){
        console.error(err)
        return res.status(500).json({message : "server error while run update method"})
    }
}

//join class

const joinClassByCode = async (req, res ) => {
    try {
        const {code, id_student} = req.body;
        const codeFound = await Class.findOne({where : {classCode : code}});
        if (!codeFound) {
            return res.status(404).json({message : "class not found"})
        }
        const alreadyJoined =  await studentClass.findOne({where : {
            id_student : id_student,
            id_class : codeFound.id_class
        }
    });
    if(alreadyJoined){
        return res.status(400).json({message : "you already joined "})
    }

    const joinData = await studentClass.create({
        id_student :  id_student,
        id_class :  codeFound.id_class
    });

    res.status(201).json({message : "success"})
    }catch (err) {
        console.error(err)
        return res.status(500).json({message : "server error while join to class by id"});
    }
}

//get class by student (menampilkan class yang sudah di ikuti )

const getClassByStudent = async (req, res) => {
    try{
        const {id_student} =  req.params;

        const studentClasses = await studentClass.findAll({
            where : {id_student},
            include : [
                {
                model : Class,
                attributes : ["class_name"],
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
}

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


module.exports = {createClass, deleteClass, getAllClass, updateClass, getByIdClass, joinClassByCode, getClassByStudent, getClassByTeacher};