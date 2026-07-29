import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

async function diagnose() {
  console.log("==========================================");
  console.log("CLOUDINARY ENVIRONMENT & UPLOAD DIAGNOSTIC");
  console.log("==========================================");

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  console.log("1. Loaded Environment Variables:");
  console.log("   • CLOUDINARY_CLOUD_NAME:", cloudName !== undefined ? `"${cloudName}"` : "UNDEFINED");
  console.log("   • CLOUDINARY_API_KEY:   ", apiKey !== undefined ? `"${apiKey.slice(0, 4)}****"` : "UNDEFINED");
  console.log("   • CLOUDINARY_API_SECRET:", apiSecret !== undefined ? `"${apiSecret.slice(0, 4)}****"` : "UNDEFINED");

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("\n❌ FAILED: One or more Cloudinary environment variables are missing.");
    return;
  }

  // Check for leading/trailing whitespace or quotes
  if (cloudName !== cloudName.trim()) {
    console.warn("⚠️ WARNING: CLOUDINARY_CLOUD_NAME contains leading/trailing whitespace.");
  }

  cloudinary.config({
    cloud_name: cloudName.trim(),
    api_key: apiKey.trim(),
    api_secret: apiSecret.trim(),
    secure: true,
  });

  const sampleImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  console.log("\n2. Executing Real Upload Test to folder: Seed2Shelf/profile/farmer...");
  try {
    const res = await cloudinary.uploader.upload(sampleImage, {
      folder: "Seed2Shelf/profile/farmer",
      resource_type: "image"
    });

    console.log("\n🎉 UPLOAD TEST PASSED SUCCESSFULLY!");
    console.log("   • Public ID: ", res.public_id);
    console.log("   • Secure URL:", res.secure_url);
    console.log("   • Folder:    ", res.folder);
  } catch (error: any) {
    console.error("\n❌ UPLOAD TEST FAILED!");
    console.error("   • Error Message:", error.message || error);
    console.error("   • Error Code   :", error.http_code || error.code || "N/A");
  }

  console.log("\n==========================================");
}

diagnose();
