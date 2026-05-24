const multer = require("multer");
const path = require("path");
const fs = require("fs")
const Assignment = require("../models/assignment");
const assignmentStudent = require("../models/assignmentStudent");
const Student_classes = require("../models/studentClass")
const  {Op, Model} = require("sequelize");
const {cloudinary, uploadStudent, uploadTeacher} = require("../config/cloudinary");
const { json } = require("body-parser");



// POST method assignment
const uploadAssignment = async (req, res) => {
    try {
        const id_teacher = req.user.id;
        const { assignment_title, description } = req.body;
        const id_class = req.params.id_class;
        const deadline = req.body.deadline ? new Date(req.body.deadline) : null;

        if (!assignment_title || !id_class) {
            return res.status(400).json({ message: 'assignment title and id class are required' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'File wajib diupload' });
        }

        
        const assignment = await Assignment.create({
            assignment_title,
            description,
            file_url: req.file.path,         
            file_public_id: req.file.filename, 
            id_class,
            id_teacher,
            deadline
        });

        res.status(201).json({ message: 'Assignment uploaded successfully', data: assignment });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server failed to upload assignment' });
    }
};

// POST method assignment student
const uploadAssignmentStudent = async (req, res) => {
    try {
        const id_student = req.user.id;
        const id_assignment = req.params.id_assignment;
        const { title, id_class } = req.body;

        const assignmentData = await Assignment.findOne({
            where : { id_assignment: id_assignment },
            attributes : ["deadline"]
        });

        if (assignmentData.deadline) {
            const now = new Date().getTime(); 
            const assignmentDeadline = new Date(assignmentData.deadline).getTime(); 
            const apakahLewat = now > assignmentDeadline;

            if (apakahLewat) {
                return res.status(400).json({ message: 'Deadline sudah lewat. Tidak bisa mengumpulkan tugas.' });
            }
        } else {
            console.log("Tugas ini tidak memiliki deadline (null). Maka bebas upload.");
        }


        const assignmentS = await assignmentStudent.create({
            title,
            file_url: req.file.path,
            file_public_id: req.file.filename,
            id_class,
            id_assignment,
            id_student
        });

        res.status(201).json({ message: 'Assignment submitted successfully', data: assignmentS });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server failed to submit assignment' });
    }
};

//GET method assignment for admin
const getAssignments = async (req, res) => {
    try {
   const assignments = await Assignment.findAll({
        attributes: [
            "id_assignment",
            "assignment_title",
            "description",
            "file_url",
            "id_class",
            "createdAt"
        ]
        });

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

//get assignment teacher by id_class
const getAssignmentTeacher = async (req, res) => {
    try{
        const {id_class} = req.params;

        const assignments = await Assignment.findAll({
            where : {
                id_class
            },
            attributes : ["id_assignment", "assignment_title","description", "file_url"]
        });
        res.status(200).json({
            status: "success",
            count: assignments.length,
            data: assignments.map(item => ({
                id: item.id_assignment,
                title: item.assignment_title,
                description: item.description,
                fileUrl: item.file_url
            }))
        });
    }catch (err){
        console.error(err)
        return res.status(500).json({message:"server error while executing the get assignment for student by id_class method" })
    }
};

// get assignment student by id_class
const getAssignmentStudent = async (req, res) => {
    try{
        const {id_class} = req.params;
        const assignments = await assignmentStudent.findAll({
            where : {id_class},
            attributes : ["id_assignmentStudent","title","file_url","score","createdAt"]
         });
         res.status(200).json({
            status: "success",
            count: assignments.length,
            data: assignments.map(item => ({
                id: item.id_assignmentStudent,
                title: item.title,
                fileUrl: item.file_url,
                score: item.score,
                createdAt: item.createdAt
            }))
         })
        }catch (err){
            console.error(err)
            return res.status(500).json({message:"server error while executing the get assignment student by id_class method" })
        }
};

//get assignment student by id_assignment
const getAssignmentStudentById = async (req, res) => {
    try{
        const {id_assignment} = req.params;
        const assignments = await assignmentStudent.findAll({
            where : {id_assignment},
            attributes : ["id_assignmentStudent", "title", "file_url", "score","id_student", "createdAt"]
         });
         res.status(200).json({ message : "success get assignment student by id_assignment", data : assignments})
        }
    catch (err){
        console.error(err)
        return res.status(500).json({message:"server error while executing the get assignment student by id_assignment method" })
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
                "score"
            ]
        });

        res.status(200).json({ 
            message: "Success get student submissions", 
            data: submissions 
        });
    } catch (err) {
        console.error("Error getMySubmissions:", err);
        return res.status(500).json({ message: "Server error saat mengambil data pengumpulan" });
    }
};

