import { ProcessorWalletRepository, processorWalletRepository } from './wallet.repository.js';
import { UpdateBankAccountDTO, AddEscrowItemDTO, AddTransactionDTO } from './dto/wallet.dto.js';
import {
  ProcessorWalletDashboardResponse,
  BankAccountResponse,
  EscrowDetailsResponse,
  ProcessedProductAnalyticsResponse,
  FinancialSummaryMetrics,
  FinancialSummaryItem,
} from './interfaces/wallet.interface.js';

export class ProcessorWalletService {
  constructor(private repository: ProcessorWalletRepository = processorWalletRepository) {}

  private formatCurrency(amount: number): string {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }

  private maskAccountNumber(accountNo: string): string {
    if (!accountNo || accountNo.length < 4) return accountNo;
    return `•••• •••• ${accountNo.slice(-4)}`;
  }

  private getDefaultSummaryMetrics(): FinancialSummaryMetrics {
    return {
      LIFETIME: {
        revenue: '₹ 12,80,000',
        rawRevenue: 1280000,
        investment: '₹ 8,45,000',
        rawInvestment: 845000,
        escrow: '₹ 2,25,000',
        rawEscrow: 225000,
        activeEscrows: 4,
      },
      YEARLY: {
        revenue: '₹ 9,50,000',
        rawRevenue: 950000,
        investment: '₹ 6,20,000',
        rawInvestment: 620000,
        escrow: '₹ 2,25,000',
        rawEscrow: 225000,
        activeEscrows: 4,
      },
      MONTHLY: {
        revenue: '₹ 2,40,000',
        rawRevenue: 240000,
        investment: '₹ 1,75,000',
        rawInvestment: 175000,
        escrow: '₹ 1,25,000',
        rawEscrow: 125000,
        activeEscrows: 2,
      },
      WEEKLY: {
        revenue: '₹ 65,000',
        rawRevenue: 65000,
        investment: '₹ 45,000',
        rawInvestment: 45000,
        escrow: '₹ 60,000',
        rawEscrow: 60000,
        activeEscrows: 1,
      },
    };
  }

  private getDefaultEscrowItems() {
    return [
      {
        id: 'ESC-PRC-901',
        cropName: 'Organic Basmati Paddy (Raw)',
        cropImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop&q=80',
        batchNumber: 'BATCH-FRM-1024',
        quantity: '5,000 kg',
        supplier: 'AgriTrans Cold-Chain (Distributor)',
        escrowAmount: '₹ 1,25,000',
        rawAmount: 125000,
        orderStatus: 'In Transit - Cargo Delivery Pending',
        orderId: 'ORD-PRC-2026-001',
      },
      {
        id: 'ESC-PRC-902',
        cropName: 'Raw Alphonso Mangoes',
        cropImage: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=150&auto=format&fit=crop&q=80',
        batchNumber: 'BATCH-FRM-0891',
        quantity: '2,000 kg',
        supplier: 'GreenLogistics Express (Distributor)',
        escrowAmount: '₹ 60,000',
        rawAmount: 60000,
        orderStatus: 'Quality Inspection Ongoing',
        orderId: 'ORD-PRC-2026-003',
      },
      {
        id: 'ESC-PRC-903',
        cropName: 'Sharbati Wheat Grains',
        cropImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
        batchNumber: 'BATCH-FRM-0712',
        quantity: '1,500 kg',
        supplier: 'Apex Cargo Logistics (Distributor)',
        escrowAmount: '₹ 40,000',
        rawAmount: 40000,
        orderStatus: 'Distributor Dispatched Cargo',
        orderId: 'ORD-PRC-2026-007',
      },
    ];
  }

