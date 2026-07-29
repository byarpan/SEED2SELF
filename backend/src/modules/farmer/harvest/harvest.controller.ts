import { Request, Response, NextFunction } from 'express';
import { HarvestService, harvestService } from './harvest.service.js';
import { HarvestValidator } from './harvest.validator.js';

export class HarvestController {
  constructor(private service: HarvestService = harvestService) {}

  registerHarvest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const validation = HarvestValidator.validateRegisterHarvest(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const harvest = await this.service.registerHarvest(userId, req.body);
      res.status(201).json({
        success: true,
        message: 'Harvest batch registered successfully',
        data: harvest,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getActiveHarvests = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const result = await this.service.getActiveHarvests(userId as string, {
        cropCategory: req.query.cropCategory as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'Active harvests retrieved successfully',
        data: result.harvests,
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

  getHarvestHistory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;
      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const result = await this.service.getHarvestHistory(userId as string, {
        cropCategory: req.query.cropCategory as string,
        search: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 50,
      });

      res.status(200).json({
        success: true,
        message: 'Sold harvest history retrieved successfully',
        data: result.harvests,
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

  getHarvestDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Harvest ID or Batch ID is required' });
        return;
      }

      const harvest = await this.service.getHarvestDetails(id);
      res.status(200).json({
        success: true,
        message: 'Harvest batch details retrieved successfully',
        data: harvest,
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateHarvest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      const { id } = req.params;
      if (!userId || !id) {
        res.status(400).json({ success: false, message: 'User ID and Harvest ID are required' });
        return;
      }

      const validation = HarvestValidator.validateUpdateHarvest(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const updatedHarvest = await this.service.updateHarvest(userId, id, req.body);
      res.status(200).json({
        success: true,
        message: 'Harvest batch updated successfully',
        data: updatedHarvest,
      });
    } catch (error: any) {
      next(error);
    }
  };

  deleteHarvest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || (req.query.userId as string) || (req.body?.userId as string);
      const { id } = req.params;
      if (!userId || !id) {
        res.status(400).json({ success: false, message: 'User ID and Harvest ID are required' });
        return;
      }

      await this.service.deleteHarvest(userId, id);
      res.status(200).json({
        success: true,
        message: 'Harvest batch deleted successfully',
      });
    } catch (error: any) {
      next(error);
    }
  };

  listHarvest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      const { id } = req.params;
      if (!userId || !id) {
        res.status(400).json({ success: false, message: 'User ID and Harvest ID are required' });
        return;
      }

      const listedHarvest = await this.service.listProduct(userId, id);
      res.status(200).json({
        success: true,
        message: 'Harvest batch listed on marketplace successfully',
        data: listedHarvest,
      });
    } catch (error: any) {
      next(error);
    }
  };

  unlistHarvest = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;
      const { id } = req.params;
      if (!userId || !id) {
        res.status(400).json({ success: false, message: 'User ID and Harvest ID are required' });
        return;
      }

      const unlistedHarvest = await this.service.unlistProduct(userId, id);
      res.status(200).json({
        success: true,
        message: 'Harvest batch unlisted from marketplace successfully',
        data: unlistedHarvest,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getQR = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({ success: false, message: 'Harvest ID or Batch ID is required' });
        return;
      }

      const qrData = await this.service.getQR(id);
      res.status(200).json({
        success: true,
        message: 'Harvest QR code data generated successfully',
        data: qrData,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const harvestController = new HarvestController();
