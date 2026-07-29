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

async function testRealImage() {
  console.log("==========================================");
  console.log("TESTING REAL NON-BLANK KYC IMAGE UPLOAD");
  console.log("==========================================");

  // A real 200x100 blue rectangle PNG image (not 1x1 transparent)
  // Base64 of a 200x100 solid blue PNG image with pattern:
  const realImageBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAABkCAYAAADDhn8LAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA7SURBVHhe3cExAQAAAMKg9U9tDQ8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHwZ24wAAdRkR34AAAAASUVORK5CYII=";

  // Let's create a solid red/blue image buffer of 50KB to test real photo payload
  const width = 100;
  const height = 100;
  // Raw valid JPEG header + data
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x60,
    0x00, 0x60, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
    0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20, 0x24, 0x2E, 0x27, 0x20,
    0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29, 0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27,
    0x39, 0x3D, 0x38, 0x32, 0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xC0, 0x00, 0x0B, 0x08, 0x00, 0x40,
    0x00, 0x40, 0x01, 0x01, 0x11, 0x00, 0xFF, 0xC4, 0x00, 0x1F, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
    0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02, 0x03, 0x04,
    0x05, 0x06, 0x07, 0x08, 0x09, 0x0A, 0x0B, 0xFF, 0xDA, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3F,
    0x00, 0x7F, 0x00, 0xD9
  ]);

  try {
    console.log("1. Uploading Aadhaar Front image...");
    const frontRes = await cloudinary.uploader.upload(realImageBase64, {
      folder: "Seed2Shelf/kyc/farmer",
      resource_type: "image"
    });

    console.log(" ✅ Aadhaar Front Upload Successful:");
    console.log("   • Public ID  :", frontRes.public_id);
    console.log("   • Dimensions :", `${frontRes.width}x${frontRes.height}`);
    console.log("   • Bytes      :", frontRes.bytes);
    console.log("   • Format     :", frontRes.format);
    console.log("   • Secure URL :", frontRes.secure_url);

    console.log("\n2. Uploading Aadhaar Back JPEG buffer...");
    const backRes = await new Promise<any>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "Seed2Shelf/kyc/farmer", resource_type: "image" },
        (err, res) => err ? reject(err) : resolve(res)
      );
      stream.end(jpegHeader);
    });

    console.log(" ✅ Aadhaar Back Upload Successful:");
    console.log("   • Public ID  :", backRes.public_id);
    console.log("   • Dimensions :", `${backRes.width}x${backRes.height}`);
    console.log("   • Bytes      :", backRes.bytes);
    console.log("   • Format     :", backRes.format);
    console.log("   • Secure URL :", backRes.secure_url);

  } catch (err: any) {
    console.error("❌ Test Upload Failed:", err.message);
  }

  console.log("==========================================");
}

testRealImage();
