import mongoose from 'mongoose';
import Invoice from '../../../shared/models/Invoice.js';
import Order from '../../../shared/models/Order.js';
import User from '../../../shared/models/User.js';

export class ProcessorInvoicesRepository {
  /**
   * Strictly READ-ONLY operation: Retrieves invoices for a processor with optional search and category filter.
   * - Sales Invoices (SALES): Seller = Processor (items sold to Distributors)
   * - Purchase Invoices (PURCHASE): Buyer = Processor (items purchased from Farmers)
   */
  async findInvoicesForProcessor(
    identifier: string,
    search?: string,
    category: 'ALL' | 'SALES' | 'PURCHASE' = 'ALL'
  ): Promise<any[]> {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    let userIdObj: mongoose.Types.ObjectId | null = null;

    if (isObjectId) {
      userIdObj = new mongoose.Types.ObjectId(identifier);
    } else {
      const user = await User.findOne({
        $or: [{ processorId: identifier }, { userId: identifier }, { email: identifier.toLowerCase() }],
      }).exec();
      if (user) {
        userIdObj = user._id;
      }
    }

    if (!userIdObj) {
      return [];
    }

    const query: any = {};

    // Filter by Category
    if (category === 'SALES') {
      query.sellerId = userIdObj;
      query.invoiceType = 'SALES';
    } else if (category === 'PURCHASE') {
      query.buyerId = userIdObj;
      query.invoiceType = 'PURCHASE';
    } else {
      query.$or = [{ sellerId: userIdObj }, { buyerId: userIdObj }];
    }

    // Filter by Search (Invoice ID, Order Number, Batch Reference, Buyer/Seller Name)
    if (search && search.trim() !== '') {
      const searchTrimmed = search.trim();
      const searchRegex = new RegExp(searchTrimmed, 'i');

      const matchingOrders = await Order.find({ orderNumber: searchRegex }).select('_id').exec();
      const matchingOrderIds = matchingOrders.map((o) => o._id);

      const searchConditions: any[] = [
        { invoiceId: searchRegex },
        { batchReference: searchRegex },
        { buyerName: searchRegex },
        { sellerName: searchRegex },
        { orderId: { $in: matchingOrderIds } },
      ];

      if (query.$or) {
        query.$and = [{ $or: query.$or }, { $or: searchConditions }];
        delete query.$or;
      } else {
        query.$or = searchConditions;
      }
    }

    return Invoice.find(query)
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Strictly READ-ONLY operation: Finds a specific invoice by ObjectId or invoiceId for a processor.
   */
  async findInvoiceById(id: string, identifier: string): Promise<any | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    let userIdObj: mongoose.Types.ObjectId | null = null;

    if (isObjectId) {
      userIdObj = new mongoose.Types.ObjectId(identifier);
    } else {
      const user = await User.findOne({
        $or: [{ processorId: identifier }, { userId: identifier }],
      }).exec();
      if (user) {
        userIdObj = user._id;
      }
    }

    if (!userIdObj) {
      return null;
    }

    const queryConditions: any[] = [{ invoiceId: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryConditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    return Invoice.findOne({
      $or: [{ sellerId: userIdObj }, { buyerId: userIdObj }],
      $and: [{ $or: queryConditions }],
    })
      .populate('orderId', 'orderNumber')
      .exec();
  }
}

export const processorInvoicesRepository = new ProcessorInvoicesRepository();
