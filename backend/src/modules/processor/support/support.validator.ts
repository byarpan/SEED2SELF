import { Request, Response, NextFunction } from 'express';

export class SupportValidator {
  static validateCreateTicketBody = (req: Request, res: Response, next: NextFunction): void => {
    const { category, subject, description } = req.body;
    const errors: string[] = [];

    if (!category || typeof category !== 'string' || category.trim() === '') {
      errors.push('Support category is required.');
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3) {
      errors.push('Subject is required and must be at least 3 characters.');
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      errors.push('Description is required and must be at least 5 characters.');
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

  static validateReplyBody = (req: Request, res: Response, next: NextFunction): void => {
    const { message } = req.body;

    if (!message || typeof message !== 'string' || message.trim() === '') {
      res.status(400).json({
        success: false,
        errors: ['Reply message cannot be empty.'],
      });
      return;
    }

    next();
  };

  static validateTicketIdParam = (req: Request, res: Response, next: NextFunction): void => {
    const { id } = req.params;

    if (!id || typeof id !== 'string' || id.trim() === '') {
      res.status(400).json({
        success: false,
        errors: ['Ticket ID parameter is required.'],
      });
      return;
    }

    next();
  };
}
