import multer from "multer";
import fs from "fs";
import path from "path";
 
// Define the /tmp directory
const tempDir = "/tmp";
 
// Ensure the /tmp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, tempDir); // Use /tmp directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to avoid conflicts
  },
});
 

export const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
});