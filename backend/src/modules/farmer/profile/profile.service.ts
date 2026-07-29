import { ProfileRepository, profileRepository } from './profile.repository.js';
import {
  RegisterFarmerDTO,
  UpdateProfileDTO,
  UpdateAddressDTO,
  UpdateKYCDTO,
  BankAccountDTO,
  NotificationSettingsDTO,
} from './dto/profile.dto.js';
import { FarmerFullProfileResponse } from './interfaces/profile.interface.js';
import { IUser } from '../../../shared/models/User.js';
import { KYCVerificationStatus } from '../../../shared/enums/KYCVerificationStatus.js';
import { generateSequenceId } from '../../../shared/helpers/sequence.helper.js';

export class ProfileService {
  constructor(private repository: ProfileRepository = profileRepository) {}

  async registerFarmer(dto: RegisterFarmerDTO) {
    const existingUser = await this.repository.findUserByEmailOrPhone(dto.email, dto.phone);
    if (existingUser) {
      throw new Error('User with this email or phone number already exists.');
    }

    const farmerId = await generateSequenceId('FRM');

    const newUser = await this.repository.createUser({
      farmerId,
      role: 'FARMER',
      fullName: dto.fullName,
      email: dto.email ? dto.email.toLowerCase().trim() : undefined,
      phone: dto.phone.trim(),
      verificationStatus: KYCVerificationStatus.PENDING,
      averageRating: 0,
      reviewCount: 0,
    });

    return {
      message: 'Farmer registered successfully',
      user: {
        _id: newUser._id,
        farmerId: newUser.farmerId,
        role: newUser.role,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        verificationStatus: newUser.verificationStatus,
        createdAt: newUser.createdAt,
      },
    };
  }

  async getProfile(userId: string): Promise<FarmerFullProfileResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile with ID '${userId}' not found in MongoDB Atlas`);
    }

    const address = await this.repository.findAddressByUserId(String(user._id));
    const kyc = await this.repository.findKYCByUserId(String(user._id));
    const bankAccount = await this.repository.findBankAccountByUserId(String(user._id));

    return {
      user: {
        _id: user._id,
        farmerId: user.farmerId,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        role: user.role,
        profilePhoto: user.profilePhoto,
        verificationStatus: user.verificationStatus || KYCVerificationStatus.PENDING,
        averageRating: user.averageRating || 0,
        reviewCount: user.reviewCount || 0,
        addressId: user.addressId,
        kycId: user.kycId,
        walletId: user.walletId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      address: address ? address.toObject() : null,
      kyc: kyc ? kyc.toObject() : null,
      bankAccount: bankAccount ? bankAccount.toObject() : null,
      notificationSettings: {
        emailNotifications: true,
        smsNotifications: true,
        orderAlerts: true,
        paymentAlerts: true,
      },
    };
  }

  async updateProfile(userId: string, dto: any) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error('User not found in MongoDB Atlas');
    }

    const mongoUserId = String(user._id);

    // 1. Update User basic information
    const userUpdatePayload: Partial<IUser> = {};
    if (dto.name || dto.fullName) userUpdatePayload.fullName = dto.name || dto.fullName;
    if (dto.mobileNumber || dto.phone) userUpdatePayload.phone = dto.mobileNumber || dto.phone;
    if (dto.gender) userUpdatePayload.gender = dto.gender;
    if (dto.dob || dto.dateOfBirth) userUpdatePayload.dateOfBirth = new Date(dto.dob || dto.dateOfBirth);
    if (dto.profilePhoto) userUpdatePayload.profilePhoto = dto.profilePhoto;

    await this.repository.updateUser(mongoUserId, userUpdatePayload);

    // 2. Upsert Address if address fields are present
    if (dto.permanentAddress !== undefined || dto.village !== undefined || dto.district !== undefined || dto.state !== undefined || dto.pinCode !== undefined) {
      const addressDoc = await this.repository.upsertAddress(mongoUserId, {
        addressLine: dto.permanentAddress || dto.addressLine || '',
        village: dto.village || '',
        district: dto.district || '',
        state: dto.state || '',
        pinCode: dto.pinCode || '',
        country: dto.country || 'India',
      });
      await this.repository.updateUser(mongoUserId, { addressId: addressDoc._id });
    }

    // 3. Upsert KYC if KYC fields are present
    if (dto.aadhaarNumber !== undefined || dto.aadhaarFront !== undefined || dto.aadhaarBack !== undefined) {
      const kycDoc = await this.repository.upsertKYC(mongoUserId, {
        aadhaarNumber: dto.aadhaarNumber || '',
        frontDocument: {
          url: dto.aadhaarFront || '',
          publicId: dto.aadhaarFrontPublicId || `kyc_front_${mongoUserId}`,
        },
        backDocument: {
          url: dto.aadhaarBack || '',
          publicId: dto.aadhaarBackPublicId || `kyc_back_${mongoUserId}`,
        },
      });
      await this.repository.updateUser(mongoUserId, { kycId: kycDoc._id });
    }

    // 4. Return full populated profile
    return this.getProfile(mongoUserId);
  }

  async updateAddress(userId: string, dto: UpdateAddressDTO) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error('User not found in MongoDB Atlas');
    }

    const address = await this.repository.upsertAddress(String(user._id), dto);
    await this.repository.updateUser(String(user._id), { addressId: address._id });
    return address;
  }

  async updateKYC(userId: string, dto: UpdateKYCDTO) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error('User not found in MongoDB Atlas');
    }

    const kyc = await this.repository.upsertKYC(String(user._id), dto);
    await this.repository.updateUser(String(user._id), {
      kycId: kyc._id,
      verificationStatus: KYCVerificationStatus.PENDING,
    });
    return kyc;
  }

  async updateBankAccount(userId: string, dto: BankAccountDTO) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error('User not found in MongoDB Atlas');
    }

    const bankAccount = await this.repository.upsertBankAccount(String(user._id), dto);
    return bankAccount;
  }

  async getBankAccount(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error('User not found in MongoDB Atlas');
    }

    const bankAccount = await this.repository.findBankAccountByUserId(String(user._id));
    return bankAccount;
  }

  async getNotificationSettings(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error('User not found in MongoDB Atlas');
    }

    return {
      userId: String(user._id),
      emailNotifications: true,
      smsNotifications: true,
      orderAlerts: true,
      paymentAlerts: true,
    };
  }

  async updateNotificationSettings(userId: string, dto: NotificationSettingsDTO) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error('User not found in MongoDB Atlas');
    }

    return {
      userId: String(user._id),
      emailNotifications: dto.emailNotifications ?? true,
      smsNotifications: dto.smsNotifications ?? true,
      orderAlerts: dto.orderAlerts ?? true,
      paymentAlerts: dto.paymentAlerts ?? true,
      message: 'Notification preferences updated successfully',
    };
  }
}

export const profileService = new ProfileService();
