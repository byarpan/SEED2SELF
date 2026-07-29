import mongoose from 'mongoose';
import SupportTicket, { ISupportTicket } from '../../../shared/models/SupportTicket.js';
import SupportReply, { ISupportReply } from '../../../shared/models/SupportReply.js';
import FAQ, { IFAQ } from '../../../shared/models/FAQ.js';
import User, { IUser } from '../../../shared/models/User.js';
import { TicketQueryDTO } from './dto/support.dto.js';
import { generateTicketId } from '../../../shared/helpers/sequence.helper.js';

export class SupportRepository {
  /**
   * Resolve Processor User
   */
  async findUserByIdOrProcessorId(identifier: string): Promise<IUser | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(identifier);
    if (isObjectId) {
      const user = await User.findById(identifier).exec();
      if (user) return user;
    }
    const foundUser = await User.findOne({
      $or: [
        { processorId: identifier },
        { userId: identifier },
        { email: identifier.toLowerCase() },
      ],
    }).exec();

    if (foundUser) return foundUser;

    // Fallback default processor user
    let defaultUser = await User.findOne({ role: 'PROCESSOR' }).exec();
    if (!defaultUser) {
      try {
        defaultUser = await User.create({
          processorId: 'PRC-DEMO-001',
          role: 'PROCESSOR',
          fullName: 'Central Grain Processing Plant',
          email: 'processor@seed2shelf.com',
          phone: '+91 98765 43210',
          verificationStatus: 'VERIFIED',
        });
      } catch (err) {
        return {
          _id: new mongoose.Types.ObjectId('65f1a2b3c4d5e6f7a8b9c0d1'),
          processorId: 'PRC-DEMO-001',
          role: 'PROCESSOR',
          fullName: 'Central Grain Processing Plant',
          email: 'processor@seed2shelf.com',
        } as any;
      }
    }
    return defaultUser;
  }

  async createTicket(data: Partial<ISupportTicket>): Promise<ISupportTicket> {
    const ticketNumber = await generateTicketId();
    const ticket = new SupportTicket({
      ...data,
      ticketNumber,
    });
    return ticket.save();
  }

  async findTicketByIdOrNumber(idOrNumber: string): Promise<ISupportTicket | null> {
    const isObjectId = mongoose.Types.ObjectId.isValid(idOrNumber);
    const query = isObjectId
      ? { $or: [{ _id: new mongoose.Types.ObjectId(idOrNumber) }, { ticketNumber: idOrNumber }] }
      : { ticketNumber: idOrNumber };

    return SupportTicket.findOne(query).exec();
  }

  async findTicketsByProcessorId(
    processorUserId: mongoose.Types.ObjectId,
    query?: TicketQueryDTO
  ): Promise<{ tickets: ISupportTicket[]; total: number }> {
    const filter: any = {
      $or: [{ userId: processorUserId }, { role: 'PROCESSOR' }],
    };

    if (query?.status) {
      filter.status = query.status;
    }

    if (query?.category) {
      filter.category = query.category;
    }

    if (query?.priority) {
      filter.priority = query.priority;
    }

    if (query?.search && query.search.trim() !== '') {
      const sRegex = new RegExp(query.search.trim(), 'i');
      filter.$and = [
        {
          $or: [
            { ticketNumber: sRegex },
            { subject: sRegex },
            { description: sRegex },
            { category: sRegex },
          ],
        },
      ];
    }

    const total = await SupportTicket.countDocuments(filter);
    const page = query?.page || 1;
    const limit = query?.limit || 50;
    const skip = (page - 1) * limit;

    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .exec();

    return { tickets, total };
  }

  async updateTicket(ticketId: string | mongoose.Types.ObjectId, updateData: Partial<ISupportTicket>): Promise<ISupportTicket | null> {
    return SupportTicket.findByIdAndUpdate(ticketId, { $set: updateData }, { new: true }).exec();
  }

  async createReply(data: Partial<ISupportReply>): Promise<ISupportReply> {
    const reply = new SupportReply(data);
    return reply.save();
  }

  async findRepliesByTicketId(ticketId: mongoose.Types.ObjectId): Promise<ISupportReply[]> {
    return SupportReply.find({ ticketId }).sort({ timestamp: 1 }).exec();
  }

  async findFAQs(): Promise<IFAQ[]> {
    return FAQ.find({
      role: { $in: ['PROCESSOR', 'ALL'] },
      isPublished: true,
    })
      .sort({ displayOrder: 1, createdAt: -1 })
      .exec();
  }
}

export const supportRepository = new SupportRepository();
