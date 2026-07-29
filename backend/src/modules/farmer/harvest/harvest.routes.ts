import { Router } from 'express';
import { harvestController } from './harvest.controller.js';

const router = Router();

// POST /api/v1/farmer/harvest (Register Harvest Batch)
router.post('/', harvestController.registerHarvest);

// GET /api/v1/farmer/harvest (Get Active Harvests Inventory)
router.get('/', harvestController.getActiveHarvests);

// GET /api/v1/farmer/harvest/history (Get Sold Harvest History)
router.get('/history', harvestController.getHarvestHistory);

// GET /api/v1/farmer/harvest/:id (Get Harvest Details by ID or Batch ID)
router.get('/:id', harvestController.getHarvestDetails);

// PUT /api/v1/farmer/harvest/:id (Update Harvest Details)
router.put('/:id', harvestController.updateHarvest);

// DELETE /api/v1/farmer/harvest/:id (Delete Harvest Batch)
router.delete('/:id', harvestController.deleteHarvest);

// PUT /api/v1/farmer/harvest/:id/list (List Product on Marketplace)
router.put('/:id/list', harvestController.listHarvest);

// PUT /api/v1/farmer/harvest/:id/unlist (Unlist Product from Marketplace)
router.put('/:id/unlist', harvestController.unlistHarvest);

// GET /api/v1/farmer/harvest/:id/qr (Get Dynamic QR Code & Trace URL)
router.get('/:id/qr', harvestController.getQR);

export default router;
