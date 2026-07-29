import { Router } from 'express';
import farmerDashboardRoutes from '../modules/farmer/dashboard/dashboard.routes.js';
import farmerHarvestRoutes from '../modules/farmer/harvest/harvest.routes.js';
import farmerInvoiceRoutes from '../modules/farmer/invoices/invoices.routes.js';
import farmerPurchaseOrdersRoutes from '../modules/farmer/purchase-orders/purchase-orders.routes.js';
import farmerReportsRoutes from '../modules/farmer/reports/reports.routes.js';
import farmerShipmentRoutes from '../modules/farmer/shipment/shipment.routes.js';
import farmerWalletRoutes from '../modules/farmer/wallet/wallet.routes.js';
import farmerWalletTransactionsRoutes from '../modules/farmer/wallet-transactions/wallet-transactions.routes.js';
import farmerProfileRoutes from '../modules/farmer/profile/profile.routes.js';
import processorProfileRoutes from '../modules/processor/profile/processor-profile.routes.js';
import processorWalletRoutes from '../modules/processor/wallet/wallet.routes.js';
import processorWalletTransactionsRoutes from '../modules/processor/wallet-transactions/wallet-transactions.routes.js';
import processorInvoicesRoutes from '../modules/processor/invoices/invoices.routes.js';
import processorMarketplaceRoutes from '../modules/processor/marketplace/marketplace.routes.js';
import processorProductionRoutes from '../modules/processor/production/production.routes.js';
import processorPurchaseOrdersRoutes from '../modules/processor/purchase-orders/purchase-orders.routes.js';
import processorShipmentRoutes from '../modules/processor/shipment/shipment.routes.js';
import processorReportsRoutes from '../modules/processor/reports/reports.routes.js';
import processorSupportRoutes from '../modules/processor/support/support.routes.js';
import notificationRoutes from '../modules/notifications/notification.routes.js';
import publicTraceabilityRoutes from '../modules/public/traceability/traceability.routes.js';
import supportRoutes from '../modules/support/support.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import mediaRoutes from '../modules/media/media.routes.js';
import adminRoutes from '../modules/admin/admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);

router.use('/farmer/dashboard', farmerDashboardRoutes);
router.use('/farmer/harvest', farmerHarvestRoutes);
router.use('/farmer/invoices', farmerInvoiceRoutes);
router.use('/farmer/purchase-orders', farmerPurchaseOrdersRoutes);
router.use('/farmer/reports', farmerReportsRoutes);
router.use('/farmer/shipment', farmerShipmentRoutes);
router.use('/farmer/wallet', farmerWalletRoutes);
router.use('/farmer/wallet-transactions', farmerWalletTransactionsRoutes);

router.use('/farmer/profile', farmerProfileRoutes);
router.use('/processor/profile', processorProfileRoutes);
router.use('/processor/wallet', processorWalletRoutes);
router.use('/processor/wallet-transactions', processorWalletTransactionsRoutes);
router.use('/processor/invoices', processorInvoicesRoutes);
router.use('/processor/marketplace', processorMarketplaceRoutes);
router.use('/processor/production', processorProductionRoutes);
router.use('/processor/purchase-orders', processorPurchaseOrdersRoutes);
router.use('/processor/shipment', processorShipmentRoutes);
router.use('/processor/reports', processorReportsRoutes);
router.use('/processor/support', processorSupportRoutes);

router.use('/notifications', notificationRoutes);
router.use('/traceability', publicTraceabilityRoutes);
router.use('/public/traceability', publicTraceabilityRoutes);
router.use('/support', supportRoutes);
router.use('/media', mediaRoutes);

export default router;
