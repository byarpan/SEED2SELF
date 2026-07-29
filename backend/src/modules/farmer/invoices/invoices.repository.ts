import mongoose from 'mongoose';
import Invoice from '../../../shared/models/Invoice.js';
import Order from '../../../shared/models/Order.js';
import { InvoiceCategory } from '../../../shared/enums/InvoiceCategory.js';

export class InvoicesRepository {
  /**
   * Strictly READ-ONLY operation: Retrieves invoices for a farmer with optional search and category filter.
   */
  async findInvoicesForFarmer(
    farmerId: string,
    search?: string,
    category: InvoiceCategory = InvoiceCategory.ALL
  ): Promise<any[]> {
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return [];
    }

    const query: any = {
      sellerId: new mongoose.Types.ObjectId(farmerId),
    };

    // Category filter
    if (category === InvoiceCategory.SALES) {
      query.invoiceType = 'SALES';
    } else if (category === InvoiceCategory.PURCHASE) {
      query.invoiceType = 'PURCHASE';
    }

    // Search filter: Invoice ID, Order ID, Batch Reference, Buyer Name
    if (search && search.trim() !== '') {
      const searchTrimmed = search.trim();
      const searchRegex = new RegExp(searchTrimmed, 'i');

      const matchingOrderFilter: any[] = [{ orderNumber: searchRegex }];
      if (mongoose.Types.ObjectId.isValid(searchTrimmed)) {
        matchingOrderFilter.push({ _id: new mongoose.Types.ObjectId(searchTrimmed) });
      }

      const matchingOrders = await Order.find({ $or: matchingOrderFilter }).select('_id').exec();
      const matchingOrderIds = matchingOrders.map((o) => o._id);

      query.$or = [
        { invoiceId: searchRegex },
        { batchReference: searchRegex },
        { buyerName: searchRegex },
        { sellerName: searchRegex },
        { orderId: { $in: matchingOrderIds } },
      ];
    }

    return Invoice.find(query)
      .populate('orderId', 'orderNumber')
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Strictly READ-ONLY operation: Finds a specific invoice by ObjectId or invoiceId for a farmer.
   */
  async findInvoiceById(id: string, farmerId: string): Promise<any | null> {
    if (!mongoose.Types.ObjectId.isValid(farmerId)) {
      return null;
    }

    const queryConditions: any[] = [{ invoiceId: id }];
    if (mongoose.Types.ObjectId.isValid(id)) {
      queryConditions.push({ _id: new mongoose.Types.ObjectId(id) });
    }

    return Invoice.findOne({
      sellerId: new mongoose.Types.ObjectId(farmerId),
      $or: queryConditions,
    })
      .populate('orderId', 'orderNumber')
      .exec();
  }
}

export const invoicesRepository = new InvoicesRepository();
