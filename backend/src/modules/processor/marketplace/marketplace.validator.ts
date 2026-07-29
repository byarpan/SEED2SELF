import { Request, Response, NextFunction } from 'express';

export class ProcessorMarketplaceValidator {
  static validateAddToCart(req: Request, res: Response, next: NextFunction): void {
    const { harvestId, quantityKg } = req.body;

    if (!harvestId || typeof harvestId !== 'string' || !harvestId.trim()) {
      res.status(400).json({ success: false, message: 'Harvest ID is required' });
      return;
    }

    if (typeof quantityKg !== 'number' || quantityKg <= 0) {
      res.status(400).json({ success: false, message: 'Quantity in Kg must be a positive number' });
      return;
    }

    next();
  }

  static validateUpdateCartQuantity(req: Request, res: Response, next: NextFunction): void {
    const { harvestId, quantityKg } = req.body;

    if (!harvestId || typeof harvestId !== 'string' || !harvestId.trim()) {
      res.status(400).json({ success: false, message: 'Harvest ID is required' });
      return;
    }

    if (typeof quantityKg !== 'number' || quantityKg < 0) {
      res.status(400).json({ success: false, message: 'Quantity in Kg must be 0 or greater' });
      return;
    }

    next();
  }

  static validateCreateFactory(req: Request, res: Response, next: NextFunction): void {
    const { factoryName, contactPerson, contactNumber, streetAddress, city, state, pinCode } = req.body;

    if (!factoryName || !factoryName.trim()) {
      res.status(400).json({ success: false, message: 'Factory Name is required' });
      return;
    }

    if (!contactPerson || !contactPerson.trim()) {
      res.status(400).json({ success: false, message: 'Contact Person is required' });
      return;
    }

    if (!contactNumber || !contactNumber.trim()) {
      res.status(400).json({ success: false, message: 'Contact Number is required' });
      return;
    }

    if (!streetAddress || !streetAddress.trim()) {
      res.status(400).json({ success: false, message: 'Street Address is required' });
      return;
    }

    if (!city || !city.trim()) {
      res.status(400).json({ success: false, message: 'City is required' });
      return;
    }

    if (!state || !state.trim()) {
      res.status(400).json({ success: false, message: 'State is required' });
      return;
    }

    if (!pinCode || !/^[0-9]{6}$/.test(pinCode.trim())) {
      res.status(400).json({ success: false, message: 'Valid 6-digit Pin Code is required' });
      return;
    }

    next();
  }

  static validateVerifyPayment(req: Request, res: Response, next: NextFunction): void {
    const { razorpayPaymentId, razorpayOrderId, factoryId } = req.body;

    if (!razorpayPaymentId || !razorpayPaymentId.trim()) {
      res.status(400).json({ success: false, message: 'Razorpay Payment ID is required' });
      return;
    }

    if (!razorpayOrderId || !razorpayOrderId.trim()) {
      res.status(400).json({ success: false, message: 'Razorpay Order ID is required' });
      return;
    }

    if (!factoryId || !factoryId.trim()) {
      res.status(400).json({ success: false, message: 'Factory Delivery Location ID is required' });
      return;
    }

    next();
  }
}
