import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Absolute path to src/uploads/documents — consistent regardless of CWD
const UPLOAD_DIR = path.join(__dirname, "../uploads/documents");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Create directory if it doesn't exist
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    // Generate unique filename: fieldname-timestamp-randomsuffix.ext
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter (accept images and PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|pdf|heic|heif/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  // HEIC files sometimes upload as application/octet-stream or image/heic
  const mimetype = allowedTypes.test(file.mimetype) || file.mimetype === 'application/octet-stream';

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(
      new Error("Invalid file type. Only JPEG, JPG, PNG, HEIC and PDF are allowed!"),
      false
    );
  }
};

export const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter,
});
