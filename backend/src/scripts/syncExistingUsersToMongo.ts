import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const prisma = new PrismaClient();

async function syncAllUsers() {
  console.log("==========================================");
  console.log("SYNCING ALL USERS TO MONGODB ATLAS");
  console.log("==========================================");

  if (!MONGODB_URI) {
    console.error("MONGODB_URI not configured");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) {
      console.error("MongoDB Atlas connection db unavailable");
      return;
    }

    const usersCollection = db.collection('users');
    const sqliteUsers = await prisma.user.findMany();

    console.log(`Found ${sqliteUsers.length} user(s) in SQLite dev.db.`);

    for (const u of sqliteUsers) {
      const filter = u.email 
        ? { email: u.email.toLowerCase().trim() }
        : { sqliteId: u.id };

      const updateDoc = {
        $set: {
          sqliteId: u.id,
          fullName: u.name || "User",
          email: u.email ? u.email.toLowerCase().trim() : undefined,
          phone: u.mobileNumber || "0000000000",
          role: u.role || "FARMER",
          status: "ACTIVE",
          farmerId: u.farmerId || undefined,
          processorId: u.processorId || undefined,
          adminId: u.adminId || undefined,
          aadhaarNumber: u.aadhaarNumber || undefined,
          aadhaarFront: u.aadhaarFront || undefined,
          aadhaarBack: u.aadhaarBack || undefined,
          verificationStatus: u.kycStatus || "PENDING",
          profilePhoto: u.profilePhoto || undefined,
          dob: u.dob || undefined,
          gender: u.gender || undefined,
          permanentAddress: u.permanentAddress || undefined,
          state: u.state || undefined,
          district: u.district || undefined,
          village: u.village || undefined,
          pinCode: u.pinCode || undefined,
          updatedAt: new Date(),
        },
        $setOnInsert: {
          createdAt: u.createdAt || new Date(),
          averageRating: 0,
          reviewCount: 0,
        }
      };

      await usersCollection.updateOne(filter, updateDoc, { upsert: true });
      console.log(` ✅ Synced: ${u.name} (${u.role}) - ID: ${u.farmerId || u.processorId || u.adminId || u.id}`);
    }

    console.log("\n==========================================");
    console.log("ALL USERS SYNCED TO MONGODB ATLAS SUCCESSFULLY!");
    console.log("==========================================");
  } catch (err: any) {
    console.error("Sync Error:", err.message);
  } finally {
    await prisma.$disconnect();
    await mongoose.disconnect();
  }
}

syncAllUsers();
