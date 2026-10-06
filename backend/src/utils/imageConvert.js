import fs from "fs/promises";
import path from "path";
import heicConvert from "heic-convert";
import { exiftool } from "exiftool-vendored";

// Browsers (except Safari) can't display HEIC/HEIF or camera RAW files, so we
// convert them to JPEG right after upload. Anything else is stored untouched.
const HEIC_EXTS = new Set([".heic", ".heif", ".hif"]);
const RAW_EXTS = new Set([
  ".dng", ".cr2", ".cr3", ".crw", ".nef", ".nrw", ".arw", ".srf", ".sr2",
  ".raf", ".orf", ".rw2", ".pef", ".srw", ".raw", ".rwl", ".3fr", ".fff",
  ".iiq", ".mos", ".mef", ".mrw", ".x3f", ".erf", ".kdc", ".dcr",
]);

const isHeic = (file, ext) =>
  HEIC_EXTS.has(ext) || /image\/hei[cf]/.test(file.mimetype);

const isRaw = (ext) => RAW_EXTS.has(ext);

const fileExists = async (p) => {
  try {
    const stat = await fs.stat(p);
    return stat.size > 0;
  } catch {
    return false;
  }
};

const convertHeic = async (src, dest) => {
  const buffer = await fs.readFile(src);
  const output = await heicConvert({ buffer, format: "JPEG", quality: 0.9 });
  await fs.writeFile(dest, Buffer.from(output));
};

const convertRaw = async (src, dest) => {
  // Most RAW files embed a full-size JPEG; fall back to the largest preview.
  try {
    await exiftool.extractJpgFromRaw(src, dest);
  } catch {
    await fs.rm(dest, { force: true });
  }
  if (!(await fileExists(dest))) {
    await exiftool.extractPreview(src, dest);
  }
  if (!(await fileExists(dest))) {
    throw new Error("No embedded preview found");
  }
  // The embedded JPEG usually lacks orientation; copy it from the RAW file.
  try {
    await exiftool.write(dest, {}, {
      writeArgs: ["-tagsFromFile", src, "-Orientation", "-overwrite_original"],
    });
  } catch {
    // Orientation is cosmetic — keep the JPEG even if this fails
  }
};

// Converts a single multer file in place (updates file.path & friends).
// On failure the original file is kept so the upload never gets lost.
const convertFile = async (file) => {
  const ext = path.extname(file.originalname || file.path).toLowerCase();
  const converter = isHeic(file, ext) ? convertHeic : isRaw(ext) ? convertRaw : null;
  if (!converter) return;

  const dest = file.path.slice(0, file.path.length - path.extname(file.path).length) + ".jpg";
  try {
    await converter(file.path, dest);
    await fs.rm(file.path, { force: true });
    file.path = dest;
    file.filename = path.basename(dest);
    file.mimetype = "image/jpeg";
  } catch (err) {
    console.error(`Could not convert ${file.originalname} to JPEG, keeping original:`, err.message);
    await fs.rm(dest, { force: true });
  }
};

// Express middleware: run after multer to convert every uploaded file.
export const convertUploads = async (req, res, next) => {
  try {
    const files = req.file
      ? [req.file]
      : Array.isArray(req.files)
        ? req.files
        : Object.values(req.files || {}).flat();
    // Convert sequentially to keep memory use bounded for large files
    for (const file of files) {
      await convertFile(file);
    }
    next();
  } catch (err) {
    next(err);
  }
};
