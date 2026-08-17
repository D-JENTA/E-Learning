const multer = require("multer");
const path = require("path");
const fs = require("fs")
const Assignment = require("../models/assignment");
const assignmentStudent = require("../models/assignmentStudent");
const  {Op, Model} = require("sequelize");
const { uploadTeacher,uploadStudent, getResourceType, makePublicId, cloudinary } = require("../config/cloudinary");

const uploadToCloudinaryLarge = (filePath, options) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_large(filePath, options, (error, result) => {
            if (error) return reject(error);
            resolve(result);
        });
    });
};

// POST method assignment
const uploadAssignment = async (req, res) => {
    try {
        const id_teacher = req.user.id;
        const { assignment_title, description } = req.body;

        const id_mapel = req.params.id_mapel; 
        const deadline = req.body.deadline ? new Date(req.body.deadline) : null;

        if (!assignment_title || !id_mapel) {
            if (req.file) fs.unlinkSync(req.file.path); 
            return res.status(400).json({ message: 'assignment title and id mapel are required' });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'File wajib diupload' });
        }

        const resourceType = getResourceType(req.file.mimetype);
        const publicId = makePublicId(req.file, resourceType);

        const cloudinaryOptions = {
            folder: "e-learning_assignments/teacher",
            resource_type: resourceType,
            public_id: publicId,
            chunk_size: 6000000 
        };

        const cloudinaryResult = await uploadToCloudinaryLarge(req.file.path, cloudinaryOptions);

        fs.unlinkSync(req.file.path);

        
        const assignment = await Assignment.create({
            assignment_title,
            description,
            file_url: cloudinaryResult.secure_url,
            file_public_id: cloudinaryResult.public_id,
            id_mapel,
            id_teacher,
            deadline
        });

        res.status(201).json({ message: 'Assignment uploaded successfully', data: assignment });
    } catch (err) {
        console.error(err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server failed to upload assignment' });
    }
};
// POST method assignment student
const uploadAssignmentStudent = async (req, res) => {
    try {
        const id_student = req.user.id;
        const id_assignment = req.params.id_assignment;
        const { title, id_mapel } = req.body;

        if (!req.file) {
            return res.status(400).json({ message: 'File wajib diupload' });
        }

        const assignmentData = await Assignment.findOne({
            where : { id_assignment: id_assignment },
            attributes : ["deadline"]
        });

        if (!assignmentData) {
            if (req.file) fs.unlinkSync(req.file.path);
            return res.status(404).json({ message: 'Tugas tidak ditemukan atau sudah dihapus oleh guru.' });
        }

        if (assignmentData && assignmentData.deadline) {
            const now = new Date().getTime(); 
            const assignmentDeadline = new Date(assignmentData.deadline).getTime(); 
            const apakahLewat = now > assignmentDeadline;

            if (apakahLewat) {
                if (req.file) fs.unlinkSync(req.file.path); // Hapus file temp jika deadline lewat
                return res.status(400).json({ message: 'Deadline sudah lewat. Tidak bisa mengumpulkan tugas.' });
            }
        }

        const resourceType = getResourceType(req.file.mimetype);
        const publicId = makePublicId(req.file, resourceType);

        const cloudinaryOptions = {
            folder: "e-learning_assignments/student",
            resource_type: resourceType,
            public_id: publicId,
            chunk_size: 6000000 
        };

        const cloudinaryResult = await uploadToCloudinaryLarge(req.file.path, cloudinaryOptions);

        fs.unlinkSync(req.file.path); 

        const assignmentS = await assignmentStudent.create({
            title,
            file_url: cloudinaryResult.secure_url,
            file_public_id: cloudinaryResult.public_id,
            id_mapel,
            id_assignment,
            id_student
        });

        res.status(201).json({ message: 'Assignment submitted successfully', data: assignmentS });
    } catch (err) {
        console.error(err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ message: 'Server failed to submit assignment' });
    }
};

//get assignment teacher by id_mapel
const getAssignmentTeacher = async (req, res) => {
    try{
        const {id_mapel} = req.params;

        const assignments = await Assignment.findAll({
            where : {
                id_mapel
            },
            attributes : ["id_assignment", "assignment_title","description", "file_url", "deadline"]
        });
        res.status(200).json({
            status: "success",
            count: assignments.length,
            data: assignments.map(item => ({
                id: item.id_assignment,
                title: item.assignment_title,
                description: item.description,
                fileUrl: item.file_url,
                deadline: item.deadline
            }))
        });
    }catch (err){
        console.error(err)
        return res.status(500).json({message:"server error while executing the get assignment for student by id_mapel method" })
    }
};

// get assignment student by id mapel
const getAssignmentStudent = async (req, res) => {
    try{
        const {id_mapel} = req.params;
        const assignments = await assignmentStudent.findAll({
            where : {id_mapel},
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
            return res.status(500).json({message:"server error while executing the get assignment student by id_mapel method" })
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
        const id_student = req.user?.id_student || req.user?.id_user || req.user?.id;
        const { id } = req.params;

        const assignment = await assignmentStudent.findOne({
            where: { id_assignmentStudent: id },
            include: [
                {
                    model: Assignment, 
                    attributes: ['deadline']
                }
            ]
        });

        if (!assignment) {
            return res.status(404).json({ message: "Pengumpulan tugas tidak ditemukan." });
        }

        if (assignment.id_student !== id_student) {
            return res.status(403).json({ message: "Akses ditolak. Anda hanya dapat menghapus tugas milik sendiri." });
        }

        if (assignment.score !== null && assignment.score !== undefined) {
            return res.status(400).json({ message: "Tugas tidak dapat dihapus karena sudah diberi nilai oleh guru." });
        }


        const deadline = assignment.Assignment?.deadline;
        if (deadline) {
            const now = new Date().getTime();
            const assignmentDeadline = new Date(deadline).getTime();

            if (now > assignmentDeadline) {
                return res.status(400).json({ message: "Deadline sudah lewat. Tugas yang sudah terkirim tidak dapat dihapus." });
            }
        }


        if (assignment.file_public_id) {
            await cloudinary.uploader.destroy(assignment.file_public_id, {
                resource_type: getCloudinaryResourceType(assignment.file_url),
            });
        }


        await assignment.destroy();

        res.status(200).json({ message: "Pengumpulan tugas berhasil dihapus." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Terjadi kesalahan server saat menghapus tugas." });
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

//total Score
const totalScore = async (req, res) => {
     try {
    const { id_student, id_mapel } = req.query;

    if (!id_student || !id_mapel) {
      return res.status(400).json({
        message: "Parameter 'id_student' dan 'id_mapel' wajib diisi pada query URL."
      });
    }
    const allAssignments = await assignmentStudent.findAll({
      where: { id_student, id_mapel },
      attributes: ['id_assignmentStudent', 'score', 'title']
      
    });

    const total = await assignmentStudent.sum("score", {
      where: {
        id_student,
        id_mapel
      }
    });

    

    const count = await assignmentStudent.count({
        where : {
            id_student,
            id_mapel
        }
    });

    const average_value = count > 0 ? total / count : 0;

    res.json({
      student_info: {
        id_student,
        id_mapel
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
    inputScore, 
    getAssignmentTeacher,
    getAssignmentStudent,
    getAssignmentStudentById,
    getMySubmissions,
    totalScore,
    deleteAssignmentStudent, 
    deleteAssignment, 
    };