import { Router } from 'express';
import { processorMarketplaceController } from './marketplace.controller.js';
import { ProcessorMarketplaceValidator } from './marketplace.validator.js';

const router = Router();

// Marketplace Listing & Details
router.get('/', processorMarketplaceController.getAvailableHarvests);
router.get('/products/:id', processorMarketplaceController.getHarvestDetails);

// Shopping Cart Endpoints
router.get('/cart', processorMarketplaceController.getCart);
router.post(
  '/cart',
  ProcessorMarketplaceValidator.validateAddToCart,
  processorMarketplaceController.addToCart
);
router.put(
  '/cart',
  ProcessorMarketplaceValidator.validateUpdateCartQuantity,
  processorMarketplaceController.updateCartQuantity
);
router.delete('/cart/:harvestId', processorMarketplaceController.removeFromCart);

// Factory Delivery Addresses Endpoints
router.get('/factories', processorMarketplaceController.getFactories);
router.post(
  '/factories',
  ProcessorMarketplaceValidator.validateCreateFactory,
  processorMarketplaceController.createFactory
);
router.put('/factories/:id', processorMarketplaceController.updateFactory);
router.delete('/factories/:id', processorMarketplaceController.deleteFactory);

// Razorpay Payment & Order Creation Endpoints
router.post('/payment/initiate', processorMarketplaceController.initiatePayment);
router.post(
  '/payment/verify',
  ProcessorMarketplaceValidator.validateVerifyPayment,
  processorMarketplaceController.verifyPayment
);

// Order Confirmation Endpoint
router.get('/confirmation/:orderId', processorMarketplaceController.getOrderConfirmation);

export default router;
