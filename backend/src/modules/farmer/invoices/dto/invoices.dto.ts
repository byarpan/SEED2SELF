import { InvoiceCategory } from '../../../../shared/enums/InvoiceCategory.js';

export interface InvoiceQueryDTO {
  search?: string;
  category?: InvoiceCategory;
}
