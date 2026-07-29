import mongoose from 'mongoose';
import User, { IUser } from '../../../shared/models/User.js';
import BankAccount, { IBankAccount } from '../../../shared/models/BankAccount.js';
import Escrow, { IEscrow } from '../../../shared/models/Escrow.js';
import WalletTransaction, { IWalletTransaction } from '../../../shared/models/WalletTransaction.js';
import ProcessedProductAnalytics, {
  IProcessedProductAnalytics,
} from '../../../shared/models/ProcessedProductAnalytics.js';
import { UpdateBankAccountDTO, AddEscrowItemDTO, AddTransactionDTO } from './dto/wallet.dto.js';

export class ProcessorWalletRepository {
  async findUserByIdOrProcessorId(identifier: string): Promise<IUser | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    if (isObjectId) {
      const user = await User.findById(identifier).exec();
      if (user) return user;
    }
    return User.findOne({
      $or: [
        { processorId: identifier },
        { userId: identifier },
        { email: identifier.toLowerCase() },
      ],
    }).exec();
  }

  async findBankAccountByUserId(userId: string): Promise<IBankAccount | null> {
    return BankAccount.findOne({ userId }).exec();
  }

  async upsertBankAccount(
    userId: string,
    bankData: UpdateBankAccountDTO
  ): Promise<IBankAccount> {
    return BankAccount.findOneAndUpdate(
      { userId },
      { $set: { userId, ...bankData, isVerified: true } },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }

  async findEscrowsByUserId(userId: string): Promise<IEscrow[]> {
    return Escrow.find({ userId, status: 'LOCKED' })
      .sort({ createdAt: -1 })
      .exec();
  }

  async createEscrowItem(
    userId: string,
    processorId: string | undefined,
    data: AddEscrowItemDTO
  ): Promise<IEscrow> {
    const escrowId = `ESC-PRC-${Math.floor(100 + Math.random() * 900)}`;
    const escrow = new Escrow({
      escrowId,
      userId,
      role: 'PROCESSOR',
      cropName: data.cropName,
      cropImage: data.cropImage || '',
      batchNumber: data.batchNumber,
      quantity: data.quantity,
      supplier: data.supplier,
      escrowAmount: data.escrowAmount,
      rawAmount: data.rawAmount,
      orderStatus: data.orderStatus,
      orderId: data.orderId,
      escrowType: data.escrowType || 'DISTRIBUTOR_PURCHASE',
      status: 'LOCKED',
    });
    return escrow.save();
  }

  async findTransactionsByUserId(userId: string): Promise<IWalletTransaction[]> {
    return WalletTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .exec();
  }

  async createTransaction(
    userId: string,
    processorId: string | undefined,
    data: AddTransactionDTO
  ): Promise<IWalletTransaction> {
    const transactionId = `TXN-PRC-${Date.now()}`;
    const transaction = new WalletTransaction({
      transactionId,
      userId,
      processorId,
      title: data.title,
      productName: data.productName,
      counterparty: data.counterparty,
      counterpartyRole: data.counterpartyRole || 'Distributor',
      counterpartyUpi: data.counterpartyUpi || '',
      orderId: data.orderId || '',
      amount: data.amount,
      rawAmount: data.rawAmount,
      type: data.type || 'DISTRIBUTOR',
      status: data.status || 'Transaction Successful',
      bankName: data.bankName || '',
      utr: data.utr || String(Date.now()),
      timeframe: data.timeframe || 'MONTHLY',
    });
    return transaction.save();
  }

  async findProductAnalyticsByUserId(
    userId: string
  ): Promise<IProcessedProductAnalytics[]> {
    return ProcessedProductAnalytics.find({ userId })
      .sort({ rawTotalRevenue: -1 })
      .exec();
  }

  async upsertProductAnalytics(
    userId: string,
    processorId: string | undefined,
    productData: {
      name: string;
      image?: string;
      totalRevenue: string;
      rawTotalRevenue: number;
      totalBatches: number;
      variants: Array<{
        variantName: string;
        qty: string;
        earnings: string;
        rawEarnings: number;
      }>;
    }
  ): Promise<IProcessedProductAnalytics> {
    return ProcessedProductAnalytics.findOneAndUpdate(
      { userId, name: productData.name },
      { $set: { userId, processorId, ...productData } },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }
}

export const processorWalletRepository = new ProcessorWalletRepository();
