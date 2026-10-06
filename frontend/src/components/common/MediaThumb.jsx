import { useState } from "react";
import { FileText } from "lucide-react";
import { getExtension, isVideoFile } from "../../utils/upload";

// Shows an image or video; for formats the browser can't render (RAW, docs...)
// falls back to a file tile showing the extension.
const MediaThumb = ({ src, name, type, alt = "", className = "", ...imgProps }) => {
  const [failed, setFailed] = useState(false);
  const fileName = name || src;

  if (failed) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 bg-gray-50 text-gray-400 ${className}`}>
        <FileText size={24} />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          {getExtension(fileName) || "file"}
        </span>
      </div>
    );
  }

  if (isVideoFile(fileName, type)) {
    return (
      <video src={src} className={className} muted playsInline preload="metadata"
        onError={() => setFailed(true)} {...imgProps} />
    );
  }

  return <img src={src} alt={alt} className={className} onError={() => setFailed(true)} {...imgProps} />;
};

export default MediaThumb;
