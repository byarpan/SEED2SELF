export interface BankAccountResponse {
  id?: string;
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  maskedAccountNumber: string;
  ifscCode: string;
  branchLocation: string;
  isVerified: boolean;
}

export interface FinancialSummaryItem {
  revenue: string;
  rawRevenue: number;
  investment: string;
  rawInvestment: number;
  escrow: string;
  rawEscrow: number;
  activeEscrows: number;
}

export interface FinancialSummaryMetrics {
  LIFETIME: FinancialSummaryItem;
  YEARLY: FinancialSummaryItem;
  MONTHLY: FinancialSummaryItem;
  WEEKLY: FinancialSummaryItem;
}

export interface EscrowItemResponse {
  id: string;
  cropName: string;
  cropImage?: string;
  batchNumber: string;
  quantity: string;
  supplier: string;
  escrowAmount: string;
  rawAmount: number;
  orderStatus: string;
  orderId: string;
}

export interface EscrowDetailsResponse {
  totalLockedAmount: string;
  rawTotalLockedAmount: number;
  activeEscrows: number;
  escrowItems: EscrowItemResponse[];
}

export interface ProductVariantAnalyticsResponse {
  variantName: string;
  qty: string;
  earnings: string;
}

export interface ProcessedProductAnalyticsResponse {
  id?: string;
  name: string;
  image?: string;
  totalRevenue: string;
  rawTotalRevenue: number;
  totalBatches: number;
  variants: ProductVariantAnalyticsResponse[];
}

export interface ProcessorWalletDashboardResponse {
  bankAccount: BankAccountResponse | null;
  selectedTimeframe: 'LIFETIME' | 'YEARLY' | 'MONTHLY' | 'WEEKLY';
  currentMetrics: FinancialSummaryItem;
  summaryMetrics: FinancialSummaryMetrics;
  escrowDetails: EscrowDetailsResponse;
  processedProducts: ProcessedProductAnalyticsResponse[];
}
