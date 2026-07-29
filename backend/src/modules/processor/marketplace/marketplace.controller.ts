import { Request, Response, NextFunction } from 'express';
import { ProcessorMarketplaceService, processorMarketplaceService } from './marketplace.service.js';

export class ProcessorMarketplaceController {
  constructor(private service: ProcessorMarketplaceService = processorMarketplaceService) {}

  getAvailableHarvests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const search = (req.query.search as string) || '';
      const category = (req.query.category as string) || '';

      const harvests = await this.service.getAvailableHarvests(search, category);
      res.status(200).json({
        success: true,
        data: harvests,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch marketplace crop listings',
      });
    }
  };

  getHarvestDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Product / Batch ID is required' });
        return;
      }

      const details = await this.service.getHarvestDetails(id);
      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Product details not found',
      });
    }
  };

  getCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.query.processorId || 'demo-processor-id';
      const cart = await this.service.getCart(identifier as string);
      res.status(200).json({
        success: true,
        data: cart,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch shopping cart',
      });
    }
  };

  addToCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.body.processorId || 'demo-processor-id';
      const cart = await this.service.addToCart(identifier as string, req.body);
      res.status(200).json({
        success: true,
        message: 'Harvest batch added to shopping cart',
        data: cart,
      });
    } catch (error: any) {
      if (error.message === 'CONFLICT_INVENTORY') {
        res.status(409).json({
          success: false,
          message: 'Requested quantity is no longer available.',
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add item to cart',
      });
    }
  };

  updateCartQuantity = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.body.processorId || 'demo-processor-id';
      const cart = await this.service.updateCartQuantity(identifier as string, req.body);
      res.status(200).json({
        success: true,
        message: 'Cart item quantity updated',
        data: cart,
      });
    } catch (error: any) {
      if (error.message === 'CONFLICT_INVENTORY') {
        res.status(409).json({
          success: false,
          message: 'Requested quantity is no longer available.',
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update cart quantity',
      });
    }
  };

  removeFromCart = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.query.processorId || 'demo-processor-id';
      const harvestId = req.params.harvestId;

      if (!harvestId) {
        res.status(400).json({ success: false, message: 'Harvest ID is required' });
        return;
      }

      const cart = await this.service.removeFromCart(identifier as string, harvestId);
      res.status(200).json({
        success: true,
        message: 'Item removed from shopping cart',
        data: cart,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove item from cart',
      });
    }
  };

  getFactories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.params.id || req.query.processorId || 'demo-processor-id';
      const factories = await this.service.getFactories(identifier as string);
      res.status(200).json({
        success: true,
        data: factories,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch factory delivery locations',
      });
    }
  };

  createFactory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.body.processorId || 'demo-processor-id';
      const factory = await this.service.createFactory(identifier as string, req.body);
      res.status(201).json({
        success: true,
        message: 'Factory delivery address created successfully',
        data: factory,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to create factory delivery location',
      });
    }
  };

  updateFactory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.body.processorId || 'demo-processor-id';
      const factoryId = req.params.id;

      if (!factoryId) {
        res.status(400).json({ success: false, message: 'Factory ID is required' });
        return;
      }

      const factory = await this.service.updateFactory(identifier as string, factoryId, req.body);
      res.status(200).json({
        success: true,
        message: 'Factory delivery address updated successfully',
        data: factory,
      });
    } catch (error: any) {
      if (error.message === 'FORBIDDEN_OWNERSHIP') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to modify this factory delivery location.',
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update factory location',
      });
    }
  };

  deleteFactory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.query.processorId || 'demo-processor-id';
      const factoryId = req.params.id;

      if (!factoryId) {
        res.status(400).json({ success: false, message: 'Factory ID is required' });
        return;
      }

      const deleted = await this.service.deleteFactory(identifier as string, factoryId);
      res.status(200).json({
        success: true,
        message: deleted ? 'Factory address deleted successfully' : 'Factory address not found',
      });
    } catch (error: any) {
      if (error.message === 'FORBIDDEN_OWNERSHIP') {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this factory delivery location.',
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete factory location',
      });
    }
  };

  initiatePayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.body.processorId || 'demo-processor-id';
      const initiation = await this.service.initiateRazorpayPayment(identifier as string, req.body);
      res.status(200).json({
        success: true,
        message: 'Razorpay payment order initiated successfully',
        data: initiation,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to initiate Razorpay payment',
      });
    }
  };

  verifyPayment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.body.processorId || 'demo-processor-id';
      const confirmation = await this.service.verifyPaymentAndCreateOrder(identifier as string, req.body);
      res.status(201).json({
        success: true,
        message: 'Payment verified and order created successfully! Escrow locked.',
        data: confirmation,
      });
    } catch (error: any) {
      if (error.message === 'CONFLICT_INVENTORY') {
        res.status(409).json({
          success: false,
          message: 'Requested quantity is no longer available.',
        });
        return;
      }
      if (error.message === 'FORBIDDEN_OWNERSHIP') {
        res.status(403).json({
          success: false,
          message: 'Selected factory delivery location does not belong to you.',
        });
        return;
      }
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to verify payment and process order',
      });
    }
  };

  getOrderConfirmation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const identifier = (req as any).user?.id || req.query.processorId || 'demo-processor-id';
      const orderId = req.params.orderId;

      if (!orderId) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const confirmation = await this.service.getOrderConfirmation(identifier as string, orderId);
      res.status(200).json({
        success: true,
        data: confirmation,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Order confirmation not found',
      });
    }
  };
}

export const processorMarketplaceController = new ProcessorMarketplaceController();