  private getDefaultProducts(): ProcessedProductAnalyticsResponse[] {
    return [
      {
        name: 'Rice',
        image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=150&auto=format&fit=crop&q=80',
        totalRevenue: '₹ 4,65,000',
        rawTotalRevenue: 465000,
        totalBatches: 14,
        variants: [
          { variantName: 'Basmati Rice', qty: '3,200 kg', earnings: '₹ 2,20,000' },
          { variantName: 'Brown Rice', qty: '2,000 kg', earnings: '₹ 1,50,000' },
          { variantName: 'Sona Masoori', qty: '1,500 kg', earnings: '₹ 95,000' },
        ],
      },
      {
        name: 'Flour',
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=150&auto=format&fit=crop&q=80',
        totalRevenue: '₹ 2,80,000',
        rawTotalRevenue: 280000,
        totalBatches: 9,
        variants: [
          { variantName: 'Whole Wheat Flour (Atta)', qty: '4,500 kg', earnings: '₹ 1,90,000' },
          { variantName: 'Refined Wheat Flour (Maida)', qty: '2,000 kg', earnings: '₹ 90,000' },
        ],
      },
      {
        name: 'Mango Pulp',
        image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=150&auto=format&fit=crop&q=80',
        totalRevenue: '₹ 3,75,000',
        rawTotalRevenue: 375000,
        totalBatches: 6,
        variants: [
          { variantName: 'Aphonso Pulp (Export Grade)', qty: '1,800 L', earnings: '₹ 2,55,000' },
          { variantName: 'Kesar Mango Pulp', qty: '1,000 L', earnings: '₹ 1,20,000' },
        ],
      },
    ];
  }

  async getWalletDashboard(
    identifier: string,
    timeframe: 'LIFETIME' | 'YEARLY' | 'MONTHLY' | 'WEEKLY' = 'MONTHLY'
  ): Promise<ProcessorWalletDashboardResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const bankDoc = await this.repository.findBankAccountByUserId(String(user._id));
    const bankAccount: BankAccountResponse | null = bankDoc
      ? {
          id: String(bankDoc._id),
          bankName: bankDoc.bankName,
          accountHolderName: bankDoc.accountHolderName,
          accountNumber: bankDoc.accountNumber,
          maskedAccountNumber: this.maskAccountNumber(bankDoc.accountNumber),
          ifscCode: bankDoc.ifscCode,
          branchLocation: bankDoc.branchLocation,
          isVerified: bankDoc.isVerified,
        }
      : {
          bankName: 'HDFC Bank Ltd',
          accountHolderName: user.fullName || 'Processor Business Account',
          accountNumber: '50200012349012',
          maskedAccountNumber: '•••• •••• 9012',
          ifscCode: 'HDFC0001234',
          branchLocation: 'Berhampore Central Branch',
          isVerified: true,
        };

    const escrowDocs = await this.repository.findEscrowsByUserId(String(user._id));
    const escrowItems =
      escrowDocs.length > 0
        ? escrowDocs.map((item) => ({
            id: item.escrowId || String(item._id),
            cropName: item.cropName,
            cropImage: item.cropImage || '',
            batchNumber: item.batchNumber,
            quantity: item.quantity,
            supplier: item.supplier,
            escrowAmount: item.escrowAmount,
            rawAmount: item.rawAmount,
            orderStatus: item.orderStatus,
            orderId: item.orderId,
          }))
        : this.getDefaultEscrowItems();

    const rawTotalEscrow = escrowItems.reduce((acc, item) => acc + item.rawAmount, 0);

    const summaryMetrics = this.getDefaultSummaryMetrics();
    const currentMetrics: FinancialSummaryItem = summaryMetrics[timeframe] || summaryMetrics.MONTHLY;

    const productDocs = await this.repository.findProductAnalyticsByUserId(String(user._id));
    const processedProducts: ProcessedProductAnalyticsResponse[] =
      productDocs.length > 0
        ? productDocs.map((p) => ({
            id: String(p._id),
            name: p.name,
            image: p.image || '',
            totalRevenue: p.totalRevenue,
            rawTotalRevenue: p.rawTotalRevenue,
            totalBatches: p.totalBatches,
            variants: p.variants.map((v) => ({
              variantName: v.variantName,
              qty: v.qty,
              earnings: v.earnings,
            })),
          }))
        : this.getDefaultProducts();

