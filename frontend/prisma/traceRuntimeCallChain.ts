import { syncUserToMongoDB } from "../lib/mongodbSync";
import { getMongoDb } from "../lib/mongodb";

async function traceRuntimeCallChain() {
  console.log("==========================================");
  console.log("EXACT RUNTIME CALL CHAIN & LOGGING TRACE");
  console.log("==========================================");

  const db = await getMongoDb();
  const usersColl = db.collection("users");
  const addressesColl = db.collection("addresses");
  const kycsColl = db.collection("kycs");

  // Step 1: Simulated Frontend State
  const frontendFormState = {
    targetUserId: "arpanghosh8617@gmail.com",
    name: "Arpan Ghosh",
    mobileNumber: "8617676375",
    dob: "1995-08-20",
    gender: "Male",
    permanentAddress: "Plot 108, Green Valley Farms",
    village: "Kalyani Village",
    district: "Nadia",
    state: "West Bengal",
    pinCode: "741235",
    profilePhoto: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785267803/Seed2Shelf/profile/farmer/ujckrivi3yfto5mb4de4.png",
    profilePhotoPublicId: "Seed2Shelf/profile/farmer/ujckrivi3yfto5mb4de4",
    aadhaarNumber: "123456789012",
    aadhaarFront: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785268623/Seed2Shelf/kyc/farmer/kzxsnhbk85ijdrfdpdmw.png",
    aadhaarFrontPublicId: "Seed2Shelf/kyc/farmer/kzxsnhbk85ijdrfdpdmw",
    aadhaarBack: "https://res.cloudinary.com/kgfnikzg/image/upload/v1785268624/Seed2Shelf/kyc/farmer/zgccm2p1z64b8gtzarqh.jpg",
    aadhaarBackPublicId: "Seed2Shelf/kyc/farmer/zgccm2p1z64b8gtzarqh",
    submitKyc: true
  };

  console.log("\nSTEP 1: REACT COMPONENT FRONTEND STATE");
  console.log(" Component: FarmerProfile (frontend/pages/farmer/profile/index.tsx)");
  console.log(" Handler  : handleSave()");
  console.log(" State Payload:", JSON.stringify(frontendFormState, null, 2));

  console.log("\nSTEP 2: API ENDPOINT EXECUTION");
  console.log(" Endpoint : PUT /api/users/arpanghosh8617@gmail.com (frontend/pages/api/users/[id].ts)");
  
  console.log("\nSTEP 3: MONGODB SYNC SERVICE");
  console.log(" Service  : syncUserToMongoDB (frontend/lib/mongodbSync.ts)");
  await syncUserToMongoDB(frontendFormState);

  console.log("\nSTEP 4: MONGODB ATLAS DOCUMENT INSPECTION AFTER EXECUTION");
  const mongoUser = await usersColl.findOne({ email: "arpanghosh8617@gmail.com" });
  const addressDoc = mongoUser?.addressId ? await addressesColl.findOne({ _id: mongoUser.addressId }) : await addressesColl.findOne({ userId: mongoUser?._id });
  const kycDoc = mongoUser?.kycId ? await kycsColl.findOne({ _id: mongoUser.kycId }) : await kycsColl.findOne({ userId: mongoUser?._id });

  console.log("\nStored User Document in `users` Collection:");
  console.log(JSON.stringify(mongoUser, null, 2));

  console.log("\nStored Address Document in `addresses` Collection:");
  console.log(JSON.stringify(addressDoc, null, 2));

  console.log("\nStored KYC Document in `kycs` Collection:");
  console.log(JSON.stringify(kycDoc, null, 2));

  console.log("==========================================");
  process.exit(0);
}

traceRuntimeCallChain().catch(console.error);
