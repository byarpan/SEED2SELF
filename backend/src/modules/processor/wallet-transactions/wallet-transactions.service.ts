import { ProcessorWalletTransactionsRepository, processorWalletTransactionsRepository } from './wallet-transactions.repository.js';
import {
  WalletTransactionItem,
  WalletTransactionListResponse,
  TransactionType,
} from './interfaces/wallet-transactions.interface.js';

export class ProcessorWalletTransactionsService {
  constructor(
    private repository: ProcessorWalletTransactionsRepository = processorWalletTransactionsRepository
  ) {}

  private formatCurrency(amount: number): string {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }

  private getInitialTransactions(bankAccountStr: string): WalletTransactionItem[] {
    return [
      {
        id: 'TXN-PRC-90215984210982311',
        transactionId: 'TXN-PRC-90215984210982311',
        title: 'Escrow Locked - Raw Organic Paddy',
        productName: 'Organic Basmati Paddy (5,000 kg)',
        partnerName: 'AgriTrans Cold-Chain (Distributor)',
        partnerRole: 'Distributor',
        partnerUpi: 'agritrans@sbi',
        orderId: 'ORD-PRC-2026-001',
        amount: '₹ 1,25,000',
        rawAmount: 125000,
        date: '20 Jul 2026',
        time: '02:30 pm',
        timestamp: new Date('2026-07-20T14:30:00Z'),
        transactionType: 'ESCROW_LOCK',
        transactionTypeLabel: 'Escrow Lock',
        transactionStatus: 'Money Locked in Escrow',
        transferDetails: {
          transactionId: 'TXN-PRC-90215984210982311',
          utrReference: '901485392014',
          connectedBankAccount: bankAccountStr,
          transferredAmount: '₹ 1,25,000',
          rawTransferredAmount: 125000,
          transactionDirection: 'LOCKED',
        },
      },
      {
        id: 'TXN-PRC-90188219432098421',
        transactionId: 'TXN-PRC-90188219432098421',
        title: 'Raw Material Payout - Whole Wheat Grains',
        productName: 'Sharbati Wheat Grains (4,000 kg)',
        partnerName: 'Apex Cargo Logistics (Distributor)',
        partnerRole: 'Distributor',
        partnerUpi: 'apexcargo@okaxis',
        orderId: 'ORD-PRC-2026-007',
        amount: '- ₹ 95,000',
        rawAmount: 95000,
        date: '16 Jul 2026',
        time: '11:45 am',
        timestamp: new Date('2026-07-16T11:45:00Z'),
        transactionType: 'BANK_DEBIT',
        transactionTypeLabel: 'Bank Debit',
        transactionStatus: 'Transaction Successful',
        transferDetails: {
          transactionId: 'TXN-PRC-90188219432098421',
          utrReference: '901485381045',
          connectedBankAccount: bankAccountStr,
          transferredAmount: '- ₹ 95,000',
          rawTransferredAmount: 95000,
          transactionDirection: 'DEBIT',
        },
      },
      {
        id: 'TXN-PRC-90150934029341029',
        transactionId: 'TXN-PRC-90150934029341029',
        title: 'Processed Product Sales - Mango Pulp Batch #04',
        productName: 'Alphonso Mango Pulp (1,200 L)',
        partnerName: 'FreshLogistics Distro Ltd',
        partnerRole: 'Distributor',
        partnerUpi: 'freshlogistics@hdfcbank',
        orderId: 'ORD-DIST-2026-042',
        amount: '+ ₹ 1,85,000',
        rawAmount: 185000,
        date: '10 Jul 2026',
        time: '06:10 pm',
        timestamp: new Date('2026-07-10T18:10:00Z'),
        transactionType: 'BANK_CREDIT',
        transactionTypeLabel: 'Bank Credit',
        transactionStatus: 'Transaction Successful',
        transferDetails: {
          transactionId: 'TXN-PRC-90150934029341029',
          utrReference: '901485370921',
          connectedBankAccount: bankAccountStr,
          transferredAmount: '+ ₹ 1,85,000',
          rawTransferredAmount: 185000,
          transactionDirection: 'CREDIT',
        },
      },
      {
        id: 'TXN-PRC-90112837492837492',
        transactionId: 'TXN-PRC-90112837492837492',
        title: 'Raw Material Payout - Raw Alphonso Mangoes',
        productName: 'Raw Alphonso Mangoes (2,000 kg)',
        partnerName: 'GreenLogistics Express (Distributor)',
        partnerRole: 'Distributor',
        partnerUpi: 'greenlogistics@icici',
        orderId: 'ORD-PRC-2026-003',
        amount: '- ₹ 60,000',
        rawAmount: 60000,
        date: '04 Jul 2026',
        time: '10:15 am',
        timestamp: new Date('2026-07-04T10:15:00Z'),
        transactionType: 'BANK_DEBIT',
        transactionTypeLabel: 'Bank Debit',
        transactionStatus: 'Transaction Successful',
        transferDetails: {
          transactionId: 'TXN-PRC-90112837492837492',
          utrReference: '901485361289',
          connectedBankAccount: bankAccountStr,
          transferredAmount: '- ₹ 60,000',
          rawTransferredAmount: 60000,
          transactionDirection: 'DEBIT',
        },
      },
      {
        id: 'TXN-PRC-90088129304912093',
        transactionId: 'TXN-PRC-90088129304912093',
        title: 'Processed Product Sales - Basmati Rice Batch #12',
        productName: 'Premium Basmati Rice (10,000 kg)',
        partnerName: 'AgriDirect Distribution',
        partnerRole: 'Distributor',
        partnerUpi: 'agridirect@sbi',
        orderId: 'ORD-DIST-2026-081',
        amount: '+ ₹ 2,20,000',
        rawAmount: 220000,
        date: '28 Jun 2026',
        time: '04:20 pm',
        timestamp: new Date('2026-06-28T16:20:00Z'),
        transactionType: 'BANK_CREDIT',
        transactionTypeLabel: 'Bank Credit',
        transactionStatus: 'Transaction Successful',
        transferDetails: {
          transactionId: 'TXN-PRC-90088129304912093',
          utrReference: '901485350124',
          connectedBankAccount: bankAccountStr,
          transferredAmount: '+ ₹ 2,20,000',
          rawTransferredAmount: 220000,
          transactionDirection: 'CREDIT',
        },
      },
    ];
  }

