import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../shared/models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/seed2shelf';

async function seedAdminUser() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI);
    console.log('MongoDB connected.');

    const adminEmail = 'admin@seed2shelf.com';
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log(`Admin user already exists in MongoDB: ${existingAdmin.email} (ID: ${existingAdmin.adminId || existingAdmin._id})`);
    } else {
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      const newAdmin = await User.create({
        fullName: 'Platform Administrator',
        name: 'Platform Administrator',
        email: adminEmail,
        password: hashedPassword,
        phone: '+91 9999999999',
        role: 'ADMIN',
        adminId: 'S2S-ADM-000001',
        status: 'ACTIVE',
      });
      console.log(`Successfully created default Admin user in MongoDB: ${newAdmin.email} (ID: ${newAdmin.adminId})`);
    }

    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  } catch (err) {
    console.error('Error seeding Admin user:', err);
    process.exit(1);
  }
}

seedAdminUser();
