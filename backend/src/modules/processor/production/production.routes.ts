import { Router } from 'express';
import { ProductionController } from './production.controller.js';
import { ProductionValidator } from './production.validator.js';

const router = Router();
const controller = new ProductionController();

// 1. Register New Processed Product
router.post('/register', ProductionValidator.validateRegister, controller.registerProcessedProduct);

// 2. Views: Processed Products, Purchased Harvests, History
router.get('/processed-products', controller.getProcessedProducts);
router.get('/purchased-harvests', controller.getPurchasedHarvests);
router.get('/history', controller.getHistory);

// 3. Product Operations: Get, Update, Delete, Toggle List/Unlist Status
router.put('/product/:id', ProductionValidator.validateUpdate, controller.updateProcessedProduct);
router.delete('/product/:id', controller.deleteProcessedProduct);
router.patch('/product/:id/list', (req, res, next) => {
  req.body.action = 'LIST';
  next();
}, controller.toggleListStatus);
router.patch('/product/:id/unlist', (req, res, next) => {
  req.body.action = 'UNLIST';
  next();
}, controller.toggleListStatus);

// 4. QR Code & Traceability Link
router.get('/qr/:batchId', controller.getQrDetails);

export default router;
