import { PurchaseOrderQueryDTO, RejectOrderDTO, StartDeliveryDTO } from './dto/purchase-orders.dto.js';

export class PurchaseOrderValidator {
  static validateQuery(dto: PurchaseOrderQueryDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (dto.status && !['ALL', 'PENDING', 'ACCEPTED', 'DISPATCHED', 'REJECTED', 'CANCELLED'].includes(dto.status)) {
      errors.push('Status filter must be ALL, PENDING, ACCEPTED, DISPATCHED, REJECTED, or CANCELLED');
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

  static validateRejectOrder(dto: RejectOrderDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (dto.reason !== undefined && typeof dto.reason !== 'string') {
      errors.push('Rejection reason must be a string');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateStartDelivery(dto: StartDeliveryDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    if (dto.carrierName !== undefined && typeof dto.carrierName !== 'string') {
      errors.push('Carrier name must be a string');
    }
    if (dto.trackingNumber !== undefined && typeof dto.trackingNumber !== 'string') {
      errors.push('Tracking number must be a string');
    }
    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
