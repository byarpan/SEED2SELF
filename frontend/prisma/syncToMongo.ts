import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';

const MONGODB_URI = "mongodb+srv://arpanghosh8617_db_user:Seed2Shelf123@cluster0.xlxdty7.mongodb.net/seed2shelf?retryWrites=true&w=majority&appName=Cluster0";
const prisma = new PrismaClient();

async function syncAllUsers() {
  console.log("==========================================");
  console.log("SYNCING ALL USERS TO MONGODB ATLAS");
  console.log("==========================================");

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db('seed2shelf');
  const usersCollection = db.collection('users');

  const sqliteUsers = await prisma.user.findMany();
  console.log(`Found ${sqliteUsers.length} user(s) in SQLite dev.db.`);

  let counter = 100;
  for (const u of sqliteUsers) {
    counter++;
    let filter: any = {};
    if (u.email) {
      filter = { email: u.email.toLowerCase().trim() };
    } else if (u.farmerId) {
      filter = { farmerId: u.farmerId };
    } else if (u.processorId) {
      filter = { processorId: u.processorId };
    } else if (u.adminId) {
      filter = { adminId: u.adminId };
    } else {
      filter = { sqliteId: u.id };
    }

    const phoneVal = u.mobileNumber || `98${String(counter).padStart(8, '0')}`;

    const setFields: any = {
      sqliteId: u.id,
      fullName: u.name || "User",
      email: u.email ? u.email.toLowerCase().trim() : undefined,
      phone: phoneVal,
      role: u.role || "FARMER",
      status: "ACTIVE",
      verificationStatus: u.kycStatus || "PENDING",
      updatedAt: new Date(),
    };

    if (u.farmerId) setFields.farmerId = u.farmerId;
    if (u.processorId) setFields.processorId = u.processorId;
    if (u.adminId) setFields.adminId = u.adminId;
    if (u.aadhaarNumber) setFields.aadhaarNumber = u.aadhaarNumber;
    if (u.aadhaarFront) setFields.aadhaarFront = u.aadhaarFront;
    if (u.aadhaarBack) setFields.aadhaarBack = u.aadhaarBack;
    if (u.profilePhoto) setFields.profilePhoto = u.profilePhoto;
    if (u.dob) setFields.dob = u.dob;
    if (u.gender) setFields.gender = u.gender;
    if (u.permanentAddress) setFields.permanentAddress = u.permanentAddress;
    if (u.state) setFields.state = u.state;
    if (u.district) setFields.district = u.district;
    if (u.village) setFields.village = u.village;
    if (u.pinCode) setFields.pinCode = u.pinCode;

    const updateDoc: any = {
      $set: setFields,
      $setOnInsert: {
        createdAt: u.createdAt || new Date(),
        averageRating: 0,
        reviewCount: 0,
      }
    };

    await usersCollection.updateOne(filter, updateDoc, { upsert: true });
    console.log(` ✅ Synced: ${u.name} (${u.role}) - ID: ${u.farmerId || u.processorId || u.adminId || u.id}`);
  }

  await client.close();
  await prisma.$disconnect();

  console.log("\n==========================================");
  console.log("ALL USERS SYNCED TO MONGODB ATLAS SUCCESSFULLY!");
  console.log("==========================================");
}

syncAllUsers().catch(console.error);
