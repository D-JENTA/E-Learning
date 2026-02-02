const multer = require("multer");
const path = require("path");
const fs = require("fs/promises")
const Assignment = require("../models/assignment");
const assignmentStudent = require("../models/assignmentStudent");
const  {Op} = require("sequelize")

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

// POST method assignment
const uploadAssignment = async ( req, res) => {
    try {
        const id_teacher = req.user.id;
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
        const id_student = req.user.id;
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
//GET method assignment

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

// DELETE method

const deleteAssignment = async (req, res) => {
    try {
        

        const assignment = await Assignment.findByPk(req.params.id, {attributes : ["id_assignment","file_url"]});
        if(!assignment){
            return res.status(400).json({message : "assignment not found"});
        }
        await assignment.destroy();

  

        if (assignment.file_url) {
          const filePath = path.join(__dirname, "..", assignment.file_url );
          fs.unlink(filePath).catch(() => {});
        }
        
    res.status(200).json({message : "assignment has been deleted"})

    } catch (err){
        console.error(err)
        return res.status(500).json({message : "server error while run DELETE assignment method"})
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
        return res.status(500).json({message : "server error while run DELETE assignment method"})
    }
};

// post score

const inputScore = async (req , res) => {
    try {
        const {id_assignmentStudent, score} = req.body;
        
        const updated = await assignmentStudent.update({score},{where : {id_assignmentStudent}})

        if (updated[0] === 0) {
            return res.status(404).json({message : "assignment not found"})
        }

        res.json({message : "success saving score"})
    }catch(error) {
        console.error(error)
        return res.status(500).json({message : "server error"})
    }
}

// total score
const totalScore = async (req, res) => {
  try {
    const { id_student, id_class } = req.body;

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
      id_student,
      id_class,
      total_score: total || 0,
      average_value: Number(average_value.toFixed(2))
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};

module.exports = { uploadTeacher, uploadStudent, uploadAssignment, uploadAssignmentStudent, getAssignments, deleteAssignment, deleteAssignmentStudent, inputScore, totalScore};