  async getTransactionHistory(
    identifier: string,
    search?: string,
    filter: string = 'ALL'
  ): Promise<WalletTransactionListResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const bankDoc = await this.repository.findBankAccountByUserId(String(user._id));
    const bankAccountStr = bankDoc
      ? `${bankDoc.bankName} •••• ${bankDoc.accountNumber.slice(-4)}`
      : 'HDFC Bank Ltd •••• 9012';

    // Fetch existing records from shared DB models
    const escrows = await this.repository.findEscrowsByUserId(String(user._id));

    let transactions = this.getInitialTransactions(bankAccountStr);

    // Merge dynamic escrow records into transactions if available
    escrows.forEach((e: any) => {
      const exists = transactions.some((t) => t.orderId === e.orderId);
      if (!exists) {
        const isCredit = e.escrowType === 'DISTRIBUTOR_PURCHASE' && e.status === 'RELEASED';
        const isDebit = e.escrowType === 'FARMER_RAW_MATERIAL' && e.status === 'RELEASED';
        const type: TransactionType = isCredit
          ? 'BANK_CREDIT'
          : isDebit
          ? 'BANK_DEBIT'
          : 'ESCROW_LOCK';

        transactions.push({
          id: `TXN-${e.escrowId || Date.now()}`,
          transactionId: `TXN-${e.escrowId || Date.now()}`,
          title: isCredit
            ? `Sales Settlement - ${e.cropName}`
            : isDebit
            ? `Raw Material Payout - ${e.cropName}`
            : `Escrow Locked - ${e.cropName}`,
          productName: `${e.cropName} (${e.quantity})`,
          partnerName: e.supplier || 'Partner',
          partnerRole: isCredit || type === 'ESCROW_LOCK' ? 'Distributor' : 'Farmer',
          orderId: e.orderId,
          amount: isCredit
            ? `+ ${e.escrowAmount}`
            : isDebit
            ? `- ${e.escrowAmount}`
            : e.escrowAmount,
          rawAmount: e.rawAmount,
          date: new Date(e.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
          time: new Date(e.createdAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
          timestamp: new Date(e.createdAt),
          transactionType: type,
          transactionTypeLabel:
            type === 'BANK_CREDIT'
              ? 'Bank Credit'
              : type === 'BANK_DEBIT'
              ? 'Bank Debit'
              : 'Escrow Lock',
          transactionStatus:
            type === 'ESCROW_LOCK' ? 'Money Locked in Escrow' : 'Transaction Successful',
          transferDetails: {
            transactionId: `TXN-${e.escrowId || Date.now()}`,
            utrReference: String(100000000000 + Math.floor(Math.random() * 900000000000)),
            connectedBankAccount: bankAccountStr,
            transferredAmount: e.escrowAmount,
            rawTransferredAmount: e.rawAmount,
            transactionDirection:
              type === 'BANK_CREDIT' ? 'CREDIT' : type === 'BANK_DEBIT' ? 'DEBIT' : 'LOCKED',
          },
        });
      }
    });

    // Sort transactions newest first
    transactions.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // Apply Filter
    const normalizedFilter = filter.toUpperCase();
    if (normalizedFilter === 'BANK_CREDITS') {
      transactions = transactions.filter((t) => t.transactionType === 'BANK_CREDIT');
    } else if (normalizedFilter === 'BANK_DEBITS') {
      transactions = transactions.filter((t) => t.transactionType === 'BANK_DEBIT');
    } else if (normalizedFilter === 'ESCROW_LOCKS') {
      transactions = transactions.filter((t) => t.transactionType === 'ESCROW_LOCK');
    }

    // Apply Search Query
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      transactions = transactions.filter(
        (t) =>
          t.productName.toLowerCase().includes(q) ||
          t.partnerName.toLowerCase().includes(q) ||
          t.orderId.toLowerCase().includes(q) ||
          t.transactionId.toLowerCase().includes(q) ||
          t.title.toLowerCase().includes(q)
      );
    }

    return {
      totalCount: transactions.length,
      filter: normalizedFilter,
      search: search || '',
      transactions,
    };
  }

  async getTransactionById(
    identifier: string,
    transactionId: string
  ): Promise<WalletTransactionItem> {
    const listResponse = await this.getTransactionHistory(identifier, '', 'ALL');
    const match = listResponse.transactions.find(
      (t) =>
        t.transactionId.toLowerCase() === transactionId.toLowerCase() ||
        t.id.toLowerCase() === transactionId.toLowerCase() ||
        t.orderId.toLowerCase() === transactionId.toLowerCase()
    );

    if (!match) {
      throw new Error('Transaction details not found');
    }

    return match;
  }
}

export const processorWalletTransactionsService = new ProcessorWalletTransactionsService();
