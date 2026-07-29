import { Router } from 'express';
import { profileController } from './profile.controller.js';
import { authenticateJWT, authorizeRoles } from '../../../shared/middleware/auth.middleware.js';

const router = Router();

// Public Farmer Registration Endpoint
router.post('/register', profileController.registerFarmer);

// Bank Account Endpoints
router.get('/bank-account', profileController.getBankAccount);
router.post('/bank-account', profileController.updateBankAccount);
router.put('/bank-account', profileController.updateBankAccount);

// Notification Settings Endpoints
router.get('/notifications', profileController.getNotificationSettings);
router.put('/notifications', profileController.updateNotificationSettings);

// Address Endpoints
router.put('/address', profileController.updateAddress);
router.put('/:id/address', profileController.updateAddress);

// KYC Endpoints
router.put('/kyc', profileController.updateKYC);
router.put('/:id/kyc', profileController.updateKYC);

// Base Profile GET & PUT Endpoints
router.get('/', profileController.getProfile);
router.get('/:id', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.put('/:id', profileController.updateProfile);

export default router;
