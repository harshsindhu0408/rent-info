import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { convertUploads } from "../utils/imageConvert.js";

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

export const MAX_FILE_SIZE_MB = 100;

// Every file type is accepted (images, HEIC, camera RAW, PDFs, docs, videos...).
const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE_MB * 1024 * 1024 },
});

// Wraps multer so its errors come back as JSON the frontend can show.
const handleUpload = (multerMiddleware) => (req, res, next) => {
  multerMiddleware(req, res, (err) => {
    if (!err) return next();
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res
          .status(413)
          .json({ msg: `File too large. Maximum size is ${MAX_FILE_SIZE_MB} MB per file.` });
      }
      if (err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({ msg: `Too many files for "${err.field}".` });
      }
      return res.status(400).json({ msg: err.message });
    }
    console.error("Upload error:", err);
    return res.status(500).json({ msg: "File upload failed" });
  });
};

export const uploadFields = (fields) => [
  handleUpload(upload.fields(fields)),
  convertUploads,
];
