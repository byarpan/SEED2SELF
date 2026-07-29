import { Request, Response, NextFunction } from 'express';

export class ProcessorProfileValidator {
  static validateRegistration(req: Request, res: Response, next: NextFunction): void {
    const { fullName, email, phone } = req.body;

    if (!fullName || typeof fullName !== 'string' || !fullName.trim()) {
      res.status(400).json({ success: false, message: 'Full name is required' });
      return;
    }

    if (!email || typeof email !== 'string' || !/\S+@\S+\.\S+/.test(email)) {
      res.status(400).json({ success: false, message: 'Valid email address is required' });
      return;
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 8) {
      res.status(400).json({ success: false, message: 'Valid phone number is required' });
      return;
    }

    next();
  }

  static validateBasicInfoUpdate(req: Request, res: Response, next: NextFunction): void {
    const { email, processorId, gender } = req.body;

    if (email !== undefined || processorId !== undefined) {
      res.status(400).json({
        success: false,
        message: 'Email and Processor ID are read-only and cannot be updated.',
      });
      return;
    }

    if (gender && !['MALE', 'FEMALE', 'OTHER'].includes(gender)) {
      res.status(400).json({
        success: false,
        message: 'Gender must be MALE, FEMALE, or OTHER',
      });
      return;
    }

    next();
  }

  static validateKYCUpdate(req: Request, res: Response, next: NextFunction): void {
    const { aadhaarNumber } = req.body;

    if (aadhaarNumber && !/^\d{12}$/.test(aadhaarNumber.trim())) {
      res.status(400).json({
        success: false,
        message: 'Aadhaar number must be a valid 12-digit number',
      });
      return;
    }

    next();
  }

  static validateReview(req: Request, res: Response, next: NextFunction): void {
    const { reviewerId, rating } = req.body;

    if (!reviewerId) {
      res.status(400).json({ success: false, message: 'Reviewer ID is required' });
      return;
    }

    if (typeof rating !== 'number' || rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
      return;
    }

    next();
  }
}
