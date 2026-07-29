import { SupportRepository, supportRepository } from './support.repository.js';
import { CreateTicketDTO, UpdateTicketStatusDTO, AddReplyDTO, TicketQueryDTO, FAQQueryDTO } from './dto/support.dto.js';
import {
  SupportTicketResponse,
  SupportReplyResponse,
  SupportListResponse,
  FAQResponse,
  CategoryResponse,
} from './interfaces/support.interface.js';
import { ISupportTicket } from '../../shared/models/SupportTicket.js';
import { ISupportReply } from '../../shared/models/SupportReply.js';
import { IFAQ } from '../../shared/models/FAQ.js';
import { generateTicketId } from '../../shared/helpers/sequence.helper.js';

export class SupportService {
  constructor(private repository: SupportRepository = supportRepository) {
    this.seedDefaultFAQs();
  }

  private static categoriesByRole: Record<string, string[]> = {
    FARMER: [
      'Escrow & Bank Settlement Delay',
      'Harvest Batch Logging & QR Generation',
      'Processor Order Dispatches & Cargo Inspection Rejection',
      'Aadhaar / KYC & Account Verification',
      'Platform Technical Bug / App Glitch',
      'Other',
    ],
    PROCESSOR: [
      'Incoming Produce Quality Inspection Dispute',
      'Raw-to-Processed Batch Transformation Log',
      'Distributor Order Fulfillment & Escrow Payout',
      'Facility Hygiene Audit & Compliance Certificate',
      'Platform Technical Bug / App Glitch',
      'Other',
    ],
    DISTRIBUTOR: [
      'Cold-Chain Sensor Data & Temperature Breach Audit',
      'Warehouse Intake Verification & Damage Logging',
      'Retailer Dispatch Delivery Status & Escrow Refund',
      'Fleet Vehicle & GPS Tracking Discrepancy',
      'Platform Technical Bug / App Glitch',
      'Other',
    ],
    RETAILER: [
      'Store Inventory Sync & Stock Discrepancy',
      'Product Shelf QR Code & Lineage Tag Audit',
      'Distributor Bulk Purchase Settlement',
      'Consumer Return & Counterfeit Claim',
      'Platform Technical Bug / App Glitch',
      'Other',
    ],
    CUSTOMER: [
      'Product Lineage QR Code Verification Failure',
      'Fake / Counterfeit Packaging Report',
      'Retailer Purchase Receipt Dispute',
      'Product Quality / Expiry & Health Feedback',
      'Platform Technical Bug / App Glitch',
      'Other',
    ],
  };

  private async seedDefaultFAQs(): Promise<void> {
    const defaultFAQs: Partial<IFAQ>[] = [
      {
        role: 'FARMER',
        category: 'Escrow & Bank Settlement Delay',
        question: 'How are harvest escrow payments released to my bank account?',
        answer:
          'Escrow funds are locked when you dispatch harvest batches. Once the processor inspects and accepts delivery, the escrow contract automatically releases funds directly to your connected bank account via instant UPI/IMPS.',
        displayOrder: 1,
        isPublished: true,
      },
      {
        role: 'FARMER',
        category: 'Processor Order Dispatches & Cargo Inspection Rejection',
        question: 'What should I do if a processor rejects my produce delivery?',
        answer:
          'If a processor rejects a delivery, you will receive an instant rejection reason report with specific inspection failure details (e.g. moisture level, grade mismatch). The cargo status changes to Returned to Seller and the escrow amount is safely refunded.',
        displayOrder: 2,
        isPublished: true,
      },
      {
        role: 'FARMER',
        category: 'Harvest Batch Logging & QR Generation',
        question: 'How do I register a new crop harvest batch for sale?',
        answer:
          'Navigate to Farmer Hub -> Harvest Hub. Click Log Harvest Batch, enter your crop details, quantity, harvest date, and expected price to issue a blockchain-verified batch ID.',
        displayOrder: 3,
        isPublished: true,
      },
      {
        role: 'PROCESSOR',
        category: 'Incoming Produce Quality Inspection Dispute',
        question: 'How do I accept or reject incoming farmer shipments?',
        answer:
          'Go to Processor Hub -> Shipments & Logistics. Under Incoming Shipments, inspect the incoming cargo and click Accept Delivery to release escrow, or Reject Delivery to log a quality failure reason and return cargo.',
        displayOrder: 1,
        isPublished: true,
      },
      {
        role: 'CUSTOMER',
        category: 'Product Lineage QR Code Verification Failure',
        question: 'How can I verify the origin and farm location of my purchased food?',
        answer:
          'Scan the QR code printed on the product packaging using your phone camera or enter the Batch ID on the Seed2Shelf Trace page to view farm location, harvest date, processor quality audit, and lab certifications.',
        displayOrder: 1,
        isPublished: true,
      },
    ];

    await this.repository.seedDefaultFAQsIfEmpty(defaultFAQs);
  }

