import { Router } from 'express';
import { adminController } from './admin.controller.js';
import { authenticateJWT, authorizeRoles } from '../../shared/middleware/auth.middleware.js';

const router = Router();

// Unprotected Admin Login Endpoint
router.post('/auth/login', adminController.adminLogin);

// Protected Admin Routes (Requires valid JWT & ADMIN role)
router.use(authenticateJWT as any);
router.use(authorizeRoles('ADMIN') as any);

// GET /api/v1/admin/dashboard (Dashboard statistics & platform metrics)
router.get('/dashboard', adminController.getDashboard);

// GET /api/v1/admin/users (Universal User Management)
router.get('/users', adminController.getUsers);

// PUT /api/v1/admin/users/status (Disable, Enable, Suspend User Accounts)
router.put('/users/status', adminController.updateUserStatus);

// GET /api/v1/admin/kyc (Universal KYC Applications List)
router.get('/kyc', adminController.getKYCList);

// PUT /api/v1/admin/kyc/verify (Evaluate & Verify User KYC Application)
router.put('/kyc/verify', adminController.verifyKYC);

// GET /api/v1/admin/orders (Platform Orders Monitoring)
router.get('/orders', adminController.getOrdersList);

// GET /api/v1/admin/payments (Escrow & Payments Statistics)
router.get('/payments', adminController.getPaymentsList);

// GET /api/v1/admin/wallets (Wallets & Balances Monitor)
router.get('/wallets', adminController.getWalletsList);

// Support Management Routes
router.get('/support/tickets', adminController.getTickets);
router.post('/support/tickets/:ticketId/reply', adminController.replyToTicket);
router.put('/support/tickets/:ticketId/status', adminController.updateTicketStatus);

// Reports & Complaints Routes
router.get('/reports', adminController.getReports);
router.put('/reports/:reportId/status', adminController.updateReportStatus);

// Analytics & Metrics
router.get('/analytics', adminController.getAnalyticsData);

// Admin System Notifications
router.get('/notifications', adminController.getNotifications);

// GET /api/v1/admin/audit-logs (System-wide Admin Audit Logs)
router.get('/audit-logs', adminController.getAuditLogs);

// GET /api/v1/admin/search (Global Platform Admin Search)
router.get('/search', adminController.globalSearch);

export default router;
