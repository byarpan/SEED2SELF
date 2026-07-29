import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanDatabase() {
  console.log("==========================================");
  console.log("CLEANING MONGODB ATLAS USER COLLECTIONS");
  console.log("==========================================");

  if (!MONGODB_URI) {
    console.error("MONGODB_URI not found");
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    if (!db) {
      console.error("Database connection unavailable");
      return;
    }

    const usersCol = db.collection('users');
    const kycsCol = db.collection('kycs');
    const addrCol = db.collection('addresses');

    // 1. Find Super Admin user ID
    const superAdmin = await usersCol.findOne({ email: "admin@seed2shelf.com" });

    let superAdminId = superAdmin ? superAdmin._id : null;

    // 2. Delete all users EXCEPT admin@seed2shelf.com
    const userDeleteFilter = superAdminId 
      ? { _id: { $ne: superAdminId } }
      : { email: { $ne: "admin@seed2shelf.com" } };

    const deleteUsersResult = await usersCol.deleteMany(userDeleteFilter);
    console.log(` ✅ Deleted ${deleteUsersResult.deletedCount} old/demo user record(s) from MongoDB Atlas.`);

    // 3. Delete non-admin KYCs and Addresses
    if (superAdminId) {
      const deleteKycsResult = await kycsCol.deleteMany({ userId: { $ne: superAdminId } });
      const deleteAddrResult = await addrCol.deleteMany({ userId: { $ne: superAdminId } });
      console.log(` ✅ Deleted ${deleteKycsResult.deletedCount} old KYC document(s) from MongoDB Atlas.`);
      console.log(` ✅ Deleted ${deleteAddrResult.deletedCount} old Address document(s) from MongoDB Atlas.`);
    } else {
      await kycsCol.deleteMany({});
      await addrCol.deleteMany({});
    }

    // 4. Print remaining user(s) in MongoDB Atlas
    const remainingUsers = await usersCol.find({}).toArray();
    console.log(`\n📊 Remaining Users in MongoDB Atlas users collection (${remainingUsers.length}):`);
    remainingUsers.forEach(u => {
      console.log(`   • ${u.fullName || u.name} (${u.email}) - Role: ${u.role} - ID: ${u.adminId || u._id}`);
    });

  } catch (err: any) {
    console.error("Clean Database Error:", err.message);
  } finally {
    await mongoose.disconnect();
  }

  console.log("\n==========================================");
  console.log("DATABASE CLEANUP & RESET COMPLETED!");
  console.log("==========================================");
}

cleanDatabase();
