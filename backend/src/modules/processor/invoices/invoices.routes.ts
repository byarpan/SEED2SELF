import { Router } from 'express';
import { processorInvoicesController } from './invoices.controller.js';
import { ProcessorInvoicesValidator } from './invoices.validator.js';

const router = Router();

// GET /api/v1/processor/invoices (List processor invoices with search & category support)
router.get(
  '/',
  ProcessorInvoicesValidator.validateQuery,
  processorInvoicesController.getInvoiceList
);

router.get(
  '/user/:id',
  ProcessorInvoicesValidator.validateQuery,
  processorInvoicesController.getInvoiceList
);

// GET /api/v1/processor/invoices/:id/download (Download PDF)
router.get('/:id/download', processorInvoicesController.downloadInvoice);

// GET /api/v1/processor/invoices/:id (Get invoice details)
router.get('/:id', processorInvoicesController.getInvoiceDetails);

export default router;
