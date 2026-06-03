import multer, { StorageEngine } from "multer";
import type { Request } from "express";
import path from "path";
import fs from "fs"

const uploadPath = path.join(__dirname, "../uploads");

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath)
}

const storage: StorageEngine = multer.diskStorage({
  destination(req: Request, file: Express.Multer.File, cb): void {
    cb(null, uploadPath);
  },

  filename(req: Request, file: Express.Multer.File, cb): void {
    const ext = path.extname(file.originalname);
    cb(null, `img-${Date.now()}${ext}`);
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: any): void => {
  const allowed = /jpeg|jpg|png|webp|pdf|tif|heic/;
  const isValid =
    allowed.test(path.extname(file.originalname).toLowerCase()) &&
    allowed.test(file.mimetype);

  isValid
    ? cb(null, true)
    : cb(new Error("Only image files are allowed"), false);
};

// Multer instance
const multerInstance: multer.Multer = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/**
 * Typed helpers
 */
export const uploadSingle = (fieldName: string) =>
  multerInstance.single(fieldName);

export const uploadMultiple = (fieldName: string, maxCount = 5) =>
  multerInstance.array(fieldName, maxCount);

export default multerInstance;
