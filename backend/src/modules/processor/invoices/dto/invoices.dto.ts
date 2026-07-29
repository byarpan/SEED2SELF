export interface ProcessorInvoiceQueryDTO {
  search?: string;
  category?: 'ALL' | 'SALES' | 'PURCHASE';
}
