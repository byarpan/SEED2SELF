import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://arpanghosh8617_db_user:Seed2Shelf123@cluster0.xlxdty7.mongodb.net/seed2shelf?retryWrites=true&w=majority&appName=Cluster0";
const prisma = new PrismaClient();

async function forceSync() {
  console.log("==========================================");
  console.log("FORCE SYNC ALL REAL USERS TO MONGODB ATLAS");
  console.log("==========================================");

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('seed2shelf');
  const usersCol = db.collection('users');
  const addrsCol = db.collection('addresses');
  const kycsCol = db.collection('kycs');

  // Drop phone index to prevent collision if present
  try {
    await usersCol.dropIndex("phone_1");
  } catch (e) {}

  const sqliteUsers = await prisma.user.findMany();
  console.log(`Found ${sqliteUsers.length} user(s) in SQLite dev.db.`);

  for (const u of sqliteUsers) {
    const normEmail = u.email ? u.email.toLowerCase().trim() : null;
    const normKycStatus = u.kycStatus === "Verified" || u.kycStatus === "Approved" || u.kycStatus === "VERIFIED"
      ? "APPROVED"
      : u.kycStatus === "Rejected" || u.kycStatus === "REJECTED"
      ? "REJECTED"
      : u.kycStatus === "Re-Upload Requested" || u.kycStatus === "RE_UPLOAD"
      ? "RE_UPLOAD_REQUESTED"
      : "PENDING";

    let userFilter: any = {};
    if (u.farmerId) {
      userFilter = { farmerId: u.farmerId };
    } else if (u.processorId) {
      userFilter = { processorId: u.processorId };
    } else if (u.adminId) {
      userFilter = { adminId: u.adminId };
    } else if (normEmail) {
      userFilter = { email: normEmail };
    } else {
      userFilter = { sqliteId: u.id };
    }

    const userSetDoc: any = {
      sqliteId: u.id,
      fullName: u.name,
      email: normEmail,
      phone: u.mobileNumber || "8617676375",
      role: u.role || "FARMER",
      status: "ACTIVE",
      verificationStatus: normKycStatus,
      profilePhoto: u.profilePhoto || null,
      updatedAt: new Date(),
    };

    if (u.farmerId) userSetDoc.farmerId = u.farmerId;
    if (u.processorId) userSetDoc.processorId = u.processorId;
    if (u.adminId) userSetDoc.adminId = u.adminId;

    await usersCol.updateOne(
      userFilter,
      {
        $set: userSetDoc,
        $setOnInsert: {
          createdAt: u.createdAt || new Date(),
          averageRating: 0,
          reviewCount: 0,
        }
      },
      { upsert: true }
    );

    const mongoUser = await usersCol.findOne(userFilter);
    if (!mongoUser) continue;
    const mongoUserId = mongoUser._id;

    // 2. Upsert into `addresses` collection
    if (u.permanentAddress || u.village || u.district || u.state || u.pinCode) {
      await addrsCol.updateOne(
        { userId: mongoUserId },
        {
          $set: {
            userId: mongoUserId,
            addressLine: u.permanentAddress || "77/1,A.C.Road (South),Indraprastha,Khagra,Berhampore,Murshidabad,WestBengal",
            village: u.village || "Berhampore",
            district: u.district || "Murshidabad",
            state: u.state || "West Bengal",
            pinCode: u.pinCode || "742103",
            country: "India",
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );

      const addrDoc = await addrsCol.findOne({ userId: mongoUserId });
      if (addrDoc) {
        await usersCol.updateOne({ _id: mongoUserId }, { $set: { addressId: addrDoc._id } });
      }
    }

    // 3. Upsert into `kycs` collection
    if (u.aadhaarNumber || u.aadhaarFront || u.aadhaarBack) {
      await kycsCol.updateOne(
        { userId: mongoUserId },
        {
          $set: {
            userId: mongoUserId,
            aadhaarNumber: u.aadhaarNumber || "523349740171",
            frontImage: u.aadhaarFront || "",
            backImage: u.aadhaarBack || "",
            verificationStatus: normKycStatus,
            updatedAt: new Date(),
          },
          $setOnInsert: { createdAt: new Date() }
        },
        { upsert: true }
      );

      const kycDoc = await kycsCol.findOne({ userId: mongoUserId });
      if (kycDoc) {
        await usersCol.updateOne({ _id: mongoUserId }, { $set: { kycId: kycDoc._id } });
      }
    }

    console.log(`  ✅ Successfully synced ${u.name} (Email: ${normEmail}, Farmer ID: ${u.farmerId || 'N/A'}) to MongoDB Atlas!`);
  }

  await client.close();
  await prisma.$disconnect();
  console.log("\n==========================================");
  console.log("FORCE SYNC COMPLETED SUCCESSFULLY!");
  console.log("==========================================");
}

forceSync().catch(console.error);
