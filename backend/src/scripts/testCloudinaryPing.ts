import { v2 as cloudinary } from 'cloudinary';

async function pingCloudinary() {
  const apiKey = "494649442875528";
  const apiSecret = "2UPcqvsxfOb3wJkcmhnAnCsru1U";

  console.log("==========================================");
  console.log("DIAGNOSING CLOUDINARY ACCOUNT CONNECTION");
  console.log("==========================================");

  // Test HTTPS request directly to Cloudinary API to verify credentials
  const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
  
  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/ping", {
      headers: {
        "Authorization": authHeader
      }
    });
    const text = await res.text();
    console.log("Direct Ping Status:", res.status, text);
  } catch (e: any) {
    console.error("Direct Ping Error:", e.message);
  }

  // Also test basic upload with unsigned or signed payload if cloud_name is given
  const envCloudName = process.env.CLOUDINARY_CLOUD_NAME;
  console.log("\nCurrent process.env.CLOUDINARY_CLOUD_NAME:", envCloudName);
  console.log("Current process.env.CLOUDINARY_API_KEY:", process.env.CLOUDINARY_API_KEY ? process.env.CLOUDINARY_API_KEY.slice(0, 4) + "****" : "UNDEFINED");
}

pingCloudinary();
