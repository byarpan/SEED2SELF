import { Router } from 'express';
import { supportController } from './support.controller.js';
import { SupportValidator } from './support.validator.js';

const router = Router();

// GET /api/v1/processor/support/categories
router.get('/categories', supportController.getCategories);

// GET /api/v1/processor/support/faqs
router.get('/faqs', supportController.getFAQs);

// POST /api/v1/processor/support/tickets (Raise Support Ticket)
router.post('/tickets', SupportValidator.validateCreateTicketBody, supportController.createTicket);

// GET /api/v1/processor/support/tickets (Get My Tickets)
router.get('/tickets', supportController.getTickets);

// GET /api/v1/processor/support/tickets/:id (Get Ticket Details with Replies)
router.get('/tickets/:id', SupportValidator.validateTicketIdParam, supportController.getTicketDetails);

// POST /api/v1/processor/support/tickets/:id/replies (Reply to Ticket)
router.post(
  '/tickets/:id/replies',
  SupportValidator.validateTicketIdParam,
  SupportValidator.validateReplyBody,
  supportController.replyToTicket
);

// POST & PATCH /api/v1/processor/support/tickets/:id/close (Close Ticket)
router.post('/tickets/:id/close', SupportValidator.validateTicketIdParam, supportController.closeTicket);
router.patch('/tickets/:id/close', SupportValidator.validateTicketIdParam, supportController.closeTicket);

export default router;
