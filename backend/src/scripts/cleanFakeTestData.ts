import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanFakeData() {
  if (!MONGODB_URI) return;
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) return;

  const usersCollection = db.collection('users');
  const res = await usersCollection.deleteMany({
    $or: [
      { email: { $regex: /farmer1785262152985/i } },
      { fullName: "Ramesh Farmer" }
    ]
  });

  console.log(`Cleaned ${res.deletedCount} fake test document(s) from MongoDB Atlas.`);
  await mongoose.disconnect();
}

cleanFakeData();
