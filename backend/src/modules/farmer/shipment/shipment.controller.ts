import { Request, Response, NextFunction } from 'express';
import { ShipmentService, shipmentService } from './shipment.service.js';
import { ShipmentValidator } from './shipment.validator.js';

export class ShipmentController {
  constructor(private service: ShipmentService = shipmentService) {}

  startShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      if (!req.body.orderId) {
        res.status(400).json({ success: false, message: 'Order ID is required to start shipment' });
        return;
      }

      const shipment = await this.service.startShipment(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Shipment created and dispatched successfully',
        data: shipment,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getActiveDispatches = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const validation = ShipmentValidator.validateQuery(req.query as any);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const result = await this.service.getActiveDispatches(userId as string, {
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'Active dispatches retrieved successfully',
        data: result.shipments,
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

  getShipmentHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const validation = ShipmentValidator.validateQuery(req.query as any);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const result = await this.service.getShipmentHistory(userId as string, {
        status: req.query.status as any,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'Shipment history retrieved successfully',
        data: result.shipments,
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

  getAcceptedShipments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const result = await this.service.getAcceptedShipments(userId as string, {
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'Accepted shipments retrieved successfully',
        data: result.shipments,
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

  getRejectedShipments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const result = await this.service.getRejectedShipments(userId as string, {
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'Rejected shipments retrieved successfully',
        data: result.shipments,
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

  getShipmentDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Shipment ID is required' });
        return;
      }

      const shipment = await this.service.getShipmentDetails(id);
      res.status(200).json({
        success: true,
        message: 'Shipment details retrieved successfully',
        data: shipment,
      });
    } catch (error: any) {
      next(error);
    }
  };

  trackShipment = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Shipment ID is required' });
        return;
      }

      const tracking = await this.service.trackShipment(id);
      res.status(200).json({
        success: true,
        message: 'Shipment tracking details retrieved successfully',
        data: tracking,
      });
    } catch (error: any) {
      next(error);
    }
  };

  processInspection = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Shipment ID is required' });
        return;
      }

      const validation = ShipmentValidator.validateInspection(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const shipment = await this.service.processInspection(id, req.body);
      res.status(200).json({
        success: true,
        message: `Shipment inspection processed: ${req.body.decision}`,
        data: shipment,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const shipmentController = new ShipmentController();
