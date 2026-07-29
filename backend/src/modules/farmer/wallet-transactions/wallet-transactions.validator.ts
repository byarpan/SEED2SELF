import { TransactionQueryDTO, TransactionFilterType } from './dto/wallet-transactions.dto.js';

export class WalletTransactionsValidator {
  static validateQuery(query: TransactionQueryDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    const validFilters: TransactionFilterType[] = ['ALL', 'BANK_CREDIT', 'ESCROW_LOCK'];
    if (query.filter && !validFilters.includes(query.filter)) {
      errors.push('Filter must be one of: ALL, BANK_CREDIT, ESCROW_LOCK');
    }

    if (query.search && typeof query.search === 'string' && query.search.trim().length > 100) {
      errors.push('Search query parameter exceeds maximum length of 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
