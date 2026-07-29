import { Request, Response, NextFunction } from 'express';
import { ShipmentService, shipmentService } from './shipment.service.js';

export class ShipmentController {
  constructor(private service: ShipmentService = shipmentService) {}

  getIncomingShipments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const tab = (req.query.tab as 'pending' | 'history') || undefined;
      const subFilter = (req.query.subFilter as 'all' | 'accepted' | 'rejected') || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await this.service.getIncomingShipments(processorIdentifier, {
        page,
        limit,
        tab,
        subFilter,
        search,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch incoming shipments',
      });
    }
  };

  getOutgoingShipments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
      const tab = (req.query.tab as 'active' | 'history') || undefined;
      const subFilter = (req.query.subFilter as 'all' | 'accepted' | 'rejected') || undefined;
      const search = (req.query.search as string) || undefined;

      const result = await this.service.getOutgoingShipments(processorIdentifier, {
        page,
        limit,
        tab,
        subFilter,
        search,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch outgoing shipments',
      });
    }
  };

  getShipmentDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Shipment ID is required' });
        return;
      }

      const shipment = await this.service.getShipmentDetails(processorIdentifier, id);
      res.status(200).json({
        success: true,
        data: shipment,
      });
    } catch (error: any) {
      res.status(404).json({
        success: false,
        message: error.message || 'Shipment details not found',
      });
    }
  };

  acceptDelivery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || req.body.processorId || (req.query.processorId as string) || 'demo-processor-id';
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Shipment ID is required' });
        return;
      }

      const acceptedShipment = await this.service.acceptDelivery(processorIdentifier, id);
      res.status(200).json({
        success: true,
        message: 'Delivery accepted successfully. Escrow funds released to farmer.',
        data: acceptedShipment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to accept delivery',
      });
    }
  };

  rejectDelivery = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || req.body.processorId || (req.query.processorId as string) || 'demo-processor-id';
      const id = req.params.id;
      if (!id) {
        res.status(400).json({ success: false, message: 'Shipment ID is required' });
        return;
      }

      const rejectedShipment = await this.service.rejectDelivery(processorIdentifier, id, req.body);
      res.status(200).json({
        success: true,
        message: 'Delivery rejected. Cargo returned and escrow refunded.',
        data: rejectedShipment,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reject delivery',
      });
    }
  };

  getShipmentCounts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req.query.processorId as string) || 'demo-processor-id';
      const counts = await this.service.getShipmentCounts(processorIdentifier);
      res.status(200).json({
        success: true,
        data: counts,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch shipment counts',
      });
    }
  };
}

export const shipmentController = new ShipmentController();
