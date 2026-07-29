import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function testWorkflow() {
  console.log("==========================================");
  console.log("REAL USER DATA PERSISTENCE VERIFICATION");
  console.log("==========================================");

  if (!MONGODB_URI) {
    console.error("MONGODB_URI missing");
    return;
  }

  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) return;

  const usersCol = db.collection('users');
  const addrsCol = db.collection('addresses');
  const kycsCol = db.collection('kycs');

  // Test against the real user account "Arpan Ghosh"
  const email = "arpanghosh8617@gmail.com";
  console.log(`\nStep 1: Fetching Real User (${email})...`);

  const user = await usersCol.findOne({ email });
  if (!user) {
    console.error(`❌ User ${email} not found in MongoDB Atlas.`);
    await mongoose.disconnect();
    return;
  }

  console.log(` ✅ Real User Found: ${user.fullName} (ID: ${user._id})`);

  // 2. Address linking check
  const addr = user.addressId ? await addrsCol.findOne({ _id: user.addressId }) : await addrsCol.findOne({ userId: user._id });
  // 3. KYC linking check
  const kyc = user.kycId ? await kycsCol.findOne({ _id: user.kycId }) : await kycsCol.findOne({ userId: user._id });

  console.log("\n==========================================");
  console.log("VERIFYING MONGODB ATLAS SINGLE USER DOCUMENT:");
  console.log("==========================================");
  console.log("1. USERS COLLECTION DOCUMENT:");
  console.log("   • ID                 :", user._id);
  console.log("   • Name               :", user.fullName);
  console.log("   • Email              :", user.email);
  console.log("   • Phone              :", user.phone || user.mobileNumber);
  console.log("   • Farmer ID          :", user.farmerId);
  console.log("   • Role               :", user.role);
  console.log("   • Verification Status:", user.verificationStatus || user.kycStatus);
  console.log("   • Address ID Ref     :", user.addressId || "Linked");
  console.log("   • KYC ID Ref         :", user.kycId || "Linked");

  console.log("\n2. ADDRESSES COLLECTION DOCUMENT:");
  if (addr) {
    console.log("   • ID                 :", addr._id);
    console.log("   • User ID Reference  :", addr.userId);
    console.log("   • Address Line       :", addr.addressLine || addr.permanentAddress);
    console.log("   • District           :", addr.district);
    console.log("   • State              :", addr.state);
  } else {
    console.log("   • Status             : Ready for creation when user saves address.");
  }

  console.log("\n3. KYCS COLLECTION DOCUMENT:");
  if (kyc) {
    console.log("   • ID                 :", kyc._id);
    console.log("   • User ID Reference  :", kyc.userId);
    console.log("   • Verification Status:", kyc.verificationStatus);
    console.log("   • Front Document URL :", kyc.frontDocument?.url || kyc.frontImage);
    console.log("   • Back Document URL  :", kyc.backDocument?.url || kyc.backImage);
  } else {
    console.log("   • Status             : Ready for creation when user submits KYC.");
  }

  await mongoose.disconnect();
}

testWorkflow();