    return {
      bankAccount,
      selectedTimeframe: timeframe,
      currentMetrics,
      summaryMetrics,
      escrowDetails: {
        totalLockedAmount: this.formatCurrency(rawTotalEscrow),
        rawTotalLockedAmount: rawTotalEscrow,
        activeEscrows: escrowItems.length,
        escrowItems,
      },
      processedProducts,
    };
  }

  async getBankAccount(identifier: string): Promise<BankAccountResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const bankDoc = await this.repository.findBankAccountByUserId(String(user._id));
    if (!bankDoc) {
      return {
        bankName: 'HDFC Bank Ltd',
        accountHolderName: user.fullName || 'Corporate Processor Account',
        accountNumber: '50200012349012',
        maskedAccountNumber: '•••• •••• 9012',
        ifscCode: 'HDFC0001234',
        branchLocation: 'Berhampore Central Branch',
        isVerified: true,
      };
    }

    return {
      id: String(bankDoc._id),
      bankName: bankDoc.bankName,
      accountHolderName: bankDoc.accountHolderName,
      accountNumber: bankDoc.accountNumber,
      maskedAccountNumber: this.maskAccountNumber(bankDoc.accountNumber),
      ifscCode: bankDoc.ifscCode,
      branchLocation: bankDoc.branchLocation,
      isVerified: bankDoc.isVerified,
    };
  }

  async updateBankAccount(identifier: string, dto: UpdateBankAccountDTO): Promise<BankAccountResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const savedBank = await this.repository.upsertBankAccount(String(user._id), dto);

    return {
      id: String(savedBank._id),
      bankName: savedBank.bankName,
      accountHolderName: savedBank.accountHolderName,
      accountNumber: savedBank.accountNumber,
      maskedAccountNumber: this.maskAccountNumber(savedBank.accountNumber),
      ifscCode: savedBank.ifscCode,
      branchLocation: savedBank.branchLocation,
      isVerified: savedBank.isVerified,
    };
  }

  async getEscrowDetails(identifier: string): Promise<EscrowDetailsResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const escrowDocs = await this.repository.findEscrowsByUserId(String(user._id));
    const escrowItems =
      escrowDocs.length > 0
        ? escrowDocs.map((item) => ({
            id: item.escrowId || String(item._id),
            cropName: item.cropName,
            cropImage: item.cropImage || '',
            batchNumber: item.batchNumber,
            quantity: item.quantity,
            supplier: item.supplier,
            escrowAmount: item.escrowAmount,
            rawAmount: item.rawAmount,
            orderStatus: item.orderStatus,
            orderId: item.orderId,
          }))
        : this.getDefaultEscrowItems();

    const rawTotalLockedAmount = escrowItems.reduce((acc, item) => acc + item.rawAmount, 0);

    return {
      totalLockedAmount: this.formatCurrency(rawTotalLockedAmount),
      rawTotalLockedAmount,
      activeEscrows: escrowItems.length,
      escrowItems,
    };
  }

  async addEscrowItem(identifier: string, dto: AddEscrowItemDTO) {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const escrow = await this.repository.createEscrowItem(
      String(user._id),
      user.processorId,
      dto
    );
    return escrow;
  }

  async getTransactions(identifier: string) {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const transactions = await this.repository.findTransactionsByUserId(String(user._id));
    return transactions;
  }

  async addTransaction(identifier: string, dto: AddTransactionDTO) {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const transaction = await this.repository.createTransaction(
      String(user._id),
      user.processorId,
      dto
    );
    return transaction;
  }

  async getProductAnalytics(identifier: string): Promise<ProcessedProductAnalyticsResponse[]> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor not found');
    }

    const docs = await this.repository.findProductAnalyticsByUserId(String(user._id));
    if (docs.length === 0) {
      return this.getDefaultProducts();
    }

    return docs.map((p) => ({
      id: String(p._id),
      name: p.name,
      image: p.image || '',
      totalRevenue: p.totalRevenue,
      rawTotalRevenue: p.rawTotalRevenue,
      totalBatches: p.totalBatches,
      variants: p.variants.map((v) => ({
        variantName: v.variantName,
        qty: v.qty,
        earnings: v.earnings,
      })),
    }));
  }
}

export const processorWalletService = new ProcessorWalletService();
