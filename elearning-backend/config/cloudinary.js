const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");

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


// 2. Tugas: stream langsung ke Cloudinary, tidak mampir disk.
//    - transfer client->BE dan BE->Cloudinary jadi tumpang-tindih (dulu berurutan)
//    - satu request, bukan 12 chunk berurutan yang bikin link idle di antaranya
//    Catatan: upload_stream = satu request, batas Cloudinary 100MB -> sama dengan limit multer di bawah.
//    ponytail: timeout digedein karena 60s default itu idle-timeout; client lambat atau
//    Cloudinary memproses video bisa bikin socket diam >60s.
const assignmentStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: (req, file) => {
      const resource_type = getResourceType(file.mimetype);
      return {
        folder,
        resource_type,
        public_id: makePublicId(file, resource_type),
        timeout: 10 * 60 * 1000,
      };
    },
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

  if (allowedMime.includes(file.mimetype)) return cb(null, true);

  // status ditempel supaya error handler global balas 400, bukan 500 (salah file itu salah client)
  const err = new Error("Format tidak didukung. Gunakan PDF, DOCX, PPT, MP4, JPG, PNG, WEBP, atau GIF");
  err.status = 400;
  cb(err, false);
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

// Tebak resource_type dari secure_url yang tersimpan (dibutuhkan saat menghapus file)
const getCloudinaryResourceType = (fileUrl = "") => {
  const url = String(fileUrl).toLowerCase();

  if (url.includes("/video/upload/")) return "video";
  if (url.includes("/image/upload/")) return "image";
  if (url.includes("/raw/upload/")) return "raw";

  if (/\.(mp4|mov|webm|avi)$/i.test(url)) return "video";
  if (/\.(jpg|jpeg|png|webp|gif|pdf)$/i.test(url)) return "image";

  return "raw";
};

// Best-effort: kegagalan hapus di Cloudinary tidak boleh menggagalkan operasi DB.
// rows: [{ file_public_id, file_url }]
const destroyCloudinaryFiles = async (rows = []) => {
  await Promise.all(
    rows
      .filter((r) => r && r.file_public_id)
      .map((r) =>
        cloudinary.uploader
          .destroy(r.file_public_id, { resource_type: getCloudinaryResourceType(r.file_url) })
          .catch((err) => console.error("Cloudinary destroy failed:", r.file_public_id, err.message))
      )
  );
};

// Guru & siswa: sama-sama stream ke Cloudinary, beda folder
const uploadTeacher = multer({
  storage: assignmentStorage("e-learning_assignments/teacher"),
  fileFilter: sharedFileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const uploadStudent = multer({
  storage: assignmentStorage("e-learning_assignments/student"),
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
  makePublicId,
  getCloudinaryResourceType,
  destroyCloudinaryFiles
};