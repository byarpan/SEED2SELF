import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://arpanghosh8617_db_user:Seed2Shelf123@cluster0.xlxdty7.mongodb.net/seed2shelf?retryWrites=true&w=majority&appName=Cluster0";

async function cleanFakeUsers() {
  console.log("==========================================");
  console.log("CLEANING FAKE / DEMO USER ACCOUNTS IN MONGODB ATLAS");
  console.log("==========================================");

  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("seed2shelf");
  const usersColl = db.collection("users");
  const addressesColl = db.collection("addresses");
  const kycsColl = db.collection("kycs");

  // Filter pattern for fake/demo accounts
  const fakeFilter = {
    $or: [
      { email: /siddharth\.farmer@seed2shelf\.com/i },
      { email: /@demo\.com/i },
      { fullName: /Siddharth Farmer/i },
      { fullName: /Rajesh Kumar/i },
      { fullName: /System Admin/i },
      { fullName: /FarmFresh Processing/i },
      { fullName: /Dummy/i },
      { fullName: /Sample/i },
      { phone: "9876543210" },
      { aadhaarNumber: "998877665544" }
    ]
  };

  const fakeUsers = await usersColl.find(fakeFilter).toArray();
  const fakeUserIds = fakeUsers.map(u => u._id);

  console.log(`Found ${fakeUsers.length} fake/demo user account(s) to remove:`);
  fakeUsers.forEach(u => {
    console.log(` • Removing: ${u.fullName} (${u.email || "No Email"}, ID: ${u._id})`);
  });

  if (fakeUserIds.length > 0) {
    const deletedUsers = await usersColl.deleteMany({ _id: { $in: fakeUserIds } });
    const deletedAddresses = await addressesColl.deleteMany({ userId: { $in: fakeUserIds } });
    const deletedKycs = await kycsColl.deleteMany({ userId: { $in: fakeUserIds } });

    console.log(`\n ✅ Deleted ${deletedUsers.deletedCount} user document(s) from 'users' collection.`);
    console.log(` ✅ Deleted ${deletedAddresses.deletedCount} address document(s) from 'addresses' collection.`);
    console.log(` ✅ Deleted ${deletedKycs.deletedCount} KYC document(s) from 'kycs' collection.`);
  } else {
    console.log("\n ✅ No fake/demo users found in MongoDB Atlas.");
  }

  // Print remaining active real accounts in MongoDB Atlas
  const remainingUsers = await usersColl.find({}).toArray();
  console.log(`\n==========================================`);
  console.log(`REMAINING REAL USERS IN MONGODB ATLAS (${remainingUsers.length}):`);
  console.log(`==========================================`);
  for (const u of remainingUsers) {
    const addr = u.addressId ? await addressesColl.findOne({ _id: u.addressId }) : await addressesColl.findOne({ userId: u._id });
    const kyc = u.kycId ? await kycsColl.findOne({ _id: u.kycId }) : await kycsColl.findOne({ userId: u._id });

    console.log(`\n👤 User: ${u.fullName} (${u.email})`);
    console.log(`   • ID                 : ${u._id}`);
    console.log(`   • Role               : ${u.role}`);
    console.log(`   • Phone              : ${u.phone || u.mobileNumber || "N/A"}`);
    console.log(`   • Farmer ID          : ${u.farmerId || u.processorId || u.adminId || "N/A"}`);
    console.log(`   • Verification Status: ${u.verificationStatus || u.kycStatus || "PENDING"}`);
    console.log(`   • Address ID Ref     : ${u.addressId || addr?._id || "Linked via userId"}`);
    console.log(`   • Address Details    : ${addr ? `${addr.addressLine || addr.permanentAddress}, ${addr.district}, ${addr.state}` : "None"}`);
    console.log(`   • KYC ID Ref         : ${u.kycId || kyc?._id || "Linked via userId"}`);
    console.log(`   • KYC Front URL      : ${kyc?.frontDocument?.url || kyc?.frontImage || u.aadhaarFront || "None"}`);
    console.log(`   • KYC Back URL       : ${kyc?.backDocument?.url || kyc?.backImage || u.aadhaarBack || "None"}`);
  }

  await client.close();
}

cleanFakeUsers().catch(console.error);
