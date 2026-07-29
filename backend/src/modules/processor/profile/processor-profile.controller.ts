import { Request, Response, NextFunction } from 'express';
import { ProcessorProfileService, processorProfileService } from './processor-profile.service.js';

export class ProcessorProfileController {
  constructor(private service: ProcessorProfileService = processorProfileService) {}

  registerProcessor = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.service.registerProcessor(req.body);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Registration failed',
      });
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const profile = await this.service.getProfile(id);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      res.status(error.message.includes('not found') ? 404 : 400).json({
        success: false,
        message: error.message || 'Failed to fetch processor profile',
      });
    }
  };

  updateBasicInfo = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedProfile = await this.service.updateBasicInfo(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Basic information updated successfully',
        data: updatedProfile,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update basic information',
      });
    }
  };

  updateAddress = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const address = await this.service.updateAddress(id, req.body);
      res.status(200).json({
        success: true,
        message: 'Address information updated successfully',
        data: address,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update address',
      });
    }
  };

  updateKYC = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const kyc = await this.service.updateKYC(id, req.body);
      res.status(200).json({
        success: true,
        message: 'KYC information submitted successfully',
        data: kyc,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update KYC information',
      });
    }
  };

  addReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const review = await this.service.addReview(id, req.body);
      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: review,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to add review',
      });
    }
  };
}

export const processorProfileController = new ProcessorProfileController();
