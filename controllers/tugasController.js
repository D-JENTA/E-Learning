const multer = require("multer");
const path = require("path");
const fs = require("fs")
const Assignment = require("../models/assignment");
const assignmentStudent = require("../models/assignmentStudent")

const storageTeacher = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, path.join (__dirname, "../uploads/teacher"));
    },

    filename : (req, file, cb) => {
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    }
});


const storageStudent = multer.diskStorage({
    destination : (req, file, cb) => {
        cb(null, path.join (__dirname, "../uploads/student"));
    },

    filename : (req, file, cb) => {
        const uniqueName = Date.now()+ "-" + file.originalname;
        cb(null, uniqueName)
    }
});


const uploadTeacher = multer({storage :storageTeacher});
const uploadStudent = multer({storage :storageStudent});
// POST mehtod assignment
const uploadAssignment = async ( req, res) => {
    try {
        const {id_teacher} = req.params;
        const { assignment_title, description, id_assignment, id_class} = req.body;

       const fileUrl = `uploads/teacher/${req.file.filename}`;

       const assignment = await Assignment.create({
        assignment_title,
        description,
        file_url: fileUrl,
        id_assignment,
        id_class,
        id_teacher
       });
       res.status(201).json({message :"assignment uploaded successfully",data : assignment});
    } catch (err) {
        console.error (err);
        res.status(500).json({message :"server failed to upload assignment"})
    }
};

const uploadAssignmentStudent = async ( req, res) => {
    try {
        const {id_student} = req.params;
        const { title, id_class} = req.body;

       const fileUrl = `uploads/student/${req.file.filename}`;

       const assignmentS = await assignmentStudent.create({
        title,
        file_url: fileUrl,
        id_class,
        id_student
       });
       res.status(201).json({message :"assignment uploaded successfully",data : assignmentS});
    } catch (err) {
        console.error (err);
        res.status(500).json({message :"server failed to upload assignment"})
    }
};
//GET method assingment

const getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.findAll();
       res.status(200).json({
      status: "success",
      count: assignments.length,
      data: assignments.map(item => ({
        id: item.id_assignment,
        title: item.assignment_title,
        description: item.description,
        fileUrl: item.file_url,
        classId: item.id_class,
        createdAt: item.createdAt,
      }))
    });
    }catch (err) {
        console.error(err)
        return res.status(500).json({message : "server error while executing the get all assignment method"})
    }
};

// DELETE method

const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id);
        if(!assignment){
            return res.status(400).json({message : "assignment not found"});
        }

        const filePath = path.join(__dirname, "..", assignment.file_url )

        if (fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
            console.log(`file deleted : ${filePath}`);
        }else{
            console.warn(`file not found : ${filePath}`);
        }
        
        await assignment.destroy();

        
        res.status(200).json({message : "assignment has been deleted"})
    } catch (err){
        console.error(err)
        return res.status(500).json({message : "server error while run DELETE assigment method"})
    }
};


const deleteAssignmentStudent = async (req, res) => {
    try {
        const assignment = await assignmentStudent.findByPk(req.params.id);
        if(!assignment){
            return res.status(400).json({message : "assignment not found"});
        }

        const filePath = path.join(__dirname, "..", assignment.file_url )

        if (fs.existsSync(filePath)){
            fs.unlinkSync(filePath);
            console.log(`file deleted : ${filePath}`);
        }else{
            console.warn(`file not found : ${filePath}`);
        }
        
        await assignmentStudent.destroy();

        
        res.status(200).json({message : "assignment has been deleted"})
    } catch (err){
        console.error(err)
        return res.status(500).json({message : "server error while run DELETE assigment method"})
    }
};

module.exports = { uploadTeacher, uploadStudent, uploadAssignment, uploadAssignmentStudent, getAssignments, deleteAssignment, deleteAssignmentStudent};