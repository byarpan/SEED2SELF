import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../shared/models/User.js';
import { KYCVerificationStatus } from '../shared/enums/KYCVerificationStatus.js';

export const createAdminUser = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    if (!mongoURI) {
      console.error('MONGODB_URI environment variable is missing.');
      process.exit(1);
    }

    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB Atlas for Admin creation...');

    const adminEmail = 'admin@seed2shelf.com';
    const plainPassword = 'AdminPassword@123';

    let existingAdmin = await User.findOne({ email: adminEmail }).exec();

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    if (existingAdmin) {
      existingAdmin.role = 'ADMIN';
      existingAdmin.status = 'ACTIVE';
      existingAdmin.password = hashedPassword;
      await existingAdmin.save();
      console.log(`✓ Admin user '${adminEmail}' already exists. Password & ADMIN role updated successfully.`);
    } else {
      existingAdmin = await User.create({
        adminId: 'S2S-ADM-000001',
        fullName: 'Platform Super Admin',
        email: adminEmail,
        phone: '9999999999',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        verificationStatus: KYCVerificationStatus.VERIFIED,
      });
      console.log(`✓ New Platform Admin created successfully!`);
      console.log(`[Admin ID] ${existingAdmin.adminId}`);
      console.log(`[Email] ${adminEmail}`);
      console.log(`[Password] ${plainPassword}`);
    }

    process.exit(0);
  } catch (error: any) {
    console.error('❌ Failed to create Admin user:', error.message || error);
    process.exit(1);
  }
};

createAdminUser();
