export interface ProcessorInvoiceItemResponse {
  id: string;
  invoiceId: string;
  category: 'SALES' | 'PURCHASE';
  categoryLabel: 'Sales Invoice' | 'Purchase Invoice';
  orderId: string;
  orderNumber: string;
  batchReference: string;
  buyerName: string;
  sellerName: string;
  items: Array<{
    cropName: string;
    variety?: string;
    quantityKg: number;
    pricePerKg: number;
    totalAmount: number;
  }>;
  totalAmount: number;
  formattedAmount: string;
  date: string;
  paymentStatus: 'PAID';
  invoiceType: 'SALES' | 'PURCHASE';
  downloadUrl: string;
  generatedAt: Date;
}
