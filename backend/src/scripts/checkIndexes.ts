import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function checkAndFixIndexes() {
  if (!MONGODB_URI) return;
  await mongoose.connect(MONGODB_URI);
  const db = mongoose.connection.db;
  if (!db) return;

  const usersCollection = db.collection('users');
  const indexes = await usersCollection.indexes();
  console.log("Current MongoDB Indexes on users collection:");
  console.log(indexes);

  // Drop non-sparse unique indexes that cause E11000 collisions
  for (const idx of indexes) {
    if (idx.name !== '_id_' && idx.unique && !idx.sparse) {
      console.log(`Dropping non-sparse unique index: ${idx.name}`);
      try {
        await usersCollection.dropIndex(idx.name);
        console.log(`Dropped index ${idx.name} successfully.`);
      } catch (e: any) {
        console.error(`Failed to drop index ${idx.name}:`, e.message);
      }
    }
  }

  // Re-create sparse unique indexes
  console.log("Re-creating sparse unique indexes for farmerId, processorId, adminId, email, phone...");
  try {
    await usersCollection.createIndex({ email: 1 }, { unique: true, sparse: true });
    await usersCollection.createIndex({ farmerId: 1 }, { unique: true, sparse: true });
    await usersCollection.createIndex({ processorId: 1 }, { unique: true, sparse: true });
    await usersCollection.createIndex({ adminId: 1 }, { unique: true, sparse: true });
    await usersCollection.createIndex({ phone: 1 }, { unique: true, sparse: true });
  } catch (e: any) {
    console.error("Index creation error:", e.message);
  }

  await mongoose.disconnect();
  console.log("MongoDB Indexes fixed!");
}

checkAndFixIndexes();