  private mapReplyToResponse(reply: ISupportReply): SupportReplyResponse {
    return {
      id: reply._id.toString(),
      senderId: reply.senderId.toString(),
      senderRole: reply.senderRole,
      senderName: reply.senderName,
      message: reply.message,
      attachmentUrl: reply.attachmentUrl,
      isInternalNote: reply.isInternalNote,
      timestamp: reply.timestamp,
    };
  }

  private mapTicketToResponse(ticket: ISupportTicket, replies?: ISupportReply[]): SupportTicketResponse {
    return {
      id: ticket._id.toString(),
      ticketNumber: ticket.ticketNumber,
      userId: ticket.userId.toString(),
      role: ticket.role,
      category: ticket.category,
      customCategory: ticket.customCategory,
      priority: ticket.priority,
      status: ticket.status,
      subject: ticket.subject,
      description: ticket.description,
      referenceType: ticket.referenceType,
      referenceId: ticket.referenceId,
      assignedTo: ticket.assignedTo ? ticket.assignedTo.toString() : undefined,
      resolvedAt: ticket.resolvedAt,
      closedAt: ticket.closedAt,
      replies: replies ? replies.map(r => this.mapReplyToResponse(r)) : undefined,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
    };
  }

  async createTicket(userId: string, dto: CreateTicketDTO): Promise<SupportTicketResponse> {
    const user = await this.repository.findUserById(userId);
    const ticketNumber = await generateTicketId();

    const ticket = await this.repository.createTicket({
      ticketNumber,
      userId: user ? user._id : (userId as any),
      role: dto.role,
      category: dto.category,
      customCategory: dto.customCategory,
      priority: dto.priority || 'MEDIUM',
      status: 'OPEN',
      subject: dto.subject,
      description: dto.description,
      referenceType: dto.referenceType,
      referenceId: dto.referenceId,
    });

    // Create Initial Conversation Message Reply
    const senderName = user?.fullName || `${dto.role} User`;
    const initialReply = await this.repository.createReply({
      ticketId: ticket._id,
      senderId: user ? user._id : (userId as any),
      senderRole: dto.role,
      senderName,
      message: dto.description,
      isInternalNote: false,
      timestamp: new Date(),
    });

    return this.mapTicketToResponse(ticket, [initialReply]);
  }

  async getTickets(userId: string, query?: TicketQueryDTO): Promise<SupportListResponse> {
    const user = await this.repository.findUserById(userId);
    const filterQuery: TicketQueryDTO = { ...query };

    // If regular user (non-admin), force userId filter to enforce ownership
    if (!user || user.role !== 'ADMIN') {
      filterQuery.userId = user ? user._id.toString() : userId;
    }

    const { tickets, total } = await this.repository.findTickets(filterQuery);
    const mappedTickets = tickets.map(t => this.mapTicketToResponse(t));

    return {
      tickets: mappedTickets,
      total,
      page: query?.page || 1,
      limit: query?.limit || 50,
    };
  }

