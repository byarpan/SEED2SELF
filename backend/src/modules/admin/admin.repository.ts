import mongoose from 'mongoose';
import User, { IUser } from '../../shared/models/User.js';
import KYC, { IKYC } from '../../shared/models/KYC.js';
import Order from '../../shared/models/Order.js';
import Shipment from '../../shared/models/Shipment.js';
import Wallet from '../../shared/models/Wallet.js';
import Escrow from '../../shared/models/Escrow.js';
import SupportTicket from '../../shared/models/SupportTicket.js';
import SupportReply from '../../shared/models/SupportReply.js';
import AuditLog, { IAuditLog } from '../../shared/models/AuditLog.js';
import VerificationLog from '../../shared/models/VerificationLog.js';
import { KYCVerificationStatus } from '../../shared/enums/KYCVerificationStatus.js';
import { AdminDashboardStats } from './interfaces/admin.interface.js';

export class AdminRepository {
  async findUserByEmail(email: string): Promise<IUser | null> {
    return User.findOne({ email: email.toLowerCase() }).select('+password').exec();
  }

  async findUserById(userId: string): Promise<IUser | null> {
    if (mongoose.Types.ObjectId.isValid(userId)) {
      const u = await User.findById(userId).exec();
      if (u) return u;
    }
    return User.findOne({
      $or: [{ userId }, { farmerId: userId }, { processorId: userId }, { adminId: userId }],
    }).exec();
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    const [
      totalUsers,
      farmers,
      processors,
      distributors,
      retailers,
      customers,
      pendingKYC,
      approvedKYC,
      rejectedKYC,
      activeOrders,
      activeShipments,
      totalEscrow,
      totalWallets,
      totalTickets,
      pendingTickets,
      resolvedTickets,
    ] = await Promise.all([
      User.countDocuments({ role: { $ne: 'ADMIN' } }),
      User.countDocuments({ role: 'FARMER' }),
      User.countDocuments({ role: 'PROCESSOR' }),
      User.countDocuments({ role: 'DISTRIBUTOR' }),
      User.countDocuments({ role: 'RETAILER' }),
      User.countDocuments({ role: 'CUSTOMER' }),
      KYC.countDocuments({ verificationStatus: KYCVerificationStatus.PENDING }),
      KYC.countDocuments({ verificationStatus: KYCVerificationStatus.APPROVED }),
      KYC.countDocuments({ verificationStatus: KYCVerificationStatus.REJECTED }),
      Order.countDocuments({ orderStatus: { $in: ['ACCEPTED', 'DISPATCHED'] } }),
      Shipment.countDocuments({ shipmentStatus: 'IN_TRANSIT' }),
      Escrow.aggregate([{ $match: { status: 'LOCKED' } }, { $group: { _id: null, total: { $sum: '$rawAmount' } } }]),
      Wallet.aggregate([{ $group: { _id: null, total: { $sum: '$balance' } } }]),
      SupportTicket.countDocuments({}),
      SupportTicket.countDocuments({ status: { $in: ['OPEN', 'IN_PROGRESS'] } }),
      SupportTicket.countDocuments({ status: 'RESOLVED' }),
    ]);

    return {
      users: {
        total: totalUsers,
        farmers,
        processors,
        distributors,
        retailers,
        customers,
      },
      kyc: {
        pending: pendingKYC,
        approved: approvedKYC,
        rejected: rejectedKYC,
      },
      operations: {
        activeOrders,
        activeShipments,
        totalEscrowLocked: totalEscrow[0]?.total || 0,
        totalWalletBalance: totalWallets[0]?.total || 0,
      },
      support: {
        totalTickets,
        pendingTickets,
        resolvedTickets,
      },
    };
  }

