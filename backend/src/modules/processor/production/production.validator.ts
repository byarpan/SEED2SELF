import { Request, Response, NextFunction } from 'express';

export class ProductionValidator {
  static validateRegister(req: Request, res: Response, next: NextFunction): void {
    const { productCategory, productName, processedVolume, sellingPrice } = req.body;

    if (!productCategory || typeof productCategory !== 'string' || !productCategory.trim()) {
      res.status(400).json({ success: false, message: 'Product Category is required.' });
      return;
    }

    if (!productName || typeof productName !== 'string' || !productName.trim()) {
      res.status(400).json({ success: false, message: 'Product Name is required.' });
      return;
    }

    if (processedVolume === undefined || isNaN(Number(processedVolume)) || Number(processedVolume) <= 0) {
      res.status(400).json({ success: false, message: 'Processed Volume must be a positive number.' });
      return;
    }

    if (sellingPrice === undefined || isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0) {
      res.status(400).json({ success: false, message: 'Selling Price must be a non-negative number.' });
      return;
    }

    next();
  }

  static validateUpdate(req: Request, res: Response, next: NextFunction): void {
    const { sellingPrice } = req.body;

    if (sellingPrice !== undefined && (isNaN(Number(sellingPrice)) || Number(sellingPrice) < 0)) {
      res.status(400).json({ success: false, message: 'Selling Price must be a non-negative number.' });
      return;
    }

    next();
  }
}
