import { RegisterFarmerDTO, UpdateProfileDTO, UpdateAddressDTO, UpdateKYCDTO, BankAccountDTO } from './dto/profile.dto.js';
import { KYCVerificationStatus } from '../../../shared/enums/KYCVerificationStatus.js';

export class ProfileValidator {
  static validateRegistration(dto: RegisterFarmerDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.fullName || !dto.fullName.trim() || dto.fullName.length < 2) {
      errors.push('Full name is required and must be at least 2 characters long');
    }

    if (!dto.phone || !/^\+?[0-9]{10,15}$/.test(dto.phone.trim())) {
      errors.push('Valid phone number is required');
    }

    if (dto.email && dto.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email.trim())) {
        errors.push('Invalid email address format');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateProfileUpdate(dto: UpdateProfileDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.fullName !== undefined && (!dto.fullName.trim() || dto.fullName.length < 2)) {
      errors.push('Full name must be at least 2 characters long');
    }

    if (dto.phone !== undefined && !/^\+?[0-9]{10,15}$/.test(dto.phone)) {
      errors.push('Invalid phone number format');
    }

    if (dto.email !== undefined && dto.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(dto.email.trim())) {
        errors.push('Invalid email address format');
      }
    }

    if (dto.gender !== undefined && !['MALE', 'FEMALE', 'OTHER'].includes(dto.gender)) {
      errors.push('Gender must be MALE, FEMALE, or OTHER');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateAddressUpdate(dto: UpdateAddressDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.addressLine || !dto.addressLine.trim()) errors.push('Address line is required');
    if (!dto.village || !dto.village.trim()) errors.push('Village is required');
    if (!dto.district || !dto.district.trim()) errors.push('District is required');
    if (!dto.state || !dto.state.trim()) errors.push('State is required');
    if (!dto.pinCode || !/^[0-9]{6}$/.test(dto.pinCode.trim())) errors.push('Pin Code must be a 6-digit number');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateKYCUpdate(dto: UpdateKYCDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.aadhaarNumber || !/^[0-9]{12}$/.test(dto.aadhaarNumber.trim())) {
      errors.push('Aadhaar number must be a valid 12-digit number');
    }

    if (!dto.frontImage || !dto.frontImage.trim()) {
      errors.push('Aadhaar front image is required');
    }

    if (!dto.backImage || !dto.backImage.trim()) {
      errors.push('Aadhaar back image is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateBankAccount(dto: BankAccountDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.bankName || !dto.bankName.trim()) errors.push('Bank name is required');
    if (!dto.accountHolderName || !dto.accountHolderName.trim()) errors.push('Account holder name is required');
    if (!dto.accountNumber || !/^[0-9]{9,18}$/.test(dto.accountNumber.trim())) errors.push('Valid 9-18 digit account number is required');
    if (!dto.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(dto.ifscCode.trim().toUpperCase())) errors.push('Valid 11-character IFSC code is required');

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static isKYCStatusValid(status: string): boolean {
    return Object.values(KYCVerificationStatus).includes(status as KYCVerificationStatus);
  }
}