  async getUsersList(role?: string, search?: string, status?: string) {
    const query: any = { role: { $ne: 'ADMIN' } };
    if (role && role !== 'ALL') query.role = role.toUpperCase();
    if (status && status !== 'ALL') query.status = status.toUpperCase();

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { farmerId: searchRegex },
        { processorId: searchRegex },
      ];
    }

    return User.find(query).sort({ createdAt: -1 }).exec();
  }

  async updateUserStatus(userId: string, status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED') {
    return User.findByIdAndUpdate(userId, { $set: { status } }, { new: true }).exec();
  }

  async getKYCList(statusFilter?: string) {
    const query: any = {};
    if (statusFilter && statusFilter !== 'ALL') {
      query.verificationStatus = statusFilter.toUpperCase();
    }
    return KYC.find(query).populate('userId', 'fullName email phone role farmerId processorId').sort({ createdAt: -1 }).exec();
  }

  async updateKYCStatus(userId: string, decision: KYCVerificationStatus) {
    const kyc = await KYC.findOneAndUpdate({ userId }, { $set: { verificationStatus: decision } }, { new: true }).exec();
    await User.findByIdAndUpdate(userId, { $set: { verificationStatus: decision } }).exec();
    return kyc;
  }

  async createVerificationLog(logData: any) {
    return VerificationLog.create(logData);
  }

  async createAuditLog(adminId: string, adminEmail: string, action: string, targetType: any, targetId: string, details: string) {
    return AuditLog.create({
      adminId,
      adminEmail,
      action,
      targetType,
      targetId,
      details,
    });
  }

  async getAuditLogs() {
    return AuditLog.find().sort({ createdAt: -1 }).limit(100).exec();
  }

  async globalSearch(term: string) {
    const regex = new RegExp(term.trim(), 'i');
    const [users, orders, shipments, kycs] = await Promise.all([
      User.find({
        $or: [{ fullName: regex }, { email: regex }, { phone: regex }, { farmerId: regex }, { processorId: regex }],
      }).exec(),
      Order.find({
        $or: [{ orderNumber: regex }, { cropName: regex }, { buyerName: regex }],
      }).exec(),
      Shipment.find({
        $or: [{ shipmentId: regex }, { trackingNumber: regex }],
      }).exec(),
      KYC.find({
        $or: [{ aadhaarNumber: regex }, { panNumber: regex }],
      }).populate('userId').exec(),
    ]);

    return { users, orders, shipments, kycs };
  }

  async getTickets(statusFilter?: string, priorityFilter?: string) {
    const query: any = {};
    if (statusFilter && statusFilter !== 'ALL') query.status = statusFilter.toUpperCase();
    if (priorityFilter && priorityFilter !== 'ALL') query.priority = priorityFilter.toUpperCase();

    const tickets = await SupportTicket.find(query).populate('userId', 'fullName email role farmerId processorId').sort({ createdAt: -1 }).exec();
    
    // Fetch replies for each ticket
    const ticketsWithReplies = await Promise.all(
      tickets.map(async (t) => {
        const replies = await SupportReply.find({ ticketId: t._id }).sort({ createdAt: 1 }).exec();
        return {
          ...t.toObject(),
          replies,
        };
      })
    );

    return ticketsWithReplies;
  }

  async replyToTicket(ticketId: string, senderId: string, senderName: string, message: string) {
    const reply = await SupportReply.create({
      ticketId,
      senderId,
      senderRole: 'ADMIN',
      senderName,
      message,
      timestamp: new Date(),
    });

    await SupportTicket.findByIdAndUpdate(ticketId, {
      $set: { status: 'WAITING_FOR_USER', updatedAt: new Date() },
    }).exec();

    return reply;
  }

  async updateTicketStatus(ticketId: string, status: string, priority?: string) {
    const updateData: any = { status: status.toUpperCase(), updatedAt: new Date() };
    if (status.toUpperCase() === 'RESOLVED') updateData.resolvedAt = new Date();
    if (status.toUpperCase() === 'CLOSED') updateData.closedAt = new Date();
    if (priority) updateData.priority = priority.toUpperCase();

    return SupportTicket.findByIdAndUpdate(ticketId, { $set: updateData }, { new: true }).exec();
  }

  async getReports(statusFilter?: string, typeFilter?: string) {
    const query: any = {};
    if (statusFilter && statusFilter !== 'ALL') query.status = statusFilter.toUpperCase();
    if (typeFilter && typeFilter !== 'ALL') query.reportType = typeFilter.toUpperCase();

    const ReportModel = (await import('../../shared/models/Report.js')).Report;
    return ReportModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async updateReportStatus(reportId: string, status: string, notes?: string, resolvedBy?: string) {
    const ReportModel = (await import('../../shared/models/Report.js')).Report;
    return ReportModel.findByIdAndUpdate(
      reportId,
      {
        $set: {
          status: status.toUpperCase(),
          resolutionNotes: notes,
          resolvedBy,
          resolvedAt: new Date(),
        },
      },
      { new: true }
    ).exec();
  }

  async getOrdersList(statusFilter?: string) {
    const query: any = {};
    if (statusFilter && statusFilter !== 'ALL') query.orderStatus = statusFilter.toUpperCase();
    return Order.find(query).sort({ createdAt: -1 }).exec();
  }

  async getPaymentsList() {
    return Escrow.find().sort({ createdAt: -1 }).exec();
  }

  async getWalletsList() {
    return Wallet.find().populate('userId', 'fullName email role farmerId processorId').sort({ balance: -1 }).exec();
  }

  async getAnalyticsData() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [userTrends, orderTrends, revenueStats, kycBreakdown, supportBreakdown] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Order.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Escrow.aggregate([{ $group: { _id: '$status', total: { $sum: '$rawAmount' } } }]),
      User.aggregate([{ $group: { _id: '$verificationStatus', count: { $sum: 1 } } }]),
      SupportTicket.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    ]);

    return {
      userTrends,
      orderTrends,
      revenueStats,
      kycBreakdown,
      supportBreakdown,
    };
  }

  async getNotifications() {
    const NotificationModel = (await import('../../shared/models/Notification.js')).Notification;
    return NotificationModel.find({ role: 'ADMIN' }).sort({ createdAt: -1 }).limit(50).exec();
  }
}

export const adminRepository = new AdminRepository();
