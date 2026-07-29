import { Router } from 'express';
import { dashboardController } from './dashboard.controller.js';

const router = Router();

// GET /api/v1/farmer/dashboard
router.get('/', dashboardController.getDashboard);

// PUT /api/v1/farmer/dashboard
router.put('/', dashboardController.updateFarmDetails);

export default router;
