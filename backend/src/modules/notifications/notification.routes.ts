import { Router } from 'express';
import { notificationController } from './notification.controller.js';

const router = Router();

// GET /api/v1/notifications (Get All User Notifications)
router.get('/', notificationController.getNotifications);

// GET /api/v1/notifications/unread (Get Unread Notifications & Count)
router.get('/unread', notificationController.getUnreadNotifications);

// PATCH & POST /api/v1/notifications/read-all (Mark All Notifications as Read)
router.patch('/read-all', notificationController.markAllAsRead);
router.post('/read-all', notificationController.markAllAsRead);

// PATCH /api/v1/notifications/:id/read (Mark Single Notification as Read)
router.patch('/:id/read', notificationController.markAsRead);

// DELETE /api/v1/notifications/:id (Delete Notification)
router.delete('/:id', notificationController.deleteNotification);

export default router;
