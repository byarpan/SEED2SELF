import mongoose from 'mongoose';
import User, { IUser } from '../../../shared/models/User.js';
import BankAccount, { IBankAccount } from '../../../shared/models/BankAccount.js';
import Order, { IOrder } from '../../../shared/models/Order.js';
import Payment, { IPayment } from '../../../shared/models/Payment.js';
import Escrow, { IEscrow } from '../../../shared/models/Escrow.js';
import Shipment from '../../../shared/models/Shipment.js';

export class ProcessorWalletTransactionsRepository {
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

  async findOrdersByUserId(userId: string): Promise<IOrder[]> {
    return Order.find({
      $or: [{ processorId: userId }, { farmerId: userId }],
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  async findPaymentsByFarmerId(userId: string): Promise<IPayment[]> {
    return Payment.find({ farmerId: userId }).sort({ createdAt: -1 }).exec();
  }

  async findEscrowsByUserId(userId: string): Promise<IEscrow[]> {
    return Escrow.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async findShipmentsByProcessorId(userId: string) {
    return Shipment.find({
      $or: [{ processorId: userId }, { senderId: userId }, { receiverId: userId }],
    })
      .sort({ createdAt: -1 })
      .exec();
  }
}

export const processorWalletTransactionsRepository = new ProcessorWalletTransactionsRepository();
