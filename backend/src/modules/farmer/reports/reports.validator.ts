import { ReportsQueryDTO } from './dto/reports.dto.js';

export class ReportsValidator {
  static validateQuery(dto: ReportsQueryDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.timeframe && !['WEEKLY', 'MONTHLY', 'YEARLY'].includes(dto.timeframe)) {
      errors.push('Timeframe must be WEEKLY, MONTHLY, or YEARLY');
    }

    if (dto.format && !['CSV', 'PDF'].includes(dto.format)) {
      errors.push('Format must be either CSV or PDF');
    }

    if (dto.startDate && isNaN(Date.parse(dto.startDate))) {
      errors.push('Start date must be a valid date string');
    }

    if (dto.endDate && isNaN(Date.parse(dto.endDate))) {
      errors.push('End date must be a valid date string');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
