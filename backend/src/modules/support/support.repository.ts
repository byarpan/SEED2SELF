import mongoose from 'mongoose';
import SupportTicket, { ISupportTicket } from '../../shared/models/SupportTicket.js';
import SupportReply, { ISupportReply } from '../../shared/models/SupportReply.js';
import FAQ, { IFAQ } from '../../shared/models/FAQ.js';
import User, { IUser } from '../../shared/models/User.js';
import { TicketQueryDTO, FAQQueryDTO } from './dto/support.dto.js';

export class SupportRepository {
  async findUserById(userId: string): Promise<IUser | null> {
    if (!userId) return null;
    if (mongoose.Types.ObjectId.isValid(userId)) {
      return User.findById(userId).exec();
    }
    return User.findOne({
      $or: [{ farmerId: userId }, { processorId: userId }, { userId }],
    }).exec();
  }

  async createTicket(ticketData: Partial<ISupportTicket>): Promise<ISupportTicket> {
    const ticket = new SupportTicket(ticketData);
    return ticket.save();
  }

  async findTicketById(ticketId: string): Promise<ISupportTicket | null> {
    return SupportTicket.findById(ticketId).exec();
  }

  async findTicketByNumber(ticketNumber: string): Promise<ISupportTicket | null> {
    return SupportTicket.findOne({ ticketNumber }).exec();
  }

  async findTickets(query: TicketQueryDTO): Promise<{ tickets: ISupportTicket[]; total: number }> {
    const filter: any = {};

    if (query.userId) {
      if (mongoose.Types.ObjectId.isValid(query.userId)) {
        filter.userId = new mongoose.Types.ObjectId(query.userId);
      } else {
        const user = await this.findUserById(query.userId);
        if (user) {
          filter.userId = user._id;
        }
      }
    }

    if (query.role) {
      filter.role = query.role;
    }

    if (query.status) {
      filter.status = query.status;
    }

    if (query.priority) {
      filter.priority = query.priority;
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.search) {
      filter.$or = [
        { ticketNumber: { $regex: query.search, $options: 'i' } },
        { subject: { $regex: query.search, $options: 'i' } },
        { description: { $regex: query.search, $options: 'i' } },
        { category: { $regex: query.search, $options: 'i' } },
      ];
    }

    const total = await SupportTicket.countDocuments(filter);
    const page = query.page || 1;
    const limit = query.limit || 50;
    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { tickets, total };
  }

  async updateTicket(ticketId: string, updateData: Partial<ISupportTicket>): Promise<ISupportTicket | null> {
    return SupportTicket.findByIdAndUpdate(ticketId, { $set: updateData }, { new: true, runValidators: true }).exec();
  }

  async createReply(replyData: Partial<ISupportReply>): Promise<ISupportReply> {
    const reply = new SupportReply(replyData);
    return reply.save();
  }

  async findRepliesByTicketId(ticketId: string): Promise<ISupportReply[]> {
    return SupportReply.find({ ticketId }).sort({ timestamp: 1 }).exec();
  }

  async findFAQs(query: FAQQueryDTO): Promise<IFAQ[]> {
    const filter: any = { isPublished: true };

    if (query.role && query.role !== 'ALL') {
      filter.role = { $in: [query.role, 'ALL'] };
    }

    if (query.category) {
      filter.category = query.category;
    }

    if (query.search) {
      filter.$or = [
        { question: { $regex: query.search, $options: 'i' } },
        { answer: { $regex: query.search, $options: 'i' } },
        { category: { $regex: query.search, $options: 'i' } },
      ];
    }

    return FAQ.find(filter).sort({ displayOrder: 1, createdAt: -1 }).exec();
  }

  async seedDefaultFAQsIfEmpty(faqs: Partial<IFAQ>[]): Promise<void> {
    try {
      const count = await FAQ.countDocuments().catch(() => 0);
      if (count === 0 && faqs.length > 0) {
        await FAQ.insertMany(faqs).catch(console.warn);
      }
    } catch (e) {}
  }
}

export const supportRepository = new SupportRepository();
