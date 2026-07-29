import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function runVerification() {
  console.log("==========================================");
  console.log("SEED2SHELF DATABASE & STORAGE VERIFICATION");
  console.log("==========================================");

  // 1. Check Local Public Uploads Directory (Next.js file storage)
  const uploadsDir = path.resolve(__dirname, '../../../frontend/public/uploads');
  const kycUploadsDir = path.join(uploadsDir, 'kyc');
  const profileUploadsDir = path.join(uploadsDir, 'profile');

  console.log("\n📁 [1. LOCAL FILE STORAGE CHECK]:");
  if (fs.existsSync(kycUploadsDir)) {
    const kycFiles = fs.readdirSync(kycUploadsDir);
    console.log(`   ✅ KYC Uploads Directory: ${kycFiles.length} file(s) stored in public/uploads/kyc/`);
    kycFiles.forEach(f => console.log(`      • ${f}`));
  } else {
    console.log("   ℹ️ KYC Uploads Directory is empty or not yet created.");
  }

  if (fs.existsSync(profileUploadsDir)) {
    const profileFiles = fs.readdirSync(profileUploadsDir);
    console.log(`   ✅ Profile Uploads Directory: ${profileFiles.length} file(s) stored in public/uploads/profile/`);
    profileFiles.forEach(f => console.log(`      • ${f}`));
  }

  // 2. Check MongoDB Atlas Connection & Records
  console.log("\n🌐 [2. MONGODB ATLAS DATABASE CHECK]:");
  if (!MONGODB_URI) {
    console.log("   ❌ MONGODB_URI is not set in environment.");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("   ✅ Connected to MongoDB Atlas Cluster successfully!");

    const db = mongoose.connection.db;
    if (!db) {
      console.log("   ❌ Failed to access MongoDB Atlas Database instance.");
      return;
    }
    const usersCollection = db.collection('users');
    const mongoUsers = await usersCollection.find({}).toArray();

    console.log(`   📊 Total MongoDB Users Count: ${mongoUsers.length}`);
    mongoUsers.forEach((u, idx) => {
      console.log(`\n   User #${idx + 1}:`);
      console.log(`      • Name: ${u.fullName || u.name || 'N/A'}`);
      console.log(`      • Email: ${u.email}`);
      console.log(`      • Role: ${u.role}`);
      console.log(`      • Custom ID: ${u.farmerId || u.processorId || u.customId || 'N/A'}`);
      console.log(`      • KYC Status: ${u.verificationStatus || u.kycStatus || 'Not Submitted'}`);
      console.log(`      • Aadhaar Number: ${u.aadhaarNumber || u.aadhaar || 'Not Provided'}`);
      console.log(`      • Aadhaar Front Doc: ${u.aadhaarFront || u.kycDocuments?.front || 'None'}`);
      console.log(`      • Aadhaar Back Doc: ${u.aadhaarBack || u.kycDocuments?.back || 'None'}`);
    });

  } catch (err: any) {
    console.error("   ❌ MongoDB Atlas Check Error:", err.message);
  } finally {
    await mongoose.disconnect();
  }

  console.log("\n==========================================");
  console.log("VERIFICATION CHECK COMPLETED");
  console.log("==========================================");
}

runVerification();
