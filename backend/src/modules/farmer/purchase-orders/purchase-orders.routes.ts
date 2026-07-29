import { Router } from 'express';
import { purchaseOrdersController } from './purchase-orders.controller.js';

const router = Router();

// POST /api/v1/farmer/purchase-orders (Place/Create Purchase Order)
router.post('/', purchaseOrdersController.createOrder);

// GET /api/v1/farmer/purchase-orders (Get All Farmer Purchase Orders)
router.get('/', purchaseOrdersController.getAllOrders);

// GET /api/v1/farmer/purchase-orders/pending (Get Pending Orders Awaiting Farmer Acceptance)
router.get('/pending', purchaseOrdersController.getPendingOrders);

// GET /api/v1/farmer/purchase-orders/accepted (Get Accepted Orders)
router.get('/accepted', purchaseOrdersController.getAcceptedOrders);

// GET /api/v1/farmer/purchase-orders/:id (Get Specific Purchase Order Details)
router.get('/:id', purchaseOrdersController.getOrderDetails);

// PUT /api/v1/farmer/purchase-orders/:id/accept (Accept Purchase Order)
router.put('/:id/accept', purchaseOrdersController.acceptOrder);

// PUT /api/v1/farmer/purchase-orders/:id/reject (Reject Purchase Order)
router.put('/:id/reject', purchaseOrdersController.rejectOrder);

// PUT /api/v1/farmer/purchase-orders/:id/start-delivery (Start Delivery & Dispatch Order)
router.put('/:id/start-delivery', purchaseOrdersController.startDelivery);

export default router;
