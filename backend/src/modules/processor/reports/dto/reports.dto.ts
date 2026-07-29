export interface TimeframeQueryDTO {
  timeframe?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  processorId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ExportReportQueryDTO {
  timeframe?: 'WEEKLY' | 'MONTHLY' | 'YEARLY';
  format?: 'csv' | 'pdf';
  processorId?: string;
}
