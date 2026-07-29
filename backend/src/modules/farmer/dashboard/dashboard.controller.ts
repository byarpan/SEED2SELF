import { Request, Response, NextFunction } from 'express';
import { DashboardService, dashboardService } from './dashboard.service.js';
import { DashboardValidator } from './dashboard.validator.js';

export class DashboardController {
  constructor(private service: DashboardService = dashboardService) {}

  getDashboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.query.userId || req.params.userId;

      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const dashboard = await this.service.getDashboard(userId as string);
      res.status(200).json({
        success: true,
        message: 'Farmer dashboard retrieved successfully',
        data: dashboard,
      });
    } catch (error: any) {
      next(error);
    }
  };

  updateFarmDetails = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as any).user?.id || req.body.userId;

      if (!userId) {
        res.status(400).json({ success: false, message: 'User ID is required' });
        return;
      }

      const validation = DashboardValidator.validateUpdateFarm(req.body);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const updatedFarm = await this.service.updateFarmDetails(userId as string, req.body);
      res.status(200).json({
        success: true,
        message: 'Farm details updated successfully',
        data: updatedFarm,
      });
    } catch (error: any) {
      next(error);
    }
  };
}

export const dashboardController = new DashboardController();
