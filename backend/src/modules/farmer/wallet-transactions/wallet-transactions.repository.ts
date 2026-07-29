import mongoose from 'mongoose';
import WalletTransaction, { IWalletTransaction } from '../../../shared/models/WalletTransaction.js';
import Order, { IOrder } from '../../../shared/models/Order.js';
import Payment, { IPayment } from '../../../shared/models/Payment.js';
import BankAccount, { IBankAccount } from '../../../shared/models/BankAccount.js';
import User, { IUser } from '../../../shared/models/User.js';
import { TransactionFilterType } from './dto/wallet-transactions.dto.js';

export class WalletTransactionsRepository {
  async findUserById(userId: string): Promise<IUser | null> {
    if (!userId) return null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const user = await User.findById(userId).exec();
      if (user) return user;
    }
    return User.findOne({
      $or: [
        { farmerId: userId },
        { userId: userId },
        { phone: userId },
        { email: userId.toLowerCase() },
      ],
    }).exec();
  }

  async findWalletTransactionsForFarmer(
    user: IUser,
    search?: string,
    filter?: TransactionFilterType
  ): Promise<IWalletTransaction[]> {
    const query: any = {
      userId: user._id,
    };

    if (filter && filter !== 'ALL' as any) {
      if (filter === 'BANK_CREDIT') {
        query.type = { $in: ['FARMER_PAYMENT', 'ESCROW_RELEASED', 'PAYOUT'] };
      } else if (filter === 'ESCROW_LOCK') {
        query.type = { $in: ['ESCROW', 'ESCROW_LOCKED'] };
      } else {
        query.type = filter;
      }
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { productName: searchRegex },
        { counterparty: searchRegex },
        { transactionId: searchRegex },
        { orderId: searchRegex },
      ];
    }

    return WalletTransaction.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOrdersForFarmer(
    user: IUser,
    search?: string,
    filter?: TransactionFilterType
  ): Promise<IOrder[]> {
    const query: any = {
      farmerId: user._id,
    };

    if (filter === 'BANK_CREDIT') {
      query.escrowStatus = 'RELEASED';
    } else if (filter === 'ESCROW_LOCK') {
      query.escrowStatus = 'LOCKED';
    } else {
      query.escrowStatus = { $in: ['LOCKED', 'RELEASED', 'REFUNDED'] };
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { cropName: searchRegex },
        { buyerName: searchRegex },
        { orderNumber: searchRegex },
        { batchNumber: searchRegex },
      ];
    }

    return Order.find(query).sort({ createdAt: -1 }).exec();
  }

  async findOrderById(orderId: string): Promise<IOrder | null> {
    if (mongoose.Types.ObjectId.isValid(orderId)) {
      const order = await Order.findById(orderId).exec();
      if (order) return order;
    }
    return Order.findOne({ orderNumber: orderId }).exec();
  }

  async findTransactionById(txnId: string): Promise<IWalletTransaction | null> {
    if (mongoose.Types.ObjectId.isValid(txnId)) {
      const found = await WalletTransaction.findById(txnId).exec();
      if (found) return found;
    }
    return WalletTransaction.findOne({ transactionId: txnId }).exec();
  }

  async findPaymentByOrderId(orderId: mongoose.Types.ObjectId): Promise<IPayment | null> {
    return Payment.findOne({ orderId }).exec();
  }

  async findBankAccountByUserId(user: IUser): Promise<IBankAccount | null> {
    return BankAccount.findOne({ userId: user._id }).exec();
  }
}

export const walletTransactionsRepository = new WalletTransactionsRepository();
