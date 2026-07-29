import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';

// Store files in RAM memory buffer (no disk storage)
const storage = multer.memoryStorage();

const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file format '${file.mimetype}'. Only JPG, JPEG, PNG, and WEBP images are allowed.`));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB maximum file size limit
  },
});

export const uploadSingleImage = (fieldName: string = 'image') => upload.single(fieldName);

export const uploadMultipleImages = (fieldName: string = 'images', maxCount: number = 10) =>
  upload.array(fieldName, maxCount);

export default upload;
