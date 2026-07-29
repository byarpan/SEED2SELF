import { Router } from 'express';
import { mediaController } from './media.controller.js';
import { uploadSingleImage, uploadMultipleImages } from '../../middlewares/upload.middleware.js';

const router = Router();

// POST /api/v1/media/profile-image (Upload profile image to Cloudinary & update User)
router.post('/profile-image', uploadSingleImage('image'), mediaController.uploadProfileImage);

// POST /api/v1/media/kyc-document (Upload KYC front/back document to Cloudinary & update KYC)
router.post('/kyc-document', uploadSingleImage('document'), mediaController.uploadKYCDocument);

// POST /api/v1/media/upload (Upload general image to specified Cloudinary folder)
router.post('/upload', uploadSingleImage('image'), mediaController.uploadGeneralImage);

// DELETE /api/v1/media/delete (Delete image from Cloudinary by publicId)
router.delete('/delete', mediaController.deleteImage);

// DELETE /api/v1/media/user/:userId (Delete user and all associated Cloudinary images)
router.delete('/user/:userId', mediaController.deleteUserWithMedia);

export default router;
