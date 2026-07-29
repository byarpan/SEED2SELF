import { ProcessorInvoicesRepository, processorInvoicesRepository } from './invoices.repository.js';
import { ProcessorInvoiceQueryDTO } from './dto/invoices.dto.js';
import { ProcessorInvoiceItemResponse } from './interfaces/invoices.interface.js';
import { generateInvoicePdfBuffer } from '../../../shared/utils/pdf.util.js';

export class ProcessorInvoicesService {
  constructor(private repository: ProcessorInvoicesRepository = processorInvoicesRepository) {}

  private formatCurrency(amount: number): string {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }

  /**
   * Strictly READ-ONLY operation: Retrieves invoice list for Processor (Sales & Purchase Invoices).
   */
  async getInvoiceList(
    identifier: string,
    query: ProcessorInvoiceQueryDTO
  ): Promise<ProcessorInvoiceItemResponse[]> {
    const invoices = await this.repository.findInvoicesForProcessor(
      identifier,
      query.search,
      query.category || 'ALL'
    );

    return invoices.map((inv) => {
      const orderObj = inv.orderId && typeof inv.orderId === 'object' ? inv.orderId : null;
      const orderIdStr = orderObj ? orderObj._id.toString() : inv.orderId ? inv.orderId.toString() : '';
      const orderNumberStr = orderObj?.orderNumber || 'N/A';

      const isSales = inv.invoiceType === 'SALES';

      return {
        id: inv._id.toString(),
        invoiceId: inv.invoiceId,
        category: inv.invoiceType,
        categoryLabel: isSales ? 'Sales Invoice' : 'Purchase Invoice',
        orderId: orderIdStr,
        orderNumber: orderNumberStr,
        batchReference: inv.batchReference,
        buyerName: inv.buyerName,
        sellerName: inv.sellerName,
        items: inv.items || [],
        totalAmount: inv.totalAmount,
        formattedAmount: this.formatCurrency(inv.totalAmount),
        date: new Date(inv.generatedAt || inv.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        paymentStatus: inv.paymentStatus || 'PAID',
        invoiceType: inv.invoiceType,
        downloadUrl: `/api/v1/processor/invoices/${inv._id}/download`,
        generatedAt: inv.generatedAt,
      };
    });
  }

  /**
   * Strictly READ-ONLY operation: Retrieves single invoice details by ID.
   */
  async getInvoiceDetails(identifier: string, id: string): Promise<ProcessorInvoiceItemResponse> {
    const inv = await this.repository.findInvoiceById(id, identifier);
    if (!inv) {
      throw new Error('Invoice record not found');
    }

    const orderObj = inv.orderId && typeof inv.orderId === 'object' ? inv.orderId : null;
    const orderIdStr = orderObj ? orderObj._id.toString() : inv.orderId ? inv.orderId.toString() : '';
    const orderNumberStr = orderObj?.orderNumber || 'N/A';

    const isSales = inv.invoiceType === 'SALES';

    return {
      id: inv._id.toString(),
      invoiceId: inv.invoiceId,
      category: inv.invoiceType,
      categoryLabel: isSales ? 'Sales Invoice' : 'Purchase Invoice',
      orderId: orderIdStr,
      orderNumber: orderNumberStr,
      batchReference: inv.batchReference,
      buyerName: inv.buyerName,
      sellerName: inv.sellerName,
      items: inv.items || [],
      totalAmount: inv.totalAmount,
      formattedAmount: this.formatCurrency(inv.totalAmount),
      date: new Date(inv.generatedAt || inv.createdAt).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      paymentStatus: inv.paymentStatus || 'PAID',
      invoiceType: inv.invoiceType,
      downloadUrl: `/api/v1/processor/invoices/${inv._id}/download`,
      generatedAt: inv.generatedAt,
    };
  }

  /**
   * Strictly READ-ONLY operation: Retrieves PDF buffer for download without modifying database.
   */
  async downloadInvoice(identifier: string, id: string): Promise<{ filename: string; buffer: Buffer }> {
    const inv = await this.repository.findInvoiceById(id, identifier);
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
      paymentStatus: inv.paymentStatus || 'PAID',
      generatedAt: inv.generatedAt || inv.createdAt,
      items: inv.items || [],
    });

    return {
      filename: `${inv.invoiceId}.pdf`,
      buffer: pdfBuffer,
    };
  }
}

export const processorInvoicesService = new ProcessorInvoicesService();
