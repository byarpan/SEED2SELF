import { Request, Response } from 'express';
import { ProductionService } from './production.service.js';

export class ProductionController {
  private service: ProductionService;

  constructor() {
    this.service = new ProductionService();
  }

  // Register New Processed Product
  registerProcessedProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req as any).user?._id || req.headers['x-processor-id'] || 'default-processor';
      const result = await this.service.registerProcessedProduct(String(processorIdentifier), req.body);

      res.status(201).json({
        success: true,
        message: 'Processed product registered and batch lineage created successfully.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to register processed product.',
      });
    }
  };

  // Get Active Processed Products View
  getProcessedProducts = async (req: Request, res: Response): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req as any).user?._id || req.headers['x-processor-id'] || 'default-processor';
      const products = await this.service.getProcessedProducts(String(processorIdentifier));

      res.status(200).json({
        success: true,
        data: products,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch processed products.',
      });
    }
  };

  // Get Purchased Raw Harvests View
  getPurchasedHarvests = async (req: Request, res: Response): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req as any).user?._id || req.headers['x-processor-id'] || 'default-processor';
      const harvests = await this.service.getPurchasedHarvests(String(processorIdentifier));

      res.status(200).json({
        success: true,
        data: harvests,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch purchased harvests.',
      });
    }
  };

  // Get Dynamic Production History View
  getHistory = async (req: Request, res: Response): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req as any).user?._id || req.headers['x-processor-id'] || 'default-processor';
      const history = await this.service.getHistory(String(processorIdentifier));

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch production history.',
      });
    }
  };

  // Update Processed Product
  updateProcessedProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req as any).user?._id || req.headers['x-processor-id'] || 'default-processor';
      const { id } = req.params;
      const updated = await this.service.updateProcessedProduct(String(processorIdentifier), id, req.body);

      res.status(200).json({
        success: true,
        message: 'Processed product updated successfully.',
        data: updated,
      });
    } catch (error: any) {
      const status = error.message?.includes('Unauthorized') ? 403 : error.message?.includes('not found') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to update processed product.',
      });
    }
  };

  // Delete Processed Product
  deleteProcessedProduct = async (req: Request, res: Response): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req as any).user?._id || req.headers['x-processor-id'] || 'default-processor';
      const { id } = req.params;
      await this.service.deleteProcessedProduct(String(processorIdentifier), id);

      res.status(200).json({
        success: true,
        message: 'Processed product deleted successfully.',
      });
    } catch (error: any) {
      const status = error.message?.includes('Unauthorized') ? 403 : error.message?.includes('not found') ? 404 : 400;
      res.status(status).json({
        success: false,
        message: error.message || 'Failed to delete processed product.',
      });
    }
  };

  // Toggle List / Unlist Product Status
  toggleListStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const processorIdentifier = (req as any).user?.id || (req as any).user?._id || req.headers['x-processor-id'] || 'default-processor';
      const { id } = req.params;
      const { action } = req.body; // 'LIST' or 'UNLIST'

      const updated = await this.service.toggleListingStatus(
        String(processorIdentifier),
        id,
        action?.toUpperCase() === 'UNLIST' ? 'UNLIST' : 'LIST'
      );

      res.status(200).json({
        success: true,
        message: `Product ${action === 'UNLIST' ? 'unlisted' : 'listed'} successfully.`,
        data: updated,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to toggle product listing status.',
      });
    }
  };

  // View QR Details for Batch
  getQrDetails = async (req: Request, res: Response): Promise<void> => {
    try {
      const { batchId } = req.params;
      const details = await this.service.getQrDetails(batchId);

      res.status(200).json({
        success: true,
        data: details,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to fetch QR details.',
      });
    }
  };
}
