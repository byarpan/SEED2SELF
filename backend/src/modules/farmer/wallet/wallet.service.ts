import { WalletRepository, walletRepository } from './wallet.repository.js';
import { BankAccountDTO } from './dto/wallet.dto.js';
import { WalletDashboardResponse, EscrowItemResponse } from './interfaces/wallet.interface.js';

export class WalletService {
  constructor(private repository: WalletRepository = walletRepository) {}

  async getDashboard(userId: string): Promise<WalletDashboardResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const wallet = await this.repository.findOrCreateWallet(user);
    const bankAccount = await this.repository.findBankAccountByUserId(user);
    const financialSummary = await this.getFinancialSummary(userId);
    const escrowDetails = await this.getEscrowDetails(userId);
    const revenueByCrop = await this.repository.getCropRevenueAnalytics(user);

    return {
      wallet: {
        id: wallet._id.toString(),
        balance: wallet.balance,
        totalRevenue: wallet.totalRevenue,
        pendingEscrow: escrowDetails.totalLockedAmount,
        withdrawn: wallet.withdrawn,
        availableBalance: wallet.balance,
        withdrawableAmount: wallet.balance,
      },
      bankAccount: bankAccount ? bankAccount.toObject() : null,
      financialSummary,
      totalEarnings: wallet.totalRevenue || financialSummary.lifetimeEarnings,
      moneyInEscrow: escrowDetails,
      revenueByCrop,
    };
  }

  async withdrawFunds(userId: string, amount: number) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    if (!amount || amount <= 0) {
      throw new Error('Withdrawal amount must be a positive number greater than 0.');
    }

    const bankAccount = await this.repository.findBankAccountByUserId(user);
    if (!bankAccount) {
      throw new Error('Please connect a settlement bank account before requesting a withdrawal.');
    }

    const wallet = await this.repository.findOrCreateWallet(user);

    if (amount > wallet.balance) {
      throw new Error(`Insufficient wallet balance. (Available: ₹${wallet.balance.toLocaleString('en-IN')}, Requested: ₹${amount.toLocaleString('en-IN')})`);
    }

    // Deduct balance and update withdrawn total
    const updatedWallet = await this.repository.updateWallet(wallet._id.toString(), {
      balance: wallet.balance - amount,
      withdrawn: wallet.withdrawn + amount,
    });

    const txnId = `TXN-${Date.now()}`;

    // Create Wallet Transaction Record in wallettransactions collection
    const transaction = await this.repository.createWalletTransaction({
      transactionId: txnId,
      userId: user._id,
      title: 'Wallet Withdrawal to Bank',
      productName: 'Bank Settlement Payout',
      counterparty: bankAccount.bankName,
      counterpartyRole: 'Farmer',
      amount: `-₹${amount.toLocaleString('en-IN')}`,
      rawAmount: amount,
      type: 'WITHDRAWAL',
      status: 'Completed',
      bankName: bankAccount.bankName,
    });

    // Send Notification
    try {
      const { notificationService } = await import('../../notifications/notification.service.js');
      await notificationService.createNotification({
        userId: user._id.toString(),
        role: 'FARMER',
        title: 'Withdrawal Successful',
        message: `₹${amount.toLocaleString('en-IN')} has been transferred to your ${bankAccount.bankName} account (${bankAccount.accountNumber.slice(-4)})`,
        notificationType: 'PAYMENT',
        referenceType: 'PAYMENT',
        referenceId: transaction._id.toString(),
        clickDestination: '/farmer/farmerHub/wallet',
      });
    } catch (err) {
      console.warn('Failed to send withdrawal notification', err);
    }

    return {
      message: 'Withdrawal request processed successfully',
      transactionId: txnId,
      amountWithdrawn: amount,
      remainingBalance: updatedWallet?.balance || 0,
      bankAccount: {
        bankName: bankAccount.bankName,
        accountNumber: bankAccount.accountNumber,
      },
    };
  }

  async getBankAccount(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }
    const bankAccount = await this.repository.findBankAccountByUserId(user);
    return bankAccount ? bankAccount.toObject() : null;
  }

  async updateBankAccount(userId: string, dto: BankAccountDTO) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }
    const bankAccount = await this.repository.upsertBankAccount(user, dto);
    return bankAccount;
  }

  async getFinancialSummary(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const now = new Date();

    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const [lifetimePayments, yearlyPayments, monthlyPayments, weeklyPayments] = await Promise.all([
      this.repository.getReleasedPayments(user),
      this.repository.getReleasedPayments(user, startOfYear),
      this.repository.getReleasedPayments(user, startOfMonth),
      this.repository.getReleasedPayments(user, startOfWeek),
    ]);

    const sumPayments = (payments: any[]) => payments.reduce((sum, p) => sum + (p.amount || 0), 0);

    return {
      lifetimeEarnings: sumPayments(lifetimePayments),
      yearlyEarnings: sumPayments(yearlyPayments),
      monthlyEarnings: sumPayments(monthlyPayments),
      weeklyEarnings: sumPayments(weeklyPayments),
    };
  }

  async getEscrowDetails(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      return { totalLockedAmount: 0, activeEscrowCount: 0, escrowItems: [] };
    }

    const activeOrders = await this.repository.getActiveEscrowOrders(user);

    const escrowItems: EscrowItemResponse[] = activeOrders.map((order) => ({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      cropName: order.cropName,
      batchNumber: order.batchNumber,
      quantityKg: order.quantityKg,
      buyerName: order.buyerName,
      deliveryStatus: order.deliveryStatus,
      lockedAmount: order.totalAmount,
    }));

    const totalLockedAmount = escrowItems.reduce((sum, item) => sum + item.lockedAmount, 0);

    return {
      totalLockedAmount,
      activeEscrowCount: escrowItems.length,
      escrowItems,
    };
  }

  async getCropRevenueAnalytics(userId: string) {
    const user = await this.repository.findUserById(userId);
    if (!user) return [];
    return this.repository.getCropRevenueAnalytics(user);
  }
}

export const walletService = new WalletService();
