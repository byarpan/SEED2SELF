import mongoose from 'mongoose';
import Wallet, { IWallet } from '../../../shared/models/Wallet.js';
import WalletTransaction, { IWalletTransaction } from '../../../shared/models/WalletTransaction.js';
import BankAccount, { IBankAccount } from '../../../shared/models/BankAccount.js';
import Order, { IOrder } from '../../../shared/models/Order.js';
import Payment, { IPayment } from '../../../shared/models/Payment.js';
import User, { IUser } from '../../../shared/models/User.js';
import { BankAccountDTO } from './dto/wallet.dto.js';
import { CropRevenueAnalytics } from './interfaces/wallet.interface.js';

import { resolveUser } from '../../../shared/utils/userResolver.js';

export class WalletRepository {
  async findUserById(userId: string): Promise<IUser | null> {
    return resolveUser(userId);
  }

  async findOrCreateWallet(user: IUser): Promise<IWallet> {
    let wallet = await Wallet.findOne({ farmerId: user._id }).exec();
    if (!wallet) {
      wallet = await Wallet.create({
        farmerId: user._id,
        balance: 0,
        totalRevenue: 0,
        pendingEscrow: 0,
        withdrawn: 0,
      });
    }
    return wallet;
  }

  async updateWallet(walletId: string, updateData: Partial<IWallet>): Promise<IWallet | null> {
    return Wallet.findByIdAndUpdate(walletId, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async createWalletTransaction(transactionData: Partial<IWalletTransaction>): Promise<IWalletTransaction> {
    const txn = new WalletTransaction(transactionData);
    return txn.save();
  }

  async findBankAccountByUserId(user: IUser): Promise<IBankAccount | null> {
    return BankAccount.findOne({ userId: user._id }).exec();
  }

  async upsertBankAccount(user: IUser, data: BankAccountDTO): Promise<IBankAccount> {
    return BankAccount.findOneAndUpdate(
      { userId: user._id },
      { $set: { userId: user._id, ...data, isVerified: true } },
      { new: true, upsert: true, runValidators: true }
    ).exec();
  }

  async getReleasedPayments(user: IUser, startDate?: Date): Promise<IPayment[]> {
    const query: any = {
      farmerId: user._id,
      escrowStatus: 'RELEASED',
    };

    if (startDate) {
      query.releasedAt = { $gte: startDate };
    }

    return Payment.find(query).exec();
  }

  async getActiveEscrowOrders(user: IUser): Promise<IOrder[]> {
    return Order.find({
      farmerId: user._id,
      escrowStatus: 'LOCKED',
    }).exec();
  }

  async getCropRevenueAnalytics(user: IUser): Promise<CropRevenueAnalytics[]> {
    const pipeline: any[] = [
      {
        $match: {
          farmerId: user._id,
          escrowStatus: 'RELEASED',
        },
      },
      {
        $group: {
          _id: {
            cropName: '$cropName',
            variety: { $ifNull: ['$variety', 'Standard'] },
          },
          batchSet: { $addToSet: '$batchNumber' },
          totalQuantity: { $sum: '$quantityKg' },
          totalRevenue: { $sum: '$totalAmount' },
        },
      },
      {
        $group: {
          _id: '$_id.cropName',
          batches: { $push: '$batchSet' },
          totalQuantitySold: { $sum: '$totalQuantity' },
          totalRevenue: { $sum: '$totalRevenue' },
          varietyBreakdown: {
            $push: {
              varietyName: '$_id.variety',
              totalQuantitySold: '$totalQuantity',
              totalRevenue: '$totalRevenue',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          cropName: '$_id',
          totalBatchesSold: {
            $size: {
              $reduce: {
                input: '$batches',
                initialValue: [],
                in: { $setUnion: ['$$value', '$$this'] },
              },
            },
          },
          totalQuantitySold: 1,
          totalRevenue: 1,
          varietyBreakdown: 1,
        },
      },
    ];

    return Order.aggregate(pipeline).exec();
  }
}

export const walletRepository = new WalletRepository();
