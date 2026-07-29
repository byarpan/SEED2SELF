import Shipment, { IShipment } from '../../../shared/models/Shipment.js';
import Order, { IOrder } from '../../../shared/models/Order.js';
import Harvest, { IHarvest } from '../../../shared/models/Harvest.js';
import Payment, { IPayment } from '../../../shared/models/Payment.js';
import Wallet, { IWallet } from '../../../shared/models/Wallet.js';
import Invoice, { IInvoice } from '../../../shared/models/Invoice.js';
import User, { IUser } from '../../../shared/models/User.js';

export class ReportsRepository {
  async findUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId).exec();
  }

  async findShipmentsByFarmerAndDateRange(farmerId: string, startDate?: Date, endDate?: Date): Promise<IShipment[]> {
    const filter: any = { farmerId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    return Shipment.find(filter).sort({ createdAt: 1 }).exec();
  }

  async findOrdersByFarmerAndDateRange(farmerId: string, startDate?: Date, endDate?: Date): Promise<IOrder[]> {
    const filter: any = { farmerId };

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = startDate;
      if (endDate) filter.createdAt.$lte = endDate;
    }

    return Order.find(filter).sort({ createdAt: 1 }).exec();
  }

  async findPaymentsByFarmer(farmerId: string): Promise<IPayment[]> {
    return Payment.find({ farmerId }).exec();
  }

  async findWalletByFarmer(farmerId: string): Promise<IWallet | null> {
    return Wallet.findOne({ farmerId }).exec();
  }

  async findInvoicesByFarmer(farmerId: string): Promise<IInvoice[]> {
    return Invoice.find({ sellerId: farmerId }).exec();
  }

  async findHarvestsByFarmer(farmerId: string): Promise<IHarvest[]> {
    return Harvest.find({ farmerId }).exec();
  }
}

export const reportsRepository = new ReportsRepository();
