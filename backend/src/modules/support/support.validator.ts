import { CreateTicketDTO, UpdateTicketStatusDTO, AddReplyDTO } from './dto/support.dto.js';

export class SupportValidator {
  static validateCreateTicket(dto: CreateTicketDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.role || !['FARMER', 'PROCESSOR', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'ADMIN'].includes(dto.role)) {
      errors.push('Role is required and must be a valid Seed2Shelf platform role');
    }

    if (!dto.category || typeof dto.category !== 'string' || dto.category.trim() === '') {
      errors.push('Support category is required');
    }

    if (!dto.subject || typeof dto.subject !== 'string' || dto.subject.trim() === '') {
      errors.push('Ticket subject is required');
    }

    if (!dto.description || typeof dto.description !== 'string' || dto.description.trim() === '') {
      errors.push('Ticket description is required');
    }

    if (dto.priority && !['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(dto.priority)) {
      errors.push('Priority must be LOW, MEDIUM, HIGH, or CRITICAL');
    }

    if (
      dto.referenceType &&
      !['ORDER', 'SHIPMENT', 'BATCH', 'PAYMENT', 'WALLET_TRANSACTION', 'INVOICE', 'HARVEST', 'OTHER'].includes(
        dto.referenceType
      )
    ) {
      errors.push('Invalid referenceType');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateUpdateStatus(dto: UpdateTicketStatusDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.status || !['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'].includes(dto.status)) {
      errors.push('Status must be OPEN, IN_PROGRESS, WAITING_FOR_USER, RESOLVED, or CLOSED');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateAddReply(dto: AddReplyDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.message || typeof dto.message !== 'string' || dto.message.trim() === '') {
      errors.push('Reply message is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
