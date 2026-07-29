import { Request, Response, NextFunction } from 'express';
import { cloudinaryService } from '../../services/cloudinary.service.js';
import User from '../../shared/models/User.js';
import KYC from '../../shared/models/KYC.js';

export class MediaController {
  /**
   * Upload profile image for user (Farmer, Processor, Distributor, Retailer, Customer)
   * Deletes old image from Cloudinary if present.
   */
  uploadProfileImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file uploaded' });
        return;
      }

      const userId = (req as any).user?.id || req.body.userId || req.query.userId;
      const role = (req as any).user?.role || req.body.role || 'farmer';

      const folder = `profile/${role.toLowerCase()}`;
      const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, folder);

      if (userId) {
        const user = await User.findById(userId);
        if (user) {
          // Delete old profile image from Cloudinary if publicId exists
          if (user.profileImage?.publicId) {
            await cloudinaryService.deleteImage(user.profileImage.publicId);
          }

          user.profilePhoto = uploadResult.secure_url;
          user.profileImage = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
          };
          await user.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'Profile image uploaded to Cloudinary successfully',
        data: {
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Upload KYC document (Aadhaar, PAN, Voter ID, Passport, Factory Photo, etc.)
   * Deletes old document from Cloudinary if present.
   */
  uploadKYCDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No document file uploaded' });
        return;
      }

      const userId = (req as any).user?.id || req.body.userId || req.query.userId;
      const docSide = req.body.side || 'front'; // 'front' or 'back'
      const role = (req as any).user?.role || req.body.role || 'farmer';

      const folder = `kyc/${role.toLowerCase()}`;
      const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, folder);

      if (userId) {
        let kyc = await KYC.findOne({ userId });
        if (kyc) {
          // Delete old document from Cloudinary if replacing
          const oldDoc = docSide === 'back' ? kyc.backDocument : kyc.frontDocument;
          if (oldDoc?.publicId) {
            await cloudinaryService.deleteImage(oldDoc.publicId);
          }

          if (docSide === 'back') {
            kyc.backImage = uploadResult.secure_url;
            kyc.backDocument = {
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
            };
          } else {
            kyc.frontImage = uploadResult.secure_url;
            kyc.frontDocument = {
              url: uploadResult.secure_url,
              publicId: uploadResult.public_id,
            };
          }
          await kyc.save();
        }
      }

      res.status(200).json({
        success: true,
        message: 'KYC document uploaded to Cloudinary successfully',
        data: {
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Upload general image to specified Cloudinary folder (farms, harvests, processed-products, shipments)
   */
  uploadGeneralImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No image file uploaded' });
        return;
      }

      const folder = req.body.folder || 'farms';
      const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, folder);

      res.status(200).json({
        success: true,
        message: 'Image uploaded to Cloudinary successfully',
        data: {
          secure_url: uploadResult.secure_url,
          public_id: uploadResult.public_id,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Delete image from Cloudinary by public_id
   */
  deleteImage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const publicId = req.body.publicId || req.query.publicId || req.params.publicId;
      if (!publicId) {
        res.status(400).json({ success: false, message: 'publicId is required' });
        return;
      }

      const success = await cloudinaryService.deleteImage(publicId as string);
      res.status(200).json({
        success: true,
        message: success ? 'Image deleted from Cloudinary' : 'Image deletion request processed',
        data: { publicId },
      });
    } catch (error: any) {
      next(error);
    }
  };

  /**
   * Delete user and all associated Cloudinary images
   */
  deleteUserWithMedia = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.params.userId || req.body.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ success: false, message: 'User not found' });
        return;
      }

      // 1. Delete profile image from Cloudinary
      if (user.profileImage?.publicId) {
        await cloudinaryService.deleteImage(user.profileImage.publicId);
      }

      // 2. Delete KYC images from Cloudinary
      const kyc = await KYC.findOne({ userId: user._id });
      if (kyc) {
        if (kyc.frontDocument?.publicId) {
          await cloudinaryService.deleteImage(kyc.frontDocument.publicId);
        }
        if (kyc.backDocument?.publicId) {
          await cloudinaryService.deleteImage(kyc.backDocument.publicId);
        }
        await KYC.findByIdAndDelete(kyc._id);
      }

      // 3. Delete user document from MongoDB
      await User.findByIdAndDelete(user._id);

      res.status(200).json({
        success: true,
        message: 'User account and all associated Cloudinary images deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const mediaController = new MediaController();
