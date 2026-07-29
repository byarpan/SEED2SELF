import mongoose from 'mongoose';
import Escrow, { IEscrow } from '../models/Escrow.js';

export interface LockEscrowParams {
  userId: string | mongoose.Types.ObjectId;
  payerId?: string | mongoose.Types.ObjectId;
  payeeId?: string | mongoose.Types.ObjectId;
  role?: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'ADMIN';
  cropName: string;
  batchNumber: string;
  quantity: string;
  supplier: string;
  escrowAmount: string;
  rawAmount: number;
  orderStatus: string;
  orderId: string;
  escrowType?: 'DISTRIBUTOR_PURCHASE' | 'FARMER_RAW_MATERIAL' | 'RETAILER_PURCHASE' | 'GENERAL';
}

export class SharedEscrowService {
  /**
   * Lock Funds inside the Escrow collection
   */
  async lockFunds(params: LockEscrowParams): Promise<IEscrow> {
    const existing = await Escrow.findOne({
      orderId: params.orderId,
      status: 'LOCKED',
    }).exec();

    if (existing) {
      return existing;
    }

    const escrowId = `ESC-${Math.floor(100000 + Math.random() * 900000)}`;

    const escrow = new Escrow({
      escrowId,
      userId: new mongoose.Types.ObjectId(params.userId.toString()),
      payerId: params.payerId ? new mongoose.Types.ObjectId(params.payerId.toString()) : undefined,
      payeeId: params.payeeId ? new mongoose.Types.ObjectId(params.payeeId.toString()) : undefined,
      role: params.role || 'PROCESSOR',
      cropName: params.cropName,
      batchNumber: params.batchNumber,
      quantity: params.quantity,
      supplier: params.supplier,
      escrowAmount: params.escrowAmount,
      rawAmount: params.rawAmount,
      orderStatus: params.orderStatus || 'Money Locked in Escrow',
      orderId: params.orderId,
      escrowType: params.escrowType || 'FARMER_RAW_MATERIAL',
      status: 'LOCKED',
    });

    return escrow.save();
  }

  /**
   * Release Escrow Funds to recipient's bank account
   */
  async releaseFunds(orderIdOrEscrowId: string): Promise<IEscrow | null> {
    return Escrow.findOneAndUpdate(
      {
        $or: [{ escrowId: orderIdOrEscrowId }, { orderId: orderIdOrEscrowId }],
        status: 'LOCKED',
      },
      {
        $set: {
          status: 'RELEASED',
          releasedAt: new Date(),
          orderStatus: 'Escrow Released to Bank Account',
        },
      },
      { new: true }
    ).exec();
  }

  /**
   * Refund Escrow Funds
   */
  async refundFunds(orderIdOrEscrowId: string): Promise<IEscrow | null> {
    return Escrow.findOneAndUpdate(
      {
        $or: [{ escrowId: orderIdOrEscrowId }, { orderId: orderIdOrEscrowId }],
        status: 'LOCKED',
      },
      {
        $set: {
          status: 'REFUNDED',
          orderStatus: 'Escrow Refunded to Buyer',
        },
      },
      { new: true }
    ).exec();
  }
}

export const sharedEscrowService = new SharedEscrowService();
