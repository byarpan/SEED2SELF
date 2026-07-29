import { Request, Response, NextFunction } from 'express';

export class ProcessorWalletValidator {
  static validateBankAccountUpdate(req: Request, res: Response, next: NextFunction): void {
    const { bankName, accountHolderName, accountNumber, ifscCode, branchLocation } = req.body;

    if (!bankName || typeof bankName !== 'string' || !bankName.trim()) {
      res.status(400).json({ success: false, message: 'Bank Name is required' });
      return;
    }

    if (!accountHolderName || typeof accountHolderName !== 'string' || !accountHolderName.trim()) {
      res.status(400).json({ success: false, message: 'Account Holder Name is required' });
      return;
    }

    if (!accountNumber || typeof accountNumber !== 'string' || accountNumber.trim().length < 8) {
      res.status(400).json({ success: false, message: 'Valid Account Number is required' });
      return;
    }

    if (!ifscCode || typeof ifscCode !== 'string' || !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifscCode.trim())) {
      res.status(400).json({ success: false, message: 'Valid 11-digit IFSC code is required (e.g. HDFC0001234)' });
      return;
    }

    if (!branchLocation || typeof branchLocation !== 'string' || !branchLocation.trim()) {
      res.status(400).json({ success: false, message: 'Branch Location is required' });
      return;
    }

    next();
  }

  static validateAddEscrowItem(req: Request, res: Response, next: NextFunction): void {
    const { cropName, batchNumber, quantity, supplier, escrowAmount, rawAmount, orderId } = req.body;

    if (!cropName || !cropName.trim()) {
      res.status(400).json({ success: false, message: 'Crop/Product Name is required' });
      return;
    }

    if (!batchNumber || !batchNumber.trim()) {
      res.status(400).json({ success: false, message: 'Batch Number is required' });
      return;
    }

    if (!quantity || !quantity.trim()) {
      res.status(400).json({ success: false, message: 'Quantity is required' });
      return;
    }

    if (!supplier || !supplier.trim()) {
      res.status(400).json({ success: false, message: 'Supplier / Buyer name is required' });
      return;
    }

    if (!escrowAmount || !escrowAmount.trim()) {
      res.status(400).json({ success: false, message: 'Escrow amount string is required' });
      return;
    }

    if (typeof rawAmount !== 'number' || rawAmount <= 0) {
      res.status(400).json({ success: false, message: 'Numeric rawAmount must be greater than 0' });
      return;
    }

    if (!orderId || !orderId.trim()) {
      res.status(400).json({ success: false, message: 'Order ID is required' });
      return;
    }

    next();
  }

  static validateTimeframeQuery(req: Request, res: Response, next: NextFunction): void {
    const timeframe = req.query.timeframe as string;
    if (timeframe && !['LIFETIME', 'YEARLY', 'MONTHLY', 'WEEKLY'].includes(timeframe.toUpperCase())) {
      res.status(400).json({
        success: false,
        message: 'Invalid timeframe. Must be LIFETIME, YEARLY, MONTHLY, or WEEKLY',
      });
      return;
    }
    next();
  }
}
