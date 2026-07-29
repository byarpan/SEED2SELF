import cloudinary from '../config/cloudinary.js';
import { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  bytes?: number;
}

export class CloudinaryService {
  /**
   * Upload single image buffer to Cloudinary folder
   */
  async uploadImage(fileBuffer: Buffer, folder: string): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      if (!fileBuffer || fileBuffer.length === 0) {
        return reject(new Error("Cannot upload empty file buffer (0 bytes) to Cloudinary."));
      }

      console.log(`[CloudinaryService] Uploading buffer (${fileBuffer.length} bytes) to 'Seed2Shelf/${folder}'...`);

      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `Seed2Shelf/${folder}`,
          resource_type: 'image',
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error || !result) {
            console.error("[CloudinaryService] Upload Stream Error:", error);
            return reject(new Error(error?.message || 'Cloudinary image upload failed'));
          }
          console.log(`✅ [CloudinaryService] Upload stream success: ${result.secure_url} (${result.width}x${result.height}, ${result.bytes} bytes)`);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            bytes: result.bytes,
          });
        }
      );

      uploadStream.end(fileBuffer);
    });
  }

  /**
   * Delete image from Cloudinary using public_id
   */
  async deleteImage(publicId: string): Promise<boolean> {
    if (!publicId) return false;
    try {
      const result = await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
      return result.result === 'ok' || result.result === 'not found';
    } catch (error: any) {
      console.warn(`Failed to delete image '${publicId}' from Cloudinary:`, error?.message || error);
      return false;
    }
  }

  /**
   * Upload multiple image files to Cloudinary folder
   */
  async uploadMultipleImages(files: Express.Multer.File[], folder: string): Promise<CloudinaryUploadResult[]> {
    if (!files || files.length === 0) return [];
    const uploadPromises = files.map((file) => this.uploadImage(file.buffer, folder));
    return Promise.all(uploadPromises);
  }
}

export const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