  async getTicketDetails(userId: string, ticketIdOrNumber: string): Promise<SupportTicketResponse> {
    let ticket = await this.repository.findTicketByNumber(ticketIdOrNumber);
    if (!ticket && ticketIdOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      ticket = await this.repository.findTicketById(ticketIdOrNumber);
    }

    if (!ticket) {
      throw new Error(`Support ticket '${ticketIdOrNumber}' not found`);
    }

    const user = await this.repository.findUserById(userId);
    if (user && user.role !== 'ADMIN' && ticket.userId.toString() !== user._id.toString()) {
      throw new Error('Unauthorized to view this support ticket');
    }

    const replies = await this.repository.findRepliesByTicketId(ticket._id.toString());
    return this.mapTicketToResponse(ticket, replies);
  }

  async updateTicketStatus(
    userId: string,
    ticketIdOrNumber: string,
    dto: UpdateTicketStatusDTO
  ): Promise<SupportTicketResponse> {
    const ticketDetails = await this.getTicketDetails(userId, ticketIdOrNumber);
    const updateData: Partial<ISupportTicket> = { status: dto.status };

    if (dto.status === 'RESOLVED') {
      updateData.resolvedAt = new Date();
      try {
        const { notificationService } = await import('../notifications/notification.service.js');
        await notificationService.createNotification({
          userId: ticketDetails.userId,
          role: ticketDetails.role as any,
          title: 'Support Ticket Resolved',
          message: `Your support ticket #${ticketDetails.ticketNumber} (${ticketDetails.subject}) has been resolved.`,
          notificationType: 'SUPPORT_TICKET_RESOLVED',
          referenceType: 'SUPPORT_TICKET',
          referenceId: ticketDetails.ticketNumber,
          clickDestination: '/support',
        });
      } catch (err) {
        console.warn('Failed to send notification for ticket resolution', err);
      }
    } else if (dto.status === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    const updatedTicket = await this.repository.updateTicket(ticketDetails.id, updateData);
    const replies = await this.repository.findRepliesByTicketId(ticketDetails.id);

    return this.mapTicketToResponse(updatedTicket!, replies);
  }

  async addReply(userId: string, ticketIdOrNumber: string, dto: AddReplyDTO): Promise<SupportTicketResponse> {
    const ticketDetails = await this.getTicketDetails(userId, ticketIdOrNumber);
    const user = await this.repository.findUserById(userId);

    const senderRole = dto.senderRole || user?.role || ticketDetails.role;
    const senderName = dto.senderName || user?.fullName || `${senderRole} User`;

    await this.repository.createReply({
      ticketId: ticketDetails.id as any,
      senderId: user ? user._id : (userId as any),
      senderRole,
      senderName,
      message: dto.message,
      attachmentUrl: dto.attachmentUrl,
      isInternalNote: dto.isInternalNote || false,
      timestamp: new Date(),
    });

    if (ticketDetails.status === 'WAITING_FOR_USER') {
      await this.repository.updateTicket(ticketDetails.id, { status: 'IN_PROGRESS' });
    }

    return this.getTicketDetails(userId, ticketIdOrNumber);
  }

  async getCategories(role?: string): Promise<CategoryResponse> {
    const targetRole = role ? role.toUpperCase() : 'FARMER';
    const categories = SupportService.categoriesByRole[targetRole] || SupportService.categoriesByRole['FARMER'];

    return {
      role: targetRole,
      categories,
    };
  }

  async getFAQs(query?: FAQQueryDTO): Promise<FAQResponse[]> {
    const faqs = await this.repository.findFAQs(query || {});
    return faqs.map(f => ({
      id: f._id.toString(),
      role: f.role,
      category: f.category,
      question: f.question,
      answer: f.answer,
      displayOrder: f.displayOrder,
    }));
  }

  getPriorities(): string[] {
    return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  }

  getStatuses(): string[] {
    return ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED'];
  }
}

export const supportService = new SupportService();
