import { SupportRepository, supportRepository } from './support.repository.js';
import { CreateTicketDTO, TicketQueryDTO, CreateReplyDTO } from './dto/support.dto.js';
import {
  SupportTicketResponse,
  SupportReplyResponse,
  TicketListResponse,
  FAQResponse,
} from './interfaces/support.interface.js';
import { ISupportTicket } from '../../../shared/models/SupportTicket.js';
import { ISupportReply } from '../../../shared/models/SupportReply.js';
import { sharedNotificationService } from '../../../shared/services/notification.service.js';

export const PROCESSOR_SUPPORT_CATEGORIES = [
  'Incoming Produce Quality Inspection Dispute',
  'Outgoing Shipment Issue',
  'Escrow Payment Issue',
  'Wallet Issue',
  'Invoice Issue',
  'Marketplace Issue',
  'Processing Hub Issue',
  'Technical Issue',
  'Other',
];

export class SupportService {
  constructor(private repository: SupportRepository = supportRepository) {}

  private mapReplyToResponse(reply: ISupportReply): SupportReplyResponse {
    return {
      id: reply._id.toString(),
      ticketId: reply.ticketId.toString(),
      senderId: reply.senderId.toString(),
      senderRole: reply.senderRole,
      senderName: reply.senderName,
      message: reply.message,
      attachmentUrl: reply.attachmentUrl,
      timestamp: reply.timestamp || reply.createdAt,
    };
  }

  private mapTicketToResponse(ticket: ISupportTicket, replies?: ISupportReply[]): SupportTicketResponse {
    const mappedReplies = replies ? replies.map((r) => this.mapReplyToResponse(r)) : undefined;
    const latestReply = mappedReplies && mappedReplies.length > 0 ? mappedReplies[mappedReplies.length - 1].message : undefined;

    return {
      id: ticket._id.toString(),
      ticketNumber: ticket.ticketNumber,
      processorId: ticket.userId.toString(),
      role: ticket.role,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      subject: ticket.subject,
      description: ticket.description,
      referenceType: ticket.referenceType,
      referenceId: ticket.referenceId,
      assignedStaff: ticket.assignedTo ? ticket.assignedTo.toString() : 'Senior Platform Support Officer',
      replies: mappedReplies,
      latestReply,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }

  async createTicket(processorIdentifier: string, dto: CreateTicketDTO): Promise<SupportTicketResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const ticket = await this.repository.createTicket({
      userId: user._id,
      role: 'PROCESSOR',
      category: dto.category.trim(),
      priority: dto.priority || 'MEDIUM',
      subject: dto.subject.trim(),
      description: dto.description.trim(),
      referenceType: dto.referenceType || 'OTHER',
      referenceId: dto.referenceId,
      status: 'OPEN',
    });

    // Create initial conversation reply
    await this.repository.createReply({
      ticketId: ticket._id,
      senderId: user._id,
      senderRole: 'PROCESSOR',
      senderName: user.fullName || 'Processor Desk',
      message: dto.description.trim(),
      attachmentUrl: dto.attachmentUrl,
    });

    // Send notification
    try {
      await sharedNotificationService.createNotification({
        userId: user._id,
        role: 'PROCESSOR',
        title: `Support Ticket Raised: #${ticket.ticketNumber}`,
        message: `Your support ticket #${ticket.ticketNumber} (${ticket.subject}) has been logged. Our help desk officer will inspect within 15 minutes.`,
        notificationType: 'SUPPORT_TICKET',
        referenceType: 'SUPPORT_TICKET',
        referenceId: ticket._id.toString(),
        clickDestination: '/support',
      });
    } catch (e) {
      console.warn('Failed to send notification:', e);
    }

    return this.mapTicketToResponse(ticket);
  }

  async getTickets(processorIdentifier: string, query?: TicketQueryDTO): Promise<TicketListResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const { tickets, total } = await this.repository.findTicketsByProcessorId(user._id, query);
    const limit = query?.limit || 50;
    const page = query?.page || 1;

    const mappedTickets = await Promise.all(
      tickets.map(async (t) => {
        const replies = await this.repository.findRepliesByTicketId(t._id);
        return this.mapTicketToResponse(t, replies);
      })
    );

