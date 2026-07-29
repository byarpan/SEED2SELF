import { Request, Response, NextFunction } from 'express';

export class PurchaseOrdersValidator {
  static validateOrderIdParam(req: Request, res: Response, next: NextFunction): void {
    const id = req.params.id;
    if (!id || typeof id !== 'string' || !id.trim()) {
      res.status(400).json({ success: false, message: 'Purchase Order ID or Number is required' });
      return;
    }
    next();
  }

  static validateQueryParameters(req: Request, res: Response, next: NextFunction): void {
    const page = req.query.page ? Number(req.query.page) : undefined;
    const limit = req.query.limit ? Number(req.query.limit) : undefined;

    if (page !== undefined && (isNaN(page) || page < 1)) {
      res.status(400).json({ success: false, message: 'Page query parameter must be a positive integer >= 1' });
      return;
    }

    if (limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
      res.status(400).json({ success: false, message: 'Limit query parameter must be an integer between 1 and 100' });
      return;
    }

    const sortOrder = req.query.sortOrder as string;
    if (sortOrder && !['asc', 'desc'].includes(sortOrder.toLowerCase())) {
      res.status(400).json({ success: false, message: 'SortOrder must be either "asc" or "desc"' });
      return;
    }

    next();
  }

  static validateRejectOrderBody(req: Request, res: Response, next: NextFunction): void {
    const { reason, rejectionReason } = req.body;
    const finalReason = rejectionReason || reason;
    if (finalReason !== undefined && (typeof finalReason !== 'string' || finalReason.length > 500)) {
      res.status(400).json({ success: false, message: 'Rejection reason must be a string up to 500 characters' });
      return;
    }
    next();
  }

  static validateStartDeliveryBody(req: Request, res: Response, next: NextFunction): void {
    const { trackingNumber, carrierName, estimatedDeliveryDays } = req.body;
    if (trackingNumber !== undefined && typeof trackingNumber !== 'string') {
      res.status(400).json({ success: false, message: 'Tracking Number must be a valid string' });
      return;
    }
    if (carrierName !== undefined && typeof carrierName !== 'string') {
      res.status(400).json({ success: false, message: 'Carrier Name must be a valid string' });
      return;
    }
    if (estimatedDeliveryDays !== undefined && (typeof estimatedDeliveryDays !== 'number' || estimatedDeliveryDays < 1)) {
      res.status(400).json({ success: false, message: 'Estimated delivery days must be a positive number' });
      return;
    }
    next();
  }
}
