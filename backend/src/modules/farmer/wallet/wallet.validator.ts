import { BankAccountDTO } from './dto/wallet.dto.js';

export class WalletValidator {
  static validateBankAccount(dto: BankAccountDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.bankName || !dto.bankName.trim()) {
      errors.push('Bank name is required');
    }

    if (!dto.accountHolderName || !dto.accountHolderName.trim()) {
      errors.push('Account holder name is required');
    }

    if (!dto.accountNumber || !/^[0-9]{8,18}$/.test(dto.accountNumber.trim())) {
      errors.push('Account number must be between 8 and 18 digits');
    }

    if (!dto.ifscCode || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(dto.ifscCode.trim().toUpperCase())) {
      errors.push('Valid 11-character IFSC code is required (e.g. SBIN0001234)');
    }

    if (!dto.branchLocation || !dto.branchLocation.trim()) {
      errors.push('Branch location is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
