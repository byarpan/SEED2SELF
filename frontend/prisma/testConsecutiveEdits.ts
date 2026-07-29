import { syncUserToMongoDB } from "../lib/mongodbSync";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://arpanghosh8617_db_user:Seed2Shelf123@cluster0.xlxdty7.mongodb.net/seed2shelf?retryWrites=true&w=majority&appName=Cluster0";

async function testConsecutiveEdits() {
  console.log("==========================================");
  console.log("TESTING MULTIPLE CONSECUTIVE EDITS & SAVES");
  console.log("==========================================");

  // EDIT 1
  console.log("\n--- [EDIT 1] Saving Initial Profile Data ---");
  await syncUserToMongoDB({
    email: "arpanghosh8617@gmail.com",
    name: "Arpan Ghosh",
    mobileNumber: "8617676375",
    gender: "Male",
    dob: "1995-08-20",
    permanentAddress: "Plot 108, Green Valley Farms",
    village: "Kalyani Village",
    district: "Nadia",
    state: "West Bengal",
    pinCode: "741235",
    aadhaarNumber: "123456789012",
    aadhaarFront: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785268623/Seed2Shelf/kyc/farmer/kzxsnhbk85ijdrfdpdmw.png",
    aadhaarFrontPublicId: "Seed2Shelf/kyc/farmer/kzxsnhbk85ijdrfdpdmw",
    aadhaarBack: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785268624/Seed2Shelf/kyc/farmer/zgccm2p1z64b8gtzarqh.jpg",
    aadhaarBackPublicId: "Seed2Shelf/kyc/farmer/zgccm2p1z64b8gtzarqh",
    profilePhoto: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785267803/Seed2Shelf/profile/farmer/ujckrivi3yfto5mb4de4.png",
    profilePhotoPublicId: "Seed2Shelf/profile/farmer/ujckrivi3yfto5mb4de4",
  });

  // EDIT 2
  console.log("\n--- [EDIT 2] Saving Second Edit (New Address & Phone) ---");
  await syncUserToMongoDB({
    email: "arpanghosh8617@gmail.com",
    name: "Arpan Ghosh",
    mobileNumber: "9876543210",
    gender: "Male",
    dob: "1995-08-20",
    permanentAddress: "Flat 402, Sunshine Heights",
    village: "Lake Town",
    district: "Kolkata",
    state: "West Bengal",
    pinCode: "700089",
    aadhaarNumber: "998877665544",
    aadhaarFront: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785268623/Seed2Shelf/kyc/farmer/new_front.png",
    aadhaarFrontPublicId: "Seed2Shelf/kyc/farmer/new_front",
    aadhaarBack: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785268624/Seed2Shelf/kyc/farmer/new_back.jpg",
    aadhaarBackPublicId: "Seed2Shelf/kyc/farmer/new_back",
    profilePhoto: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785267803/Seed2Shelf/profile/farmer/new_profile.png",
    profilePhotoPublicId: "Seed2Shelf/profile/farmer/new_profile",
  });

  // EDIT 3
  console.log("\n--- [EDIT 3] Saving Third Edit (Updated Details Again) ---");
  await syncUserToMongoDB({
    email: "arpanghosh8617@gmail.com",
    name: "Arpan Ghosh",
    mobileNumber: "9123456789",
    gender: "Male",
    dob: "1995-08-20",
    permanentAddress: "Building 12, Tech Park Avenue",
    village: "Sector 5",
    district: "Salt Lake",
    state: "West Bengal",
    pinCode: "700091",
    aadhaarNumber: "112233445566",
  });

  // Inspect Mongo DB Atlas
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("seed2shelf");
  const usersColl = db.collection("users");
  const addressesColl = db.collection("addresses");
  const kycsColl = db.collection("kycs");

  const u3 = await usersColl.findOne({ email: "arpanghosh8617@gmail.com" });
  const a3 = u3?.addressId ? await addressesColl.findOne({ _id: u3.addressId }) : await addressesColl.findOne({ userId: u3?._id });
  const k3 = u3?.kycId ? await kycsColl.findOne({ _id: u3.kycId }) : await kycsColl.findOne({ userId: u3?._id });

  const totalUsers = await usersColl.countDocuments({ email: "arpanghosh8617@gmail.com" });
  const totalAddresses = await addressesColl.countDocuments({ userId: u3?._id });
  const totalKycs = await kycsColl.countDocuments({ userId: u3?._id });

  console.log("\n==========================================");
  console.log("CONSECUTIVE EDIT VERIFICATION SUMMARY:");
  console.log("==========================================");
  console.log(` • Total User Documents in MongoDB Atlas    : ${totalUsers} (Matches 1: ${totalUsers === 1})`);
  console.log(` • Total Address Documents for User         : ${totalAddresses} (Matches 1: ${totalAddresses === 1})`);
  console.log(` • Total KYC Documents for User             : ${totalKycs} (Matches 1: ${totalKycs === 1})`);
  console.log(` • Final Phone Stored                       : ${u3?.phone}`);
  console.log(` • Final Address Stored                     : ${a3?.addressLine}, ${a3?.district}`);
  console.log(` • Final Aadhaar Stored                     : ${k3?.aadhaarNumber}`);

  await client.close();
  console.log("==========================================");
}

testConsecutiveEdits().catch(console.error);
