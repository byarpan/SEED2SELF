import { Request, Response, NextFunction } from 'express';

export class ShipmentValidator {
  static validateShipmentIdParam(req: Request, res: Response, next: NextFunction): void {
    const id = req.params.id;
    if (!id || typeof id !== 'string' || !id.trim()) {
      res.status(400).json({ success: false, message: 'Shipment ID is required' });
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

    const tab = req.query.tab as string;
    if (tab && !['pending', 'active', 'history'].includes(tab.toLowerCase())) {
      res.status(400).json({ success: false, message: 'Tab parameter must be pending, active, or history' });
      return;
    }

    const subFilter = req.query.subFilter as string;
    if (subFilter && !['all', 'accepted', 'rejected'].includes(subFilter.toLowerCase())) {
      res.status(400).json({ success: false, message: 'SubFilter parameter must be all, accepted, or rejected' });
      return;
    }

    next();
  }

  static validateRejectDeliveryBody(req: Request, res: Response, next: NextFunction): void {
    const { rejectionReason, reason } = req.body;
    const finalReason = rejectionReason || reason;

    if (!finalReason || typeof finalReason !== 'string' || !finalReason.trim()) {
      res.status(400).json({
        success: false,
        message: 'Mandatory rejection reason is required when rejecting a delivery.',
      });
      return;
    }

    if (finalReason.trim().length < 3) {
      res.status(400).json({
        success: false,
        message: 'Rejection reason must be at least 3 characters long.',
      });
      return;
    }

    req.body.rejectionReason = finalReason.trim();
    next();
  }
}
