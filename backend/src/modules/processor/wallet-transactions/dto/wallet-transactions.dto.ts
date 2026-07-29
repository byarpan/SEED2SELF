export interface QueryWalletTransactionsDTO {
  search?: string;
  filter?: 'ALL' | 'BANK_CREDITS' | 'BANK_DEBITS' | 'ESCROW_LOCKS';
}