    return {
      tickets: mappedTickets,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async getTicketDetails(processorIdentifier: string, idOrNumber: string): Promise<SupportTicketResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const ticket = await this.repository.findTicketByIdOrNumber(idOrNumber);
    if (!ticket) {
      throw new Error(`Support ticket '${idOrNumber}' not found`);
    }

    const replies = await this.repository.findRepliesByTicketId(ticket._id);
    return this.mapTicketToResponse(ticket, replies);
  }

  async replyToTicket(processorIdentifier: string, ticketIdOrNumber: string, dto: CreateReplyDTO): Promise<SupportReplyResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const ticket = await this.repository.findTicketByIdOrNumber(ticketIdOrNumber);
    if (!ticket) {
      throw new Error(`Support ticket '${ticketIdOrNumber}' not found`);
    }

    if (ticket.status === 'CLOSED') {
      throw new Error(`Support ticket #${ticket.ticketNumber} is CLOSED and cannot accept new replies.`);
    }

    const reply = await this.repository.createReply({
      ticketId: ticket._id,
      senderId: user._id,
      senderRole: 'PROCESSOR',
      senderName: user.fullName || 'Processor',
      message: dto.message.trim(),
      attachmentUrl: dto.attachmentUrl,
    });

    // Update ticket status to WAITING_FOR_USER or keep IN_PROGRESS
    await this.repository.updateTicket(ticket._id.toString(), {
      status: 'IN_PROGRESS',
    });

    return this.mapReplyToResponse(reply);
  }

  async closeTicket(processorIdentifier: string, ticketIdOrNumber: string): Promise<SupportTicketResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const ticket = await this.repository.findTicketByIdOrNumber(ticketIdOrNumber);
    if (!ticket) {
      throw new Error(`Support ticket '${ticketIdOrNumber}' not found`);
    }

    const updatedTicket = await this.repository.updateTicket(ticket._id.toString(), {
      status: 'CLOSED',
      closedAt: new Date(),
    });

    if (!updatedTicket) {
      throw new Error('Failed to update ticket status');
    }

    // Send notification
    try {
      await sharedNotificationService.createNotification({
        userId: user._id,
        role: 'PROCESSOR',
        title: `Ticket Closed: #${ticket.ticketNumber}`,
        message: `Support ticket #${ticket.ticketNumber} has been closed. Thank you for using Seed2Shelf platform support.`,
        notificationType: 'SUPPORT_TICKET',
        referenceType: 'SUPPORT_TICKET',
        referenceId: ticket._id.toString(),
        clickDestination: '/support',
      });
    } catch (e) {
      console.warn('Failed to send notification:', e);
    }

    const replies = await this.repository.findRepliesByTicketId(updatedTicket._id);
    return this.mapTicketToResponse(updatedTicket, replies);
  }

  async getFAQs(): Promise<FAQResponse[]> {
    const faqs = await this.repository.findFAQs();
    if (faqs.length > 0) {
      return faqs.map((f) => ({
        id: f._id.toString(),
        role: f.role,
        category: f.category,
        question: f.question,
        answer: f.answer,
        displayOrder: f.displayOrder,
      }));
    }

    // Fallback default Processor FAQs if database collection is empty
    return [
      {
        id: 'faq-proc-01',
        role: 'PROCESSOR',
        category: 'Quality Inspection',
        question: 'How do I accept or reject incoming farmer shipments?',
        answer: 'Go to Processor Hub ➔ Shipments & Logistics. Under Incoming Shipments ➔ Pending Dispatches, inspect the incoming cargo and click Accept Delivery to release escrow, or Reject Delivery to log a quality failure reason and return cargo.',
        displayOrder: 1,
      },
      {
        id: 'faq-proc-02',
        role: 'PROCESSOR',
        category: 'Transformation',
        question: 'How is raw input produce transformed into processed goods?',
        answer: 'Go to Processor Hub ➔ Transformation. Select the raw harvest batch, enter conversion quantities, processing method, and output batch numbers to generate transparent blockchain lineage.',
        displayOrder: 2,
      },
      {
        id: 'faq-proc-03',
        role: 'PROCESSOR',
        category: 'Escrow Settlement',
        question: 'How do I settle escrow payments with distributors?',
        answer: 'Distributor orders are protected by smart contracts. Once the distributor verifies intake at their warehouse, escrow funds are automatically credited to your Processor Wallet.',
        displayOrder: 3,
      },
    ];
  }

  getCategories(): string[] {
    return PROCESSOR_SUPPORT_CATEGORIES;
  }
}

export const supportService = new SupportService();
