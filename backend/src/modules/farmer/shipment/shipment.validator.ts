import { ShipmentQueryDTO, InspectionDTO } from './dto/shipment.dto.js';

export class ShipmentValidator {
  static validateQuery(dto: ShipmentQueryDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (
      dto.status &&
      !['ACTIVE', 'HISTORY', 'IN_TRANSIT', 'DELIVERED', 'ACCEPTED', 'REJECTED', 'ALL'].includes(dto.status)
    ) {
      errors.push('Status filter must be ACTIVE, HISTORY, IN_TRANSIT, DELIVERED, ACCEPTED, REJECTED, or ALL');
    }

    if (dto.page !== undefined && (typeof dto.page !== 'number' || dto.page < 1)) {
      errors.push('Page must be a positive integer');
    }

    if (dto.limit !== undefined && (typeof dto.limit !== 'number' || dto.limit < 1)) {
      errors.push('Limit must be a positive integer');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateInspection(dto: InspectionDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.decision || !['ACCEPTED', 'REJECTED'].includes(dto.decision)) {
      errors.push('Decision must be either ACCEPTED or REJECTED');
    }

    if (dto.decision === 'REJECTED' && (!dto.rejectionReason || typeof dto.rejectionReason !== 'string')) {
      errors.push('Rejection reason is required when rejecting a shipment');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
