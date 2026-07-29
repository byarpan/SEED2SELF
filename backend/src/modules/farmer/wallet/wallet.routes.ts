import { Router } from 'express';
import { walletController } from './wallet.controller.js';

const router = Router();

// GET /api/v1/farmer/wallet/dashboard
router.get('/dashboard', walletController.getDashboard);

// POST /api/v1/farmer/wallet/withdraw (Withdraw wallet balance to bank account)
router.post('/withdraw', walletController.withdrawFunds);

// GET /api/v1/farmer/wallet/bank-account
router.get('/bank-account', walletController.getBankAccount);

// PUT /api/v1/farmer/wallet/bank-account (Add or update settlement bank account)
router.put('/bank-account', walletController.updateBankAccount);

// GET /api/v1/farmer/wallet/summary (Lifetime, Yearly, Monthly, Weekly calculations)
router.get('/summary', walletController.getFinancialSummary);

// GET /api/v1/farmer/wallet/escrow (Locked amounts & active escrow items)
router.get('/escrow', walletController.getEscrowDetails);

// GET /api/v1/farmer/wallet/analytics (Crop & Variety revenue breakdown)
router.get('/analytics', walletController.getCropAnalytics);

export default router;
