import { InvoiceQueryDTO } from './dto/invoices.dto.js';
import { InvoiceCategory } from '../../../shared/enums/InvoiceCategory.js';

export class InvoicesValidator {
  static validateQuery(query: any): { isValid: boolean; errors: string[]; data: InvoiceQueryDTO } {
    const errors: string[] = [];
    const search = query.search ? String(query.search).trim() : undefined;
    let category = InvoiceCategory.ALL;

    if (query.category) {
      const catUpper = String(query.category).toUpperCase();
      if (Object.values(InvoiceCategory).includes(catUpper as InvoiceCategory)) {
        category = catUpper as InvoiceCategory;
      } else {
        errors.push(`Invalid category filter. Allowed values: ${Object.values(InvoiceCategory).join(', ')}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      data: {
        search,
        category,
      },
    };
  }
}
