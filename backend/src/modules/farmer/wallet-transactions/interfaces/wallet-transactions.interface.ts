export type TransactionType = 'BANK_CREDIT' | 'ESCROW_LOCK';

export interface WalletTransactionItem {
  id: string;
  transactionType: TransactionType;
  cropName: string;
  buyerName: string;
  amount: number;
  date: Date;
  orderId: string;
  orderNumber: string;
}

export interface CreditedBankAccountInfo {
  bankName: string;
  accountNumberMasked: string;
  accountHolderName: string;
  ifscCode: string;
}

export interface TransferDetails {
  transactionId: string;
  utrReference: string;
  creditedBankAccount: CreditedBankAccountInfo | null;
  transferredAmount: number;
}

export interface TransactionDetailsResponse {
  transactionId: string;
  transactionType: TransactionType;
  status: 'COMPLETED' | 'LOCKED';
  buyerName: string;
  cropName: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  transactionDate: Date;
  transferDetails: TransferDetails;
}
