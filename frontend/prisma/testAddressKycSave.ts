import { syncUserToMongoDB } from "../lib/mongodbSync";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://arpanghosh8617_db_user:Seed2Shelf123@cluster0.xlxdty7.mongodb.net/seed2shelf?retryWrites=true&w=majority&appName=Cluster0";

async function testSave() {
  console.log("==========================================");
  console.log("TESTING PROFILE, ADDRESS, AND KYC SAVE & SYNC TO MONGODB ATLAS");
  console.log("==========================================");

  const testPayload = {
    email: "arpanghosh8617@gmail.com",
    name: "Arpan Ghosh",
    mobileNumber: "8617676375",
    farmerId: "S2S-FRM-000001",
    gender: "Male",
    dob: "1995-08-20",
    role: "FARMER",
    
    // Address Fields
    permanentAddress: "Plot 108, Green Valley Farms",
    village: "Kalyani Village",
    district: "Nadia",
    state: "West Bengal",
    pinCode: "741235",
    country: "India",

    // KYC Fields & Cloudinary Objects
    aadhaarNumber: "123456789012",
    aadhaarFront: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785268623/Seed2Shelf/kyc/farmer/kzxsnhbk85ijdrfdpdmw.png",
    aadhaarFrontPublicId: "Seed2Shelf/kyc/farmer/kzxsnhbk85ijdrfdpdmw",
    aadhaarBack: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785268624/Seed2Shelf/kyc/farmer/zgccm2p1z64b8gtzarqh.jpg",
    aadhaarBackPublicId: "Seed2Shelf/kyc/farmer/zgccm2p1z64b8gtzarqh",
    profilePhoto: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785267803/Seed2Shelf/profile/farmer/ujckrivi3yfto5mb4de4.png",
    profilePhotoPublicId: "Seed2Shelf/profile/farmer/ujckrivi3yfto5mb4de4",
    kycStatus: "Pending Verification"
  };

  console.log("Executing syncUserToMongoDB for Arpan Ghosh...");
  await syncUserToMongoDB(testPayload);

  // Inspect MongoDB Atlas
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("seed2shelf");
  const usersColl = db.collection("users");
  const addressesColl = db.collection("addresses");
  const kycsColl = db.collection("kycs");

  const user = await usersColl.findOne({ email: "arpanghosh8617@gmail.com" });
  if (!user) {
    console.error("❌ User not found");
    await client.close();
    return;
  }

  const addr = user.addressId ? await addressesColl.findOne({ _id: user.addressId }) : await addressesColl.findOne({ userId: user._id });
  const kyc = user.kycId ? await kycsColl.findOne({ _id: user.kycId }) : await kycsColl.findOne({ userId: user._id });

  console.log("\n==========================================");
  console.log("VERIFIED STORED MONGODB ATLAS DOCUMENTS:");
  console.log("==========================================");

  console.log("1. USERS DOCUMENT:");
  console.log("   • ID                 :", user._id);
  console.log("   • Name               :", user.fullName);
  console.log("   • Email              :", user.email);
  console.log("   • Phone              :", user.phone);
  console.log("   • Profile Image Obj  :", user.profileImage);
  console.log("   • Address ID Linked  :", user.addressId);
  console.log("   • KYC ID Linked      :", user.kycId);
  console.log("   • Verification Status:", user.verificationStatus);

  console.log("\n2. ADDRESSES DOCUMENT:");
  console.log("   • Address Line       :", addr?.addressLine);
  console.log("   • Village            :", addr?.village);
  console.log("   • District           :", addr?.district);
  console.log("   • State              :", addr?.state);
  console.log("   • PIN Code           :", addr?.pinCode);

  console.log("\n3. KYCS DOCUMENT:");
  console.log("   • Aadhaar Number     :", kyc?.aadhaarNumber);
  console.log("   • Front Doc Object   :", kyc?.frontDocument);
  console.log("   • Back Doc Object    :", kyc?.backDocument);
  console.log("   • Verification Status:", kyc?.verificationStatus);

  await client.close();
}

testSave();
