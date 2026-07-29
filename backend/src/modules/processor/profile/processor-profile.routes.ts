import { Router } from 'express';
import { processorProfileController } from './processor-profile.controller.js';
import { ProcessorProfileValidator } from './processor-profile.validator.js';

const router = Router();

// Processor Registration Endpoint
router.post(
  '/register',
  ProcessorProfileValidator.validateRegistration,
  processorProfileController.registerProcessor
);

// Get Full Processor Profile by ID or processorId
router.get(
  '/:id',
  processorProfileController.getProfile
);

// Update Section 2: Basic Information
router.put(
  '/:id',
  ProcessorProfileValidator.validateBasicInfoUpdate,
  processorProfileController.updateBasicInfo
);

// Update Section 3: Address Information
router.put(
  '/:id/address',
  processorProfileController.updateAddress
);

// Update Section 4: KYC Verification
router.put(
  '/:id/kyc',
  ProcessorProfileValidator.validateKYCUpdate,
  processorProfileController.updateKYC
);

// Submit Section 5: Review for Processor
router.post(
  '/:id/review',
  ProcessorProfileValidator.validateReview,
  processorProfileController.addReview
);

export default router;
