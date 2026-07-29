import { Router } from 'express';
import { reportsController } from './reports.controller.js';

const router = Router();

// GET /api/v1/farmer/reports (Get Analytics Summary with timeframe query)
router.get('/', reportsController.getSummary);

// GET /api/v1/farmer/reports/weekly (Get Weekly Report)
router.get('/weekly', reportsController.getWeeklyReport);

// GET /api/v1/farmer/reports/monthly (Get Monthly Report)
router.get('/monthly', reportsController.getMonthlyReport);

// GET /api/v1/farmer/reports/yearly (Get Yearly Report)
router.get('/yearly', reportsController.getYearlyReport);

// GET /api/v1/farmer/reports/trend (Get Revenue & Volume Trend)
router.get('/trend', reportsController.getRevenueTrend);

// GET /api/v1/farmer/reports/crop-share (Get Crop Revenue Breakdown)
router.get('/crop-share', reportsController.getCropShare);

// GET /api/v1/farmer/reports/export/csv (Export CSV Report)
router.get('/export/csv', reportsController.exportCSV);

// GET /api/v1/farmer/reports/export/pdf (Download PDF Report)
router.get('/export/pdf', reportsController.exportPDF);

export default router;
