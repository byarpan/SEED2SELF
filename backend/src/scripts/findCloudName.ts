import { v2 as cloudinary } from 'cloudinary';

const apiKey = "494649442875528";
const apiSecret = "2UPcqvsxfOb3wJkcmhnAnCsru1U";

const candidates = [
  "seed2self", "seed2shelf", "seed2shelf-cloud", "seed2self-cloud", 
  "seed2self_cloud", "seed2shelf_cloud", "seed2self1", "seed2self2",
  "dseed2self", "seed2self-dev", "seed-2-self", "seed-2-shelf"
];

async function testAll() {
  const sampleImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

  for (const name of candidates) {
    cloudinary.config({
      cloud_name: name,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    try {
      const res = await cloudinary.uploader.upload(sampleImage, {
        folder: "Seed2Shelf/profile/farmer",
        resource_type: "image"
      });
      console.log(`\n 🎉 SUCCESS! CLOUD NAME IS: "${name}"`);
      console.log("   • Public ID:", res.public_id);
      console.log("   • Secure URL:", res.secure_url);
      return name;
    } catch (e: any) {
      if (!e.message.includes("Invalid cloud_name")) {
        console.log(`   👉 Match found for "${name}" (Response: ${e.message})`);
      }
    }
  }
  console.log("\nNo candidate matched. Cloud name must be fetched from console.cloudinary.com Dashboard.");
}

testAll();
