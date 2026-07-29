export interface BankAccountDTO {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchLocation: string;
}

export type FinancialTimeframe = 'LIFETIME' | 'YEARLY' | 'MONTHLY' | 'WEEKLY';
