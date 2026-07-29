import mongoose from 'mongoose';
import Invoice, { IInvoice, IInvoiceItem } from '../models/Invoice.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { generateInvoiceId } from '../helpers/sequence.helper.js';

export interface CreateInvoiceParams {
  orderId: string | mongoose.Types.ObjectId;
  paymentId?: string | mongoose.Types.ObjectId;
  sellerId: string | mongoose.Types.ObjectId;
  buyerId: string | mongoose.Types.ObjectId;
  invoiceType?: 'SALES' | 'PURCHASE';
  batchReference?: string;
  items?: IInvoiceItem[];
  totalAmount?: number;
}

export class SharedInvoiceService {
  /**
   * Official Invoice Creator:
   * Called EXACTLY ONCE immediately after successful payment & escrow release.
   * Generates Invoice ID, builds Invoice document, and persists permanently into DB.
   */
  async createOfficialInvoice(params: CreateInvoiceParams): Promise<IInvoice> {
    // 1. Check if invoice already exists for this order & type to avoid duplicates
    const existingInvoice = await Invoice.findOne({
      orderId: new mongoose.Types.ObjectId(params.orderId.toString()),
      invoiceType: params.invoiceType || 'SALES',
    }).exec();

    if (existingInvoice) {
      return existingInvoice;
    }

    // 2. Fetch Order details if items/batch reference are missing
    const order = await Order.findById(params.orderId).exec();
    const seller = await User.findById(params.sellerId).exec();
    const buyer = await User.findById(params.buyerId).exec();

    const buyerName = buyer?.fullName || (order?.buyerName ? order.buyerName : 'Valued Buyer');
    const sellerName = seller?.fullName || 'Seed2Shelf Seller';
    const batchReference = params.batchReference || order?.batchNumber || `BATCH-REF-${Date.now()}`;
    
    const items: IInvoiceItem[] =
      params.items && params.items.length > 0
        ? params.items
        : order
        ? [
            {
              cropName: order.cropName,
              variety: order.variety,
              quantityKg: order.quantityKg,
              pricePerKg: order.pricePerKg,
              totalAmount: order.totalAmount,
            },
          ]
        : [];

    const totalAmount = params.totalAmount !== undefined ? params.totalAmount : order?.totalAmount || 0;

    // 3. Generate atomic unique Invoice ID (e.g., INV-SLS-2026-000001 or INV-PUR-2026-000001)
    const invoiceType = params.invoiceType || 'SALES';
    const invoiceId = await generateInvoiceId(invoiceType);

    // 4. Create and save permanent Invoice document
    const newInvoice = new Invoice({
      invoiceId,
      orderId: new mongoose.Types.ObjectId(params.orderId.toString()),
      paymentId: params.paymentId ? new mongoose.Types.ObjectId(params.paymentId.toString()) : undefined,
      sellerId: new mongoose.Types.ObjectId(params.sellerId.toString()),
      buyerId: new mongoose.Types.ObjectId(params.buyerId.toString()),
      batchReference,
      buyerName,
      sellerName,
      items,
      totalAmount,
      paymentStatus: 'PAID',
      invoiceType,
      generatedAt: new Date(),
    });

    const savedInvoice = await newInvoice.save();
    return savedInvoice;
  }
}

export const sharedInvoiceService = new SharedInvoiceService();
