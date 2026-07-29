import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function testKycUploads() {
  console.log("==========================================");
  console.log("TESTING KYC CLOUDINARY UPLOADS TO Seed2Shelf/kyc/farmer");
  console.log("==========================================");

  const sampleFront = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
  const sampleBack = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  try {
    const frontRes = await cloudinary.uploader.upload(sampleFront, {
      folder: "Seed2Shelf/kyc/farmer",
      resource_type: "image"
    });

    console.log("\n ✅ Aadhaar Front Upload PASSED:");
    console.log("   • Public ID :", frontRes.public_id);
    console.log("   • Secure URL:", frontRes.secure_url);

    const backRes = await cloudinary.uploader.upload(sampleBack, {
      folder: "Seed2Shelf/kyc/farmer",
      resource_type: "image"
    });

    console.log("\n ✅ Aadhaar Back Upload PASSED:");
    console.log("   • Public ID :", backRes.public_id);
    console.log("   • Secure URL:", backRes.secure_url);

  } catch (err: any) {
    console.error("❌ KYC Upload Failed:", err.message);
  }

  console.log("\n==========================================");
}

testKycUploads();
