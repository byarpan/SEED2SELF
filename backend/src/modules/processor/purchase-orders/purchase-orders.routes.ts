import { Router } from 'express';
import { purchaseOrdersController } from './purchase-orders.controller.js';
import { PurchaseOrdersValidator } from './purchase-orders.validator.js';

const router = Router();

// GET /api/v1/processor/purchase-orders
router.get('/', PurchaseOrdersValidator.validateQueryParameters, purchaseOrdersController.getAllOrders);

// GET /api/v1/processor/purchase-orders/pending
router.get('/pending', PurchaseOrdersValidator.validateQueryParameters, purchaseOrdersController.getPendingOrders);

// GET /api/v1/processor/purchase-orders/accepted
router.get('/accepted', PurchaseOrdersValidator.validateQueryParameters, purchaseOrdersController.getAcceptedOrders);

// GET /api/v1/processor/purchase-orders/:id
router.get('/:id', PurchaseOrdersValidator.validateOrderIdParam, purchaseOrdersController.getOrderDetails);

// POST & PATCH /api/v1/processor/purchase-orders/:id/accept
router.post('/:id/accept', PurchaseOrdersValidator.validateOrderIdParam, purchaseOrdersController.acceptOrder);
router.patch('/:id/accept', PurchaseOrdersValidator.validateOrderIdParam, purchaseOrdersController.acceptOrder);

// POST & PATCH /api/v1/processor/purchase-orders/:id/reject
router.post(
  '/:id/reject',
  PurchaseOrdersValidator.validateOrderIdParam,
  PurchaseOrdersValidator.validateRejectOrderBody,
  purchaseOrdersController.rejectOrder
);
router.patch(
  '/:id/reject',
  PurchaseOrdersValidator.validateOrderIdParam,
  PurchaseOrdersValidator.validateRejectOrderBody,
  purchaseOrdersController.rejectOrder
);

// POST & PATCH /api/v1/processor/purchase-orders/:id/start-delivery
router.post(
  '/:id/start-delivery',
  PurchaseOrdersValidator.validateOrderIdParam,
  PurchaseOrdersValidator.validateStartDeliveryBody,
  purchaseOrdersController.startDelivery
);
router.patch(
  '/:id/start-delivery',
  PurchaseOrdersValidator.validateOrderIdParam,
  PurchaseOrdersValidator.validateStartDeliveryBody,
  purchaseOrdersController.startDelivery
);

export default router;
