import { Router } from 'express';
import { shipmentController } from './shipment.controller.js';
import { ShipmentValidator } from './shipment.validator.js';

const router = Router();

// GET /api/v1/processor/shipment/counts
router.get('/counts', shipmentController.getShipmentCounts);

// GET /api/v1/processor/shipment/incoming
router.get('/incoming', ShipmentValidator.validateQueryParameters, shipmentController.getIncomingShipments);

// GET /api/v1/processor/shipment/outgoing
router.get('/outgoing', ShipmentValidator.validateQueryParameters, shipmentController.getOutgoingShipments);

// GET /api/v1/processor/shipment/:id
router.get('/:id', ShipmentValidator.validateShipmentIdParam, shipmentController.getShipmentDetails);

// POST & PATCH /api/v1/processor/shipment/:id/accept
router.post('/:id/accept', ShipmentValidator.validateShipmentIdParam, shipmentController.acceptDelivery);
router.patch('/:id/accept', ShipmentValidator.validateShipmentIdParam, shipmentController.acceptDelivery);

// POST & PATCH /api/v1/processor/shipment/:id/reject
router.post(
  '/:id/reject',
  ShipmentValidator.validateShipmentIdParam,
  ShipmentValidator.validateRejectDeliveryBody,
  shipmentController.rejectDelivery
);
router.patch(
  '/:id/reject',
  ShipmentValidator.validateShipmentIdParam,
  ShipmentValidator.validateRejectDeliveryBody,
  shipmentController.rejectDelivery
);

export default router;
