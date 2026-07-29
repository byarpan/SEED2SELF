import { Router } from 'express';
import { traceabilityController } from './traceability.controller.js';

const router = Router();

// GET /api/v1/traceability/search/:batchId (Public Traceability Search)
router.get('/search/:batchId', traceabilityController.searchBatch);

// GET /api/v1/traceability/lineage/:batchId (Supply Chain Lineage Tree)
router.get('/lineage/:batchId', traceabilityController.getLineageTree);

// GET /api/v1/traceability/stage/farmer/:batchId (Farmer Origin Stage Details)
router.get('/stage/farmer/:batchId', traceabilityController.getFarmerStage);

// GET /api/v1/traceability/stage/processor/:batchId (Processor Stage Details)
router.get('/stage/processor/:batchId', traceabilityController.getProcessorStage);

// GET /api/v1/traceability/stage/distributor/:batchId (Distributor Stage Details)
router.get('/stage/distributor/:batchId', traceabilityController.getDistributorStage);

// GET /api/v1/traceability/stage/retailer/:batchId (Retailer Stage Details)
router.get('/stage/retailer/:batchId', traceabilityController.getRetailerStage);

// GET /api/v1/traceability/passport/:batchId (Digital Product Passport)
router.get('/passport/:batchId', traceabilityController.getDigitalPassport);

// GET /api/v1/traceability/qr/:batchId (Dynamic QR Code Data URL)
router.get('/qr/:batchId', traceabilityController.getQR);

// GET /api/v1/traceability/qr/:batchId/download (Download QR Image)
router.get('/qr/:batchId/download', traceabilityController.downloadQR);

export default router;
