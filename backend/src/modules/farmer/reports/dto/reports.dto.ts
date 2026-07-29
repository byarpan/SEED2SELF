export interface ReportsQueryDTO {
  userId?: string;
  timeframe?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  startDate?: string;
  endDate?: string;
  cropCategory?: string;
  format?: 'CSV' | 'PDF';
}
