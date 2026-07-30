const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");
const fs = require("fs"); // Tambahkan module FS untuk mengelola file lokal

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});

// 1. Profile tetap (karena file gambar profil kecil, tidak masalah sinkronus)
const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "e-learning_profile",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  },
});
const uploadCloud = multer({ storage: profileStorage });


// 2. MODIFIKASI: Sediakan folder temporary di server BE untuk menampung file tugas besar
const tempDir = path.join(__dirname, "temp_uploads");
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir);
}

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, tempDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const sharedFileFilter = (req, file, cb) => {
  const allowedMime = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
  ];

  allowedMime.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Format tidak didukung. Gunakan PDF, DOCX, PPT, MP4, JPG, PNG, WEBP, atau GIF"), false);
};

// Fungsi helper bawaan Anda tetap dipertahankan
const cleanBaseName = (originalname) => {
  return (
    path
      .parse(originalname)
      .name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-_]/g, "") || "file"
  );
};

const getResourceType = (mimetype) => {
  if (mimetype === "application/pdf") return "image";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "raw";
};

const makePublicId = (file, resourceType) => {
  const baseName = cleanBaseName(file.originalname);
  const ext = path.extname(file.originalname).toLowerCase();
  if (resourceType === "raw") {
    return `${Date.now()}-${baseName}${ext}`;
  }
  return `${Date.now()}-${baseName}`;
};

// Gunakan localStorage untuk Guru dan Siswa
const uploadTeacher = multer({
  storage: localStorage,
  fileFilter: sharedFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const uploadStudent = multer({
  storage: localStorage,
  fileFilter: sharedFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

// Export juga helper fungsinya agar bisa digunakan di controller
module.exports = { 
  cloudinary, 
  uploadCloud, 
  uploadTeacher, 
  uploadStudent, 
  getResourceType, 
  makePublicId 
};