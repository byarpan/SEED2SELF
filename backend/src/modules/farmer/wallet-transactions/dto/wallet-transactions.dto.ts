export type TransactionFilterType = 'ALL' | 'BANK_CREDIT' | 'ESCROW_LOCK';

export interface TransactionQueryDTO {
  search?: string;
  filter?: TransactionFilterType;
}
