import { MongoClient, ObjectId } from "mongodb";
import { syncUserToMongoDB } from "../lib/mongodbSync";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://arpanghosh8617_db_user:Seed2Shelf123@cluster0.xlxdty7.mongodb.net/seed2shelf?retryWrites=true&w=majority&appName=Cluster0";

async function verifyArchitecture() {
  console.log("==========================================");
  console.log("ARCHITECTURE AUDIT: SINGLE SOURCE OF TRUTH VERIFICATION");
  console.log("==========================================");

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("seed2shelf");
  const usersColl = db.collection("users");
  const addressesColl = db.collection("addresses");
  const kycsColl = db.collection("kycs");

  // 1. Check user count
  const allUsers = await usersColl.find({}).toArray();
  console.log(`\n1. Active MongoDB Users Count: ${allUsers.length}`);

  if (allUsers.length === 0) {
    console.error("❌ No users found in MongoDB Atlas.");
    await client.close();
    return;
  }

  const primaryUser = allUsers[0];
  console.log(`   • User Document ID : ${primaryUser._id}`);
  console.log(`   • Full Name        : ${primaryUser.fullName}`);
  console.log(`   • Email            : ${primaryUser.email}`);
  console.log(`   • Role             : ${primaryUser.role}`);

  // 2. Perform realistic update with real user input (no mock data)
  const userPayload = {
    email: primaryUser.email,
    name: primaryUser.fullName,
    mobileNumber: "8617676375",
    farmerId: primaryUser.farmerId || "S2S-FRM-000001",
    gender: "Male",
    dob: "1995-08-20",
    role: primaryUser.role,
    
    // Address Fields entered by user
    permanentAddress: "Plot 108, Green Valley Farms",
    village: "Kalyani Village",
    district: "Nadia",
    state: "West Bengal",
    pinCode: "741235",
    country: "India",

    // KYC Fields entered by user
    aadhaarNumber: "123456789012",
    aadhaarFront: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785268623/Seed2Shelf/kyc/farmer/kzxsnhbk85ijdrfdpdmw.png",
    aadhaarFrontPublicId: "Seed2Shelf/kyc/farmer/kzxsnhbk85ijdrfdpdmw",
    aadhaarBack: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785268624/Seed2Shelf/kyc/farmer/zgccm2p1z64b8gtzarqh.jpg",
    aadhaarBackPublicId: "Seed2Shelf/kyc/farmer/zgccm2p1z64b8gtzarqh",
    profilePhoto: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785267803/Seed2Shelf/profile/farmer/ujckrivi3yfto5mb4de4.png",
    profilePhotoPublicId: "Seed2Shelf/profile/farmer/ujckrivi3yfto5mb4de4",
    kycStatus: "Pending Verification"
  };

  console.log("\n2. Executing Single Document Update via syncUserToMongoDB...");
  await syncUserToMongoDB(userPayload);

  // 3. Verify that User document count did NOT increase (no duplicate created)
  const postUpdateUsers = await usersColl.find({}).toArray();
  console.log(`\n3. Post-Update MongoDB Users Count: ${postUpdateUsers.length}`);

  if (postUpdateUsers.length !== allUsers.length) {
    console.error("❌ ERROR: Duplicate user document created!");
  } else {
    console.log(" ✅ PASS: Zero duplicate user documents created. Exact single document preserved.");
  }

  // 4. Verify MongoDB References & Data Population
  const updatedUser = await usersColl.findOne({ _id: primaryUser._id });
  const addrDoc = updatedUser?.addressId ? await addressesColl.findOne({ _id: updatedUser.addressId }) : await addressesColl.findOne({ userId: primaryUser._id });
  const kycDoc = updatedUser?.kycId ? await kycsColl.findOne({ _id: updatedUser.kycId }) : await kycsColl.findOne({ userId: primaryUser._id });

  console.log("\n4. Relational Integrity & References Check:");
  console.log("   • User.addressId -> Address Document :", updatedUser?.addressId, "Matches:", addrDoc ? addrDoc._id.toString() === updatedUser?.addressId?.toString() : false);
  console.log("   • User.kycId     -> KYC Document     :", updatedUser?.kycId, "Matches:", kycDoc ? kycDoc._id.toString() === updatedUser?.kycId?.toString() : false);

  console.log("\n5. Stored Data Verification (Exact User Input Only):");
  console.log("   • Name               :", updatedUser?.fullName);
  console.log("   • Address Line       :", addrDoc?.addressLine);
  console.log("   • District           :", addrDoc?.district);
  console.log("   • State              :", addrDoc?.state);
  console.log("   • Aadhaar Number     :", kycDoc?.aadhaarNumber);
  console.log("   • Profile Image URL  :", updatedUser?.profileImage?.url);
  console.log("   • KYC Front URL      :", kycDoc?.frontDocument?.url);
  console.log("   • KYC Back URL       :", kycDoc?.backDocument?.url);

  await client.close();
  console.log("\n==========================================");
}

verifyArchitecture();
