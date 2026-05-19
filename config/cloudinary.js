const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const path = require("path");

cloudinary.config({
  cloud_name: process.env.cloudinary_cloud_name,
  api_key: process.env.cloudinary_api_key,
  api_secret: process.env.cloudinary_api_secret,
});

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "e-learning_profile",
    allowed_formats: ["jpg", "jpeg", "png"],
    transformation: [{ width: 500, height: 500, crop: "fill" }],
  },
});

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

const storageTeacher = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const resourceType = getResourceType(file.mimetype);

    return {
      folder: "e-learning_assignments/teacher",
      resource_type: resourceType,
      public_id: makePublicId(file, resourceType),
    };
  },
});

const storageStudent = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    const resourceType = getResourceType(file.mimetype);

    return {
      folder: "e-learning_assignments/student",
      resource_type: resourceType,
      public_id: makePublicId(file, resourceType),
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

  allowedMime.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Format tidak didukung. Gunakan PDF, DOCX, PPT, MP4, JPG, PNG, WEBP, atau GIF"), false);
};

const uploadCloud = multer({ storage: profileStorage });

const uploadTeacher = multer({
  storage: storageTeacher,
  fileFilter: sharedFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

const uploadStudent = multer({
  storage: storageStudent,
  fileFilter: sharedFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 },
});

module.exports = { cloudinary, uploadCloud, uploadTeacher, uploadStudent };