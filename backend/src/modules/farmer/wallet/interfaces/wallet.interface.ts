import { IBankAccount } from '../../../../shared/models/BankAccount.js';

export interface EscrowItemResponse {
  orderId: string;
  orderNumber: string;
  cropName: string;
  batchNumber: string;
  quantityKg: number;
  buyerName: string;
  deliveryStatus: string;
  lockedAmount: number;
}

export interface VarietyRevenue {
  varietyName: string;
  totalQuantitySold: number;
  totalRevenue: number;
}

export interface CropRevenueAnalytics {
  cropName: string;
  totalBatchesSold: number;
  totalQuantitySold: number;
  totalRevenue: number;
  varietyBreakdown: VarietyRevenue[];
}

export interface WalletDashboardResponse {
  wallet?: {
    id: string;
    balance: number;
    totalRevenue: number;
    pendingEscrow: number;
    withdrawn: number;
    availableBalance: number;
    withdrawableAmount: number;
  };
  bankAccount: Partial<IBankAccount> | null;
  financialSummary: {
    lifetimeEarnings: number;
    yearlyEarnings: number;
    monthlyEarnings: number;
    weeklyEarnings: number;
  };
  totalEarnings: number;
  moneyInEscrow: {
    totalLockedAmount: number;
    activeEscrowCount: number;
    escrowItems: EscrowItemResponse[];
  };
  revenueByCrop: CropRevenueAnalytics[];
}
