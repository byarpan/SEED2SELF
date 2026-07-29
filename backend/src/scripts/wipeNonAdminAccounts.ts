import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

import User from '../shared/models/User.js';
import Counter from '../shared/models/Counter.js';

async function wipeNonAdmin() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('MONGODB_URI environment variable is not defined.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB Atlas...');

    // 1. Delete all non-admin users
    const deleteResult = await User.deleteMany({ role: { $ne: 'ADMIN' } });
    console.log(`Deleted ${deleteResult.deletedCount} non-admin users from MongoDB.`);

    // 2. Reset Sequence Counters
    const counterResult = await Counter.deleteMany({});
    console.log(`Deleted ${counterResult.deletedCount} sequence counter entries in MongoDB.`);

    // 3. Clear other collections if exist
    const collections = mongoose.connection.collections;
    for (const name in collections) {
      if (name !== 'users' && name !== 'counters' && name !== 'system.indexes') {
        try {
          await collections[name].deleteMany({});
          console.log(`Cleared collection: ${name}`);
        } catch (e) {
          console.warn(`Skipped collection ${name}:`, e);
        }
      }
    }

    console.log('MongoDB non-admin user wipe completed successfully!');
  } catch (error) {
    console.error('Error during MongoDB wipe:', error);
  } finally {
    await mongoose.disconnect();
  }
}

wipeNonAdmin();
