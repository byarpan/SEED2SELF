import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function syncArpanProfile() {
  console.log("==========================================");
  console.log("SYNCING ARPAN GHOSH FARMER PROFILE TO MONGODB ATLAS");
  console.log("==========================================");

  if (!MONGODB_URI) return;
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) return;

  const usersCol = db.collection('users');
  const addrsCol = db.collection('addresses');
  const kycsCol = db.collection('kycs');

  // 1. Delete any leftover test/duplicate admin records
  await usersCol.deleteMany({ email: { $ne: "admin@seed2shelf.com", $regex: /admin/i } });

  // 2. Upsert Arpan Ghosh Farmer record into `users` collection
  const farmerEmail = "arpanghosh8617@gmail.com";
  const userResult = await usersCol.findOneAndUpdate(
    { email: farmerEmail },
    {
      $set: {
        fullName: "Arpan Ghosh",
        email: farmerEmail,
        phone: "8617676375",
        role: "FARMER",
        farmerId: "S2S-FRM-000001",
        status: "ACTIVE",
        verificationStatus: "APPROVED",
        updatedAt: new Date()
      },
      $setOnInsert: {
        createdAt: new Date(),
        averageRating: 0,
        reviewCount: 0
      }
    },
    { upsert: true, returnDocument: "after" }
  );

  const mongoUser = userResult?.value || (await usersCol.findOne({ email: farmerEmail }));
  if (!mongoUser) {
    console.error("Failed to insert/find Arpan Ghosh in users collection.");
    return;
  }

  const userId = mongoUser._id;

  // 3. Upsert Address into `addresses` collection
  const addrResult = await addrsCol.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        addressLine: "77/1,A.C.Road (South),Indraprastha,Khagra,Berhampore,Murshidabad,WestBengal",
        village: "Berhampore",
        district: "Murshidabad",
        state: "West Bengal",
        pinCode: "742103",
        country: "India",
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true, returnDocument: "after" }
  );

  const addressId = addrResult?.value?._id || (await addrsCol.findOne({ userId }))?._id;
  if (addressId) {
    await usersCol.updateOne({ _id: userId }, { $set: { addressId } });
  }

  // 4. Upsert KYC into `kycs` collection
  const kycResult = await kycsCol.findOneAndUpdate(
    { userId },
    {
      $set: {
        userId,
        aadhaarNumber: "523349740171",
        frontImage: "/uploads/kyc/aadhaar_front-b54ed3c3-c7a6-44ca-a3be-f6c18588c851-1785260963043.jpeg",
        backImage: "/uploads/kyc/aadhaar_back-b54ed3c3-c7a6-44ca-a3be-f6c18588c851-1785260967210.jpeg",
        verificationStatus: "APPROVED",
        updatedAt: new Date()
      },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true, returnDocument: "after" }
  );

  const kycId = kycResult?.value?._id || (await kycsCol.findOne({ userId }))?._id;
  if (kycId) {
    await usersCol.updateOne({ _id: userId }, { $set: { kycId } });
  }

  console.log("\n✅ ARPAN GHOSH FARMER PROFILE FULLY SYNCED TO MONGODB ATLAS!");

  // Print all users in MongoDB Atlas
  const allUsers = await usersCol.find({}).toArray();
  console.log(`\n📊 MongoDB Atlas Users Collection (${allUsers.length}):`);
  allUsers.forEach((u, i) => {
    console.log(`   #${i + 1}: ${u.fullName} (${u.email}) - Role: ${u.role} - ID: ${u.farmerId || u.adminId || u._id} - Status: ${u.verificationStatus}`);
    console.log(`       Address Ref: ${u.addressId || 'None'} | KYC Ref: ${u.kycId || 'None'}`);
  });

  await mongoose.disconnect();
}

syncArpanProfile();