const getCloudinaryResourceType = (fileUrl = "") => {
    const url = String(fileUrl).toLowerCase();

    if (url.includes("/video/upload/")) return "video";
    if (url.includes("/image/upload/")) return "image";
    if (url.includes("/raw/upload/")) return "raw";

    if (/\.(mp4|mov|webm|avi)$/i.test(url)) return "video";
    if (/\.(jpg|jpeg|png|webp|gif|pdf)$/i.test(url)) return "image";

    return "raw";
};

// DELETE method assignment teacher
const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findByPk(req.params.id);

        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        if (assignment.file_public_id) {
            await cloudinary.uploader.destroy(assignment.file_public_id, {
                resource_type: getCloudinaryResourceType(assignment.file_url),
            });
        }

        await assignment.destroy();

        res.status(200).json({ message: "Assignment has been deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while deleting assignment" });
    }
};

// DELETE assignment student
const deleteAssignmentStudent = async (req, res) => {
    try {
        const assignment = await assignmentStudent.findByPk(req.params.id);
    
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        if (assignment.score > 0) {
            return res.status(400).json({ message: "Cannot delete assignment that has been scored" });
        }

        if (assignment.file_public_id) {
            await cloudinary.uploader.destroy(assignment.file_public_id, {
                resource_type: getCloudinaryResourceType(assignment.file_url),
            });
        }

        await assignment.destroy();

        res.status(200).json({ message: "Assignment has been deleted" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error while deleting assignment" });
    }
};

// post score
const inputScore = async (req , res) => {
    try {
        const id_assignmentStudent = req.params.id;
        const {score} = req.body;
        
        const updated = await assignmentStudent.update({score},{where : {id_assignmentStudent}})

        if (updated[0] === 0) {
            return res.status(404).json({message : "assignment not found"})
        }

        res.json({message : "success saving score"})
    }catch(error) {
        console.error(error)
        return res.status(500).json({message : "server error"})
    }
};

// total score
const totalScore = async (req, res) => {
  try {
    const { id_student, id_class } = req.query;

    const allAssignments = await assignmentStudent.findAll({
      where: { id_student, id_class },
      attributes: ['id_assignmentStudent', 'score', 'title']
      
    });

    const total = await assignmentStudent.sum("score", {
      where: {
        id_student,
        id_class
      }
    });

    

    const count = await assignmentStudent.count({
        where : {
            id_student,
            id_class
        }
    });

    const average_value = count > 0 ? total / count : 0;

    res.json({
      student_info: {
        id_student,
        id_class
      },
      summary: {
        total_assignments: count,
        total_score: total || 0,
        average_value: Number(average_value.toFixed(2))
      },
      assignments_detail: allAssignments 
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



module.exports = { 
    uploadTeacher, 
    uploadStudent, 
    uploadAssignment, 
    uploadAssignmentStudent, 
    getAssignments, 
    deleteAssignment, 
    deleteAssignmentStudent, 
    inputScore, 
    totalScore,
    getAssignmentTeacher,
    getAssignmentStudent,
    getAssignmentStudentById,
    getMySubmissions
    };