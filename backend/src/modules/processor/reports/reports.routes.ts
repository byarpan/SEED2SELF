import { Router } from 'express';
import { reportsController } from './reports.controller.js';
import { ReportsValidator } from './reports.validator.js';

const router = Router();

// GET /api/v1/processor/reports
router.get('/', ReportsValidator.validateTimeframeQuery, reportsController.getAnalytics);

// GET /api/v1/processor/reports/summary
router.get('/summary', ReportsValidator.validateTimeframeQuery, reportsController.getSummary);

// GET /api/v1/processor/reports/trend
router.get('/trend', ReportsValidator.validateTimeframeQuery, reportsController.getRevenueTrend);

// GET /api/v1/processor/reports/product-share
router.get('/product-share', ReportsValidator.validateTimeframeQuery, reportsController.getProductShare);

// GET /api/v1/processor/reports/export/csv
router.get('/export/csv', ReportsValidator.validateTimeframeQuery, reportsController.exportCSV);

// GET /api/v1/processor/reports/export/pdf
router.get('/export/pdf', ReportsValidator.validateTimeframeQuery, reportsController.downloadPDF);

export default router;
