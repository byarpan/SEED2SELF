import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://arpanghosh8617_db_user:Seed2Shelf123@cluster0.xlxdty7.mongodb.net/seed2shelf?retryWrites=true&w=majority&appName=Cluster0";

async function seedRealUser() {
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db("seed2shelf");
  const usersColl = db.collection("users");

  const realUser = {
    fullName: "Arpan Ghosh",
    email: "arpanghosh8617@gmail.com",
    role: "FARMER",
    phone: "8617676375",
    farmerId: "S2S-FRM-000001",
    status: "ACTIVE",
    verificationStatus: "APPROVED",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await usersColl.updateOne(
    { email: "arpanghosh8617@gmail.com" },
    { $set: realUser },
    { upsert: true }
  );

  console.log("✅ Seeded real user Arpan Ghosh (arpanghosh8617@gmail.com) into MongoDB Atlas!");
  await client.close();
}

seedRealUser();
