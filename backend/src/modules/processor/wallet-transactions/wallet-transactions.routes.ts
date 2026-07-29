import { Router } from 'express';
import { processorWalletTransactionsController } from './wallet-transactions.controller.js';
import { ProcessorWalletTransactionsValidator } from './wallet-transactions.validator.js';

const router = Router();

// GET /api/v1/processor/wallet-transactions (List with search and filter support)
router.get(
  '/',
  ProcessorWalletTransactionsValidator.validateQueryParams,
  processorWalletTransactionsController.getTransactionHistory
);

router.get(
  '/user/:id',
  ProcessorWalletTransactionsValidator.validateQueryParams,
  processorWalletTransactionsController.getTransactionHistory
);

// GET /api/v1/processor/wallet-transactions/details/:transactionId
router.get(
  '/details/:transactionId',
  processorWalletTransactionsController.getTransactionById
);

// GET /api/v1/processor/wallet-transactions/:transactionId
router.get(
  '/:transactionId',
  processorWalletTransactionsController.getTransactionById
);

export default router;
