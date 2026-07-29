export type TransactionType = 'BANK_CREDIT' | 'BANK_DEBIT' | 'ESCROW_LOCK';
export type TransactionDirection = 'CREDIT' | 'DEBIT' | 'LOCKED';

export interface TransferDetails {
  transactionId: string;
  utrReference: string;
  connectedBankAccount: string;
  transferredAmount: string;
  rawTransferredAmount: number;
  transactionDirection: TransactionDirection;
}

export interface WalletTransactionItem {
  id: string;
  transactionId: string;
  title: string;
  productName: string;
  partnerName: string;
  partnerRole: 'Farmer' | 'Distributor' | 'Processor';
  partnerUpi?: string;
  orderId: string;
  amount: string;
  rawAmount: number;
  date: string;
  time: string;
  timestamp: Date;
  transactionType: TransactionType;
  transactionTypeLabel: 'Bank Credit' | 'Bank Debit' | 'Escrow Lock';
  transactionStatus: string;
  transferDetails: TransferDetails;
}

export interface WalletTransactionListResponse {
  totalCount: number;
  filter: string;
  search: string;
  transactions: WalletTransactionItem[];
}
