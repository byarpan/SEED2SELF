import { Request, Response, NextFunction } from 'express';
import { PurchaseOrdersService, purchaseOrdersService } from './purchase-orders.service.js';
import { PurchaseOrderValidator } from './purchase-orders.validator.js';

export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService = purchaseOrdersService) {}

  createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.service.createOrder(req.body);
      res.status(201).json({
        success: true,
        message: 'Purchase order placed successfully. Payment locked in Escrow.',
        data: order,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const queryValidation = PurchaseOrderValidator.validateQuery(req.query as any);
      if (!queryValidation.isValid) {
        res.status(400).json({ success: false, errors: queryValidation.errors });
        return;
      }

      const result = await this.service.getAllOrders(userId as string, {
        status: req.query.status as any,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'All purchase orders retrieved successfully',
        data: result.orders,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  getPendingOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const result = await this.service.getPendingOrders(userId as string, {
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'Pending purchase orders retrieved successfully',
        data: result.orders,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  getAcceptedOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const result = await this.service.getAcceptedOrders(userId as string, {
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'Accepted purchase orders retrieved successfully',
        data: result.orders,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
        },
      });
    } catch (error: any) {
      next(error);
    }
  };

  getOrderDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID or Order Number is required' });
        return;
      }

      const order = await this.service.getOrderDetails(id);
      res.status(200).json({
        success: true,
        message: 'Purchase order details retrieved successfully',
        data: order,
      });
    } catch (error: any) {
      next(error);
    }
  };

  acceptOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      const { id } = req.params;

      if (!userId || !id) {
        res.status(400).json({ success: false, message: 'User ID and Order ID are required' });
        return;
      }

      const order = await this.service.acceptOrder(userId as string, id);
      res.status(200).json({
        success: true,
        message: 'Purchase order accepted successfully. Escrow funds secured.',
        data: order,
      });
    } catch (error: any) {
      next(error);
    }
  };

  rejectOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      const { id } = req.params;

      if (!userId || !id) {
        res.status(400).json({ success: false, message: 'User ID and Order ID are required' });
        return;
      }

      const validation = PurchaseOrderValidator.validateRejectOrder(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const order = await this.service.rejectOrder(userId as string, id, req.body);
      res.status(200).json({
        success: true,
        message: 'Purchase order rejected. Escrow payment refunded.',
        data: order,
      });
    } catch (error: any) {
      next(error);
    }
  };

  startDelivery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      const { id } = req.params;

      if (!userId || !id) {
        res.status(400).json({ success: false, message: 'User ID and Order ID are required' });
        return;
      }

      const validation = PurchaseOrderValidator.validateStartDelivery(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const order = await this.service.startDelivery(userId as string, id, req.body);
      res.status(200).json({
        success: true,
        message: 'Delivery started successfully. Shipment record created.',
        data: order,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const purchaseOrdersController = new PurchaseOrdersController();
