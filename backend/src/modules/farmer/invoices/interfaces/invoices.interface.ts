import { IInvoiceItem } from '../../../../shared/models/Invoice.js';

export interface InvoiceListItemResponse {
  id: string;
  invoiceId: string;
  orderId: string;
  orderNumber: string;
  batchReference: string;
  buyerName: string;
  sellerName: string;
  items: IInvoiceItem[];
  totalAmount: number;
  paymentStatus: string;
  invoiceType: string;
  generatedAt: Date;
  downloadUrl: string;
}

export interface InvoiceDetailsResponse {
  id: string;
  invoiceId: string;
  orderId: string;
  orderNumber?: string;
  paymentId?: string;
  batchReference: string;
  buyerName: string;
  sellerName: string;
  items: IInvoiceItem[];
  totalAmount: number;
  paymentStatus: string;
  invoiceType: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
  downloadUrl: string;
}
