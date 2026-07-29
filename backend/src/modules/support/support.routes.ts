import { Router } from 'express';
import { supportController } from './support.controller.js';

const router = Router();

// GET /api/v1/support/categories (Get Role-configured Categories)
router.get('/categories', supportController.getCategories);

// GET /api/v1/support/faqs (Get Role-filtered FAQs)
router.get('/faqs', supportController.getFAQs);

// GET /api/v1/support/priorities (Get Priority Enum Options)
router.get('/priorities', supportController.getPriorities);

// GET /api/v1/support/statuses (Get Ticket Status Enum Options)
router.get('/statuses', supportController.getStatuses);

// POST /api/v1/support/tickets (Create Support Ticket)
router.post('/tickets', supportController.createTicket);

// GET /api/v1/support/tickets (Get Support Tickets List)
router.get('/tickets', supportController.getTickets);

// GET /api/v1/support/tickets/:ticketId (Get Support Ticket Details & Reply Thread)
router.get('/tickets/:ticketId', supportController.getTicketDetails);

// PATCH /api/v1/support/tickets/:ticketId (Update Support Ticket Status)
router.patch('/tickets/:ticketId', supportController.updateTicketStatus);

// POST /api/v1/support/tickets/:ticketId/reply (Add Reply to Support Ticket Thread)
router.post('/tickets/:ticketId/reply', supportController.addReply);

export default router;
