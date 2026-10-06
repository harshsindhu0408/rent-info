import { toast } from "react-hot-toast";

export const MAX_UPLOAD_MB = 100;
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024;

// Drops files over the size limit (with a toast) and returns the rest.
export const filterOversizeFiles = (files) =>
  Array.from(files).filter((file) => {
    if (file.size <= MAX_UPLOAD_BYTES) return true;
    toast.error(`${file.name} is larger than ${MAX_UPLOAD_MB} MB`);
    return false;
  });

// Axios config that shows upload progress in a single toast.
export const uploadProgressConfig = (toastId) => ({
  headers: { "Content-Type": "multipart/form-data" },
  onUploadProgress: (e) => {
    if (!e.total) return;
    const pct = Math.round((e.loaded / e.total) * 100);
    toast.loading(pct < 100 ? `Uploading… ${pct}%` : "Processing files…", { id: toastId });
  },
});

const VIDEO_EXTS = ["mp4", "mov", "m4v", "webm", "ogv", "3gp", "avi", "mkv"];

export const getExtension = (name = "") => {
  const clean = name.split("?")[0];
  const dot = clean.lastIndexOf(".");
  return dot === -1 ? "" : clean.slice(dot + 1).toLowerCase();
};

export const isVideoFile = (name, type = "") =>
  type.startsWith("video/") || VIDEO_EXTS.includes(getExtension(name));
