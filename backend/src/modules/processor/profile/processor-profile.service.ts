import { ProcessorProfileRepository, processorProfileRepository } from './processor-profile.repository.js';
import {
  RegisterProcessorDTO,
  UpdateBasicInfoDTO,
  UpdateProcessorAddressDTO,
  UpdateProcessorKYCDTO,
  AddReviewDTO,
} from './dto/processor-profile.dto.js';
import { ProcessorFullProfileResponse } from './interfaces/processor-profile.interface.js';
import { generateSequenceId } from '../../../shared/helpers/sequence.helper.js';
import { KYCVerificationStatus } from '../../../shared/enums/KYCVerificationStatus.js';

export class ProcessorProfileService {
  constructor(private repository: ProcessorProfileRepository = processorProfileRepository) {}

  async registerProcessor(dto: RegisterProcessorDTO) {
    const existingEmail = await this.repository.findUserByIdOrProcessorId(dto.email);
    if (existingEmail) {
      throw new Error('User with this email already exists.');
    }

    const processorId = await generateSequenceId('PRC');

    const newUser = await this.repository.createUser({
      processorId,
      role: 'PROCESSOR',
      fullName: dto.fullName,
      email: dto.email.toLowerCase().trim(),
      phone: dto.phone.trim(),
      verificationStatus: KYCVerificationStatus.PENDING,
      averageRating: 0,
      reviewCount: 0,
    });

    return {
      message: 'Processor registered successfully',
      user: {
        _id: newUser._id,
        processorId: newUser.processorId,
        role: newUser.role,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        verificationStatus: newUser.verificationStatus,
        createdAt: newUser.createdAt,
      },
    };
  }

  async getProfile(identifier: string): Promise<ProcessorFullProfileResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const addressDoc = await this.repository.findAddressByUserId(String(user._id));
    const kycDoc = await this.repository.findKYCByUserId(String(user._id));
    const reviewDocs = await this.repository.findReviewsByTargetUserId(String(user._id));

    const address = addressDoc
      ? {
          addressLine: addressDoc.addressLine || '',
          village: addressDoc.village || '',
          district: addressDoc.district || '',
          state: addressDoc.state || '',
          pinCode: addressDoc.pinCode || '',
          country: addressDoc.country || 'India',
        }
      : {
          addressLine: '',
          village: '',
          district: '',
          state: '',
          pinCode: '',
          country: '',
        };

    const kyc = kycDoc
      ? {
          documentType: kycDoc.documentType || 'AADHAAR',
          aadhaarNumber: kycDoc.aadhaarNumber || '',
          frontImage: kycDoc.frontImage || '',
          backImage: kycDoc.backImage || '',
          verificationStatus: kycDoc.verificationStatus || KYCVerificationStatus.PENDING,
        }
      : {
          documentType: 'AADHAAR',
          aadhaarNumber: '',
          frontImage: '',
          backImage: '',
          verificationStatus: user.verificationStatus || KYCVerificationStatus.PENDING,
        };

    const formattedReviews = reviewDocs.map((r: any) => ({
      id: String(r._id),
      reviewerId: String(r.reviewerId?._id || r.reviewerId),
      reviewerName: r.reviewerId?.fullName || 'Anonymous',
      reviewerPhoto: r.reviewerId?.profilePhoto || '',
      rating: r.rating,
      comment: r.comment || '',
      createdAt: r.createdAt,
    }));

    const reviewCount = user.reviewCount || 0;
    const averageRating = user.averageRating || 0;

    return {
      header: {
        profilePhoto: user.profilePhoto || '',
        fullName: user.fullName,
        role: user.role,
        processorId: user.processorId || '',
        averageRating,
        reviewCount,
        reviewStatusText: reviewCount > 0 ? `${averageRating} (${reviewCount} reviews)` : 'No reviews yet',
        verificationStatus: user.verificationStatus || KYCVerificationStatus.PENDING,
      },
      basicInfo: {
        fullName: user.fullName,
        phone: user.phone,
        email: user.email || '',
        gender: user.gender || '',
        dateOfBirth: user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : '',
        processorId: user.processorId || '',
      },
      address,
      kyc,
      reviews: {
        averageRating,
        reviewCount,
        reviewMessage: reviewCount > 0 ? `${reviewCount} reviews received.` : 'No reviews received yet.',
        reviews: formattedReviews,
      },
      raw: {
        user: user.toObject(),
        address: addressDoc ? addressDoc.toObject() : null,
        kyc: kycDoc ? kycDoc.toObject() : null,
      },
    };
  }

  async updateBasicInfo(identifier: string, dto: UpdateBasicInfoDTO) {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const updatePayload: any = {};
    if (dto.fullName !== undefined) updatePayload.fullName = dto.fullName.trim();
    if (dto.phone !== undefined) updatePayload.phone = dto.phone.trim();
    if (dto.gender !== undefined) updatePayload.gender = dto.gender;
    if (dto.profilePhoto !== undefined) updatePayload.profilePhoto = dto.profilePhoto;
    if (dto.dateOfBirth !== undefined) {
      updatePayload.dateOfBirth = dto.dateOfBirth ? new Date(dto.dateOfBirth) : null;
    }

    const updatedUser = await this.repository.updateUser(String(user._id), updatePayload);
    return this.getProfile(String(updatedUser!._id));
  }

  async updateAddress(identifier: string, dto: UpdateProcessorAddressDTO) {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const address = await this.repository.upsertAddress(String(user._id), dto);
    await this.repository.updateUser(String(user._id), { addressId: address._id });

    return address;
  }

  async updateKYC(identifier: string, dto: UpdateProcessorKYCDTO) {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const kyc = await this.repository.upsertKYC(String(user._id), dto);
    await this.repository.updateUser(String(user._id), {
      kycId: kyc._id,
      verificationStatus: KYCVerificationStatus.PENDING,
    });

    return kyc;
  }

  async addReview(processorIdentifier: string, dto: AddReviewDTO) {
    const processor = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!processor) {
      throw new Error('Processor not found');
    }

    if (String(processor._id) === String(dto.reviewerId)) {
      throw new Error('Processor cannot review their own profile.');
    }

    const reviewer = await this.repository.findUserByIdOrProcessorId(dto.reviewerId);
    if (!reviewer) {
      throw new Error('Reviewer user not found');
    }

    const review = await this.repository.createReview({
      targetUserId: String(processor._id),
      reviewerId: String(reviewer._id),
      rating: dto.rating,
      comment: dto.comment,
    });

    await this.repository.recalculateRatings(String(processor._id));

    return review;
  }
}

export const processorProfileService = new ProcessorProfileService();
