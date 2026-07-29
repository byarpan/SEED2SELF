import { Router } from 'express';
import { processorWalletController } from './wallet.controller.js';
import { ProcessorWalletValidator } from './wallet.validator.js';

const router = Router();

// GET /api/v1/processor/wallet/dashboard or /dashboard/:id
router.get(
  '/dashboard',
  ProcessorWalletValidator.validateTimeframeQuery,
  processorWalletController.getDashboard
);
router.get(
  '/dashboard/:id',
  ProcessorWalletValidator.validateTimeframeQuery,
  processorWalletController.getDashboard
);

// Bank Account Endpoints
router.get('/bank-account', processorWalletController.getBankAccount);
router.get('/bank-account/:id', processorWalletController.getBankAccount);
router.post(
  '/bank-account',
  ProcessorWalletValidator.validateBankAccountUpdate,
  processorWalletController.updateBankAccount
);
router.post(
  '/bank-account/:id',
  ProcessorWalletValidator.validateBankAccountUpdate,
  processorWalletController.updateBankAccount
);
router.put(
  '/bank-account',
  ProcessorWalletValidator.validateBankAccountUpdate,
  processorWalletController.updateBankAccount
);
router.put(
  '/bank-account/:id',
  ProcessorWalletValidator.validateBankAccountUpdate,
  processorWalletController.updateBankAccount
);

// Escrow Details Endpoints
router.get('/escrow', processorWalletController.getEscrowDetails);
router.get('/escrow/:id', processorWalletController.getEscrowDetails);
router.post(
  '/escrow',
  ProcessorWalletValidator.validateAddEscrowItem,
  processorWalletController.addEscrowItem
);
router.post(
  '/escrow/:id',
  ProcessorWalletValidator.validateAddEscrowItem,
  processorWalletController.addEscrowItem
);

// Product Analytics Endpoints
router.get('/analytics/products', processorWalletController.getProductAnalytics);
router.get('/analytics/products/:id', processorWalletController.getProductAnalytics);

// Transaction History Endpoints
router.get('/transactions', processorWalletController.getTransactions);
router.get('/transactions/:id', processorWalletController.getTransactions);
router.post('/transactions', processorWalletController.addTransaction);
router.post('/transactions/:id', processorWalletController.addTransaction);

export default router;
