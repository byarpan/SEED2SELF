import { Request, Response, NextFunction } from 'express';
import { TraceabilityService, traceabilityService } from './traceability.service.js';
import { TraceabilityValidator } from './traceability.validator.js';

export class TraceabilityController {
  constructor(private service: TraceabilityService = traceabilityService) {}

  searchBatch = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId } = req.params;
      const validation = TraceabilityValidator.validateBatchId(batchId);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const result = await this.service.searchBatch(batchId);
      res.status(200).json({
        success: true,
        message: 'Farm-to-shelf traceability search completed successfully',
        data: result,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getLineageTree = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId } = req.params;
      const validation = TraceabilityValidator.validateBatchId(batchId);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const lineage = await this.service.getLineageTree(batchId);
      res.status(200).json({
        success: true,
        message: 'Supply chain lineage tree reconstructed successfully',
        data: lineage,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getFarmerStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId } = req.params;
      const validation = TraceabilityValidator.validateBatchId(batchId);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const stage = await this.service.getFarmerStage(batchId);
      res.status(200).json({
        success: true,
        message: 'Farmer stage traceability details retrieved successfully',
        data: stage,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getProcessorStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId } = req.params;
      const validation = TraceabilityValidator.validateBatchId(batchId);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const stage = await this.service.getProcessorStage(batchId);
      res.status(200).json({
        success: true,
        message: 'Processor stage details retrieved successfully',
        data: stage || null,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getDistributorStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId } = req.params;
      const validation = TraceabilityValidator.validateBatchId(batchId);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const stage = await this.service.getDistributorStage(batchId);
      res.status(200).json({
        success: true,
        message: 'Distributor stage details retrieved successfully',
        data: stage || null,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getRetailerStage = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId } = req.params;
      const validation = TraceabilityValidator.validateBatchId(batchId);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const stage = await this.service.getRetailerStage(batchId);
      res.status(200).json({
        success: true,
        message: 'Retailer stage details retrieved successfully',
        data: stage || null,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getDigitalPassport = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId } = req.params;
      const validation = TraceabilityValidator.validateBatchId(batchId);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const passport = await this.service.getDigitalPassport(batchId);
      res.status(200).json({
        success: true,
        message: 'Digital Product Passport generated successfully',
        data: passport,
      });
    } catch (error: any) {
      next(error);
    }
  };

  getQR = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId } = req.params;
      const validation = TraceabilityValidator.validateBatchId(batchId);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const qrData = await this.service.getQR(batchId);
      res.status(200).json({
        success: true,
        message: 'Dynamic QR code generated successfully',
        data: qrData,
      });
    } catch (error: any) {
      next(error);
    }
  };

  downloadQR = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { batchId } = req.params;
      const validation = TraceabilityValidator.validateBatchId(batchId);
      if (!validation.isValid) {
        res.status(400).json({ success: false, errors: validation.errors });
        return;
      }

      const qrData = await this.service.getQR(batchId);
      const base64Data = qrData.qrCodeDataUrl.replace(/^data:image\/png;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="QR_${batchId}.png"`);
      res.status(200).send(imgBuffer);
    } catch (error: any) {
      next(error);
    }
  };
}

export const traceabilityController = new TraceabilityController();
