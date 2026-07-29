import { Request, Response, NextFunction } from 'express';

export class AuthValidator {
  static validateRegisterBody = (req: Request, res: Response, next: NextFunction): void => {
    const { fullName, phone, email, role } = req.body;
    const errors: string[] = [];

    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      errors.push('Full name is required and must be at least 2 characters.');
    }

    if (!phone || typeof phone !== 'string' || !/^\+?[0-9]{10,15}$/.test(phone.trim())) {
      errors.push('Valid phone number is required (10-15 digits).');
    }

    if (email && typeof email === 'string' && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        errors.push('Invalid email address format.');
      }
    }

    if (role && !['FARMER', 'PROCESSOR', 'DISTRIBUTOR', 'RETAILER', 'CUSTOMER', 'ADMIN'].includes(role)) {
      errors.push('Invalid user role. Allowed roles: FARMER, PROCESSOR, DISTRIBUTOR, RETAILER, CUSTOMER, ADMIN.');
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        errors,
      });
      return;
    }

    next();
  };

  static validateLoginBody = (req: Request, res: Response, next: NextFunction): void => {
    const { identifier } = req.body;

    if (!identifier || typeof identifier !== 'string' || identifier.trim() === '') {
      res.status(400).json({
        success: false,
        errors: ['Identifier (email, phone, or User ID) is required.'],
      });
      return;
    }

    next();
  };
}
