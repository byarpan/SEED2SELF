import { Request, Response, NextFunction } from 'express';
import { PurchaseOrdersService, purchaseOrdersService } from './purchase-orders.service.js';

export class PurchaseOrdersController {
  constructor(private service: PurchaseOrdersService = purchaseOrdersService) {}

  getAllOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = (req.query.search as string) || undefined;
      const status = (req.query.status as string) || undefined;
      const category = (req.query.category as string) || undefined;
      const sortBy = (req.query.sortBy as string) || undefined;
      const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || undefined;

      const result = await this.service.getAllOrders(processorIdentifier, {
        page,
        limit,
        search,
        status,
        category,
        sortBy,
        sortOrder,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch purchase orders',
      });
    }
  };

  getPendingOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = (req.query.search as string) || undefined;

      const result = await this.service.getPendingOrders(processorIdentifier, { page, limit, search });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch pending purchase orders',
      });
    }
  };

  getAcceptedOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const search = (req.query.search as string) || undefined;

      const result = await this.service.getAcceptedOrders(processorIdentifier, { page, limit, search });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch accepted purchase orders',
      });
    }
  };

  getOrderDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const order = await this.service.getOrderDetails(processorIdentifier, id);
      res.status(200).json({
        success: true,
        data: order,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Purchase order details not found',
      });
    }
  };

  acceptOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || req.body.processorId || (req.query.processorId as string) || 'demo-processor-id';
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const acceptedOrder = await this.service.acceptOrder(processorIdentifier, id);
      res.status(200).json({
        success: true,
        message: 'Purchase order accepted successfully. Escrow locked.',
        data: acceptedOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to accept purchase order',
      });
    }
  };

  rejectOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || req.body.processorId || (req.query.processorId as string) || 'demo-processor-id';
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const rejectedOrder = await this.service.rejectOrder(processorIdentifier, id, req.body);
      res.status(200).json({
        success: true,
        message: 'Purchase order rejected. Escrow refunded to buyer.',
        data: rejectedOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reject purchase order',
      });
    }
  };

  startDelivery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || req.body.processorId || (req.query.processorId as string) || 'demo-processor-id';
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Order ID is required' });
        return;
      }

      const dispatchedOrder = await this.service.startDelivery(processorIdentifier, id, req.body);
      res.status(200).json({
        success: true,
        message: 'Delivery started. Order dispatched and transferred to Shipment Module.',
        data: dispatchedOrder,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to start delivery for purchase order',
      });
    }
  };
}

export const purchaseOrdersController = new PurchaseOrdersController();
