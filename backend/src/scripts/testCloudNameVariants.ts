import { v2 as cloudinary } from 'cloudinary';

const apiKey = "494649442875528";
const apiSecret = "2UPcqvsxfOb3wJkcmhnAnCsru1U";
const variants = ["seed2self", "seed2self_cloud", "seed2self-cloud", "SEED2SELF", "seed2shelf"];

async function testVariants() {
  const sampleImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  for (const cName of variants) {
    console.log(`Testing Cloud Name variant: "${cName}"...`);
    cloudinary.config({
      cloud_name: cName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    try {
      const res = await cloudinary.uploader.upload(sampleImage, {
        folder: "Seed2Shelf/profile/farmer",
        resource_type: "image"
      });
      console.log(`\n 🎉 SUCCESS WITH CLOUD NAME: "${cName}"!`);
      console.log("   • Public ID:", res.public_id);
      console.log("   • Secure URL:", res.secure_url);
      console.log("   • Folder:", res.folder);
      return;
    } catch (err: any) {
      console.log(`   ❌ Failed ("${cName}"): ${err.message}`);
    }
  }
}

testVariants();
