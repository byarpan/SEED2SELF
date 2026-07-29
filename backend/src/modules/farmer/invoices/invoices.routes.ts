import { Router } from 'express';
import { invoicesController } from './invoices.controller.js';

const router = Router();

// GET /api/v1/farmer/invoices (List invoices with search & category filter)
router.get('/', invoicesController.getInvoices);

// GET /api/v1/farmer/invoices/:id (Detailed view of specific invoice)
router.get('/:id', invoicesController.getInvoiceDetails);

// GET /api/v1/farmer/invoices/:id/download (Download invoice document as PDF)
router.get('/:id/download', invoicesController.downloadInvoice);

export default router;
