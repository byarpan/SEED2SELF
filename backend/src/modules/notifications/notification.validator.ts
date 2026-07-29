import { CreateNotificationDTO } from './dto/notification.dto.js';

export class NotificationValidator {
  static validateCreate(dto: CreateNotificationDTO): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!dto.userId || typeof dto.userId !== 'string' || dto.userId.trim() === '') {
      errors.push('User ID is required');
    }

    if (!dto.role || !['FARMER', 'PROCESSOR', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'ADMIN'].includes(dto.role)) {
      errors.push('Role is required and must be a valid Seed2Shelf platform role');
    }

    if (!dto.title || typeof dto.title !== 'string' || dto.title.trim() === '') {
      errors.push('Notification title is required');
    }

    if (!dto.message || typeof dto.message !== 'string' || dto.message.trim() === '') {
      errors.push('Notification message is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static validateId(id: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!id || typeof id !== 'string' || id.trim() === '') {
      errors.push('Notification ID is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
