import { InvoicesRepository, invoicesRepository } from './invoices.repository.js';
import { InvoiceQueryDTO } from './dto/invoices.dto.js';
import { InvoiceListItemResponse, InvoiceDetailsResponse } from './interfaces/invoices.interface.js';
import { generateInvoicePdfBuffer } from '../../../shared/utils/pdf.util.js';

export class InvoicesService {
  constructor(private repository: InvoicesRepository = invoicesRepository) {}

  /**
   * Strictly READ-ONLY operation: Retrieves invoice list for farmer.
   */
  async getInvoiceList(farmerId: string, query: InvoiceQueryDTO): Promise<InvoiceListItemResponse[]> {
    const invoices = await this.repository.findInvoicesForFarmer(farmerId, query.search, query.category);

    return invoices.map((inv) => {
      const orderObj = inv.orderId && typeof inv.orderId === 'object' ? inv.orderId : null;
      const orderIdStr = orderObj ? orderObj._id.toString() : (inv.orderId ? inv.orderId.toString() : '');
      const orderNumberStr = orderObj?.orderNumber || 'N/A';

      return {
        id: inv._id.toString(),
        invoiceId: inv.invoiceId,
        orderId: orderIdStr,
        orderNumber: orderNumberStr,
        batchReference: inv.batchReference,
        buyerName: inv.buyerName,
        sellerName: inv.sellerName,
        items: inv.items || [],
        totalAmount: inv.totalAmount,
        paymentStatus: inv.paymentStatus,
        invoiceType: inv.invoiceType,
        generatedAt: inv.generatedAt,
        downloadUrl: `/api/v1/farmer/invoices/${inv._id}/download`,
      };
    });
  }

  /**
   * Strictly READ-ONLY operation: Retrieves invoice details by ID.
   */
  async getInvoiceDetails(farmerId: string, id: string): Promise<InvoiceDetailsResponse> {
    const inv = await this.repository.findInvoiceById(id, farmerId);
    if (!inv) {
      throw new Error('Invoice record not found');
    }

    const orderObj = inv.orderId && typeof inv.orderId === 'object' ? inv.orderId : null;
    const orderIdStr = orderObj ? orderObj._id.toString() : (inv.orderId ? inv.orderId.toString() : '');
    const orderNumberStr = orderObj?.orderNumber || 'N/A';

    return {
      id: inv._id.toString(),
      invoiceId: inv.invoiceId,
      orderId: orderIdStr,
      orderNumber: orderNumberStr,
      paymentId: inv.paymentId ? inv.paymentId.toString() : undefined,
      batchReference: inv.batchReference,
      buyerName: inv.buyerName,
      sellerName: inv.sellerName,
      items: inv.items || [],
      totalAmount: inv.totalAmount,
      paymentStatus: inv.paymentStatus,
      invoiceType: inv.invoiceType,
      generatedAt: inv.generatedAt,
      createdAt: inv.createdAt,
      updatedAt: inv.updatedAt,
      downloadUrl: `/api/v1/farmer/invoices/${inv._id}/download`,
    };
  }

  /**
   * Strictly READ-ONLY operation: Retrieves PDF document stream/buffer for an existing invoice without modifying the database.
   */
  async downloadInvoice(farmerId: string, id: string): Promise<{ filename: string; buffer: Buffer }> {
    const inv = await this.repository.findInvoiceById(id, farmerId);
    if (!inv) {
      throw new Error('Invoice record not found');
    }

    const orderObj = inv.orderId && typeof inv.orderId === 'object' ? inv.orderId : null;
    const orderNumberStr = orderObj?.orderNumber || 'N/A';

    const pdfBuffer = generateInvoicePdfBuffer({
      invoiceId: inv.invoiceId,
      orderNumber: orderNumberStr,
      batchReference: inv.batchReference,
      buyerName: inv.buyerName,
      sellerName: inv.sellerName,
      totalAmount: inv.totalAmount,
      paymentStatus: inv.paymentStatus,
      generatedAt: inv.generatedAt,
      items: inv.items || [],
    });

    return {
      filename: `${inv.invoiceId}.pdf`,
      buffer: pdfBuffer,
    };
  }
}

export const invoicesService = new InvoicesService();
