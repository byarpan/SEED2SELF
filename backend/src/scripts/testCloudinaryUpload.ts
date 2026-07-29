import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

console.log("Testing Cloudinary Credentials in .env...");
console.log("CLOUD_NAME:", process.env.CLOUDINARY_CLOUD_NAME);
console.log("API_KEY:", process.env.CLOUDINARY_API_KEY);
console.log("API_SECRET:", process.env.CLOUDINARY_API_SECRET ? "****" + process.env.CLOUDINARY_API_SECRET.slice(-4) : "NONE");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function testUpload() {
  try {
    const sampleImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
    const result = await cloudinary.uploader.upload(sampleImage, {
      folder: "Seed2Shelf/profile/farmer",
      resource_type: "image",
    });

    console.log("\n✅ Cloudinary Upload SUCCESS!");
    console.log("   • Public ID:", result.public_id);
    console.log("   • Secure URL:", result.secure_url);
    console.log("   • Folder:", result.folder);
  } catch (error: any) {
    console.error("\n❌ Cloudinary Upload FAILED:", error.message || error);
  }
}

testUpload();
