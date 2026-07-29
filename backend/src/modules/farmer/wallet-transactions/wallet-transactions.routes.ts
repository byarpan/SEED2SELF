import { Router } from 'express';
import { walletTransactionsController } from './wallet-transactions.controller.js';

const router = Router();

// GET /api/v1/farmer/wallet-transactions (List history with search & filter)
router.get('/', walletTransactionsController.getTransactionHistory);

// GET /api/v1/farmer/wallet-transactions/:id (Detailed view of transaction & transfer info)
router.get('/:id', walletTransactionsController.getTransactionDetails);

export default router;
