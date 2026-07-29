import { Router } from 'express';
import { shipmentController } from './shipment.controller.js';

const router = Router();

// POST /api/v1/farmer/shipment (Start / Create Shipment)
router.post('/', shipmentController.startShipment);

// GET /api/v1/farmer/shipment/active (Get Active Dispatches)
router.get('/active', shipmentController.getActiveDispatches);

// GET /api/v1/farmer/shipment/history (Get Shipment History)
router.get('/history', shipmentController.getShipmentHistory);

// GET /api/v1/farmer/shipment/accepted (Get Accepted Shipments)
router.get('/accepted', shipmentController.getAcceptedShipments);

// GET /api/v1/farmer/shipment/rejected (Get Rejected Shipments)
router.get('/rejected', shipmentController.getRejectedShipments);

// GET /api/v1/farmer/shipment/:id (Get Shipment Details)
router.get('/:id', shipmentController.getShipmentDetails);

// GET /api/v1/farmer/shipment/:id/track (Live Logistics Route Tracking)
router.get('/:id/track', shipmentController.trackShipment);

// PUT /api/v1/farmer/shipment/:id/inspection (Processor Inspection Decision Handoff)
router.put('/:id/inspection', shipmentController.processInspection);

export default router;
