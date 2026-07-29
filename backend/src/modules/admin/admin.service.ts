import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AdminRepository, adminRepository } from './admin.repository.js';
import { AdminLoginDTO, VerifyKYCDTO, UpdateUserStatusDTO } from './dto/admin.dto.js';
import { KYCVerificationStatus } from '../../shared/enums/KYCVerificationStatus.js';

export class AdminService {
  constructor(private repository: AdminRepository = adminRepository) {}

  async adminLogin(dto: AdminLoginDTO) {
    const { email, password } = dto;
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Strictly enforce ADMIN role authorization
    if (user.role !== 'ADMIN') {
      throw new Error('Access denied. Admin portal is restricted to Platform Administrators only.');
    }

    const isMatch = await bcrypt.compare(password, user.password || '');
    if (!isMatch) {
      throw new Error('Invalid email or password');
    }

    const jwtSecret = process.env.JWT_SECRET || 'secret';
    const token = jwt.sign(
      {
        id: user._id.toString(),
        userId: user.adminId || user.userId || user._id.toString(),
        email: user.email,
        role: 'ADMIN',
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Create Audit Log
    await this.repository.createAuditLog(
      user._id.toString(),
      user.email || '',
      'ADMIN_LOGIN',
      'SYSTEM',
      user._id.toString(),
      'Admin logged into platform dashboard successfully'
    );

    return {
      token,
      user: {
        id: user._id.toString(),
        adminId: user.adminId || `S2S-ADM-${user._id.toString().slice(-6).toUpperCase()}`,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async getDashboard(adminId: string) {
    const stats = await this.repository.getDashboardStats();
    return stats;
  }

  async getUsersList(adminId: string, role?: string, search?: string, status?: string) {
    return this.repository.getUsersList(role, search, status);
  }

  async updateUserStatus(adminId: string, adminEmail: string, dto: UpdateUserStatusDTO) {
    const targetUser = await this.repository.findUserById(dto.userId);
    if (!targetUser) {
      throw new Error(`Target user '${dto.userId}' not found`);
    }

    const updatedUser = await this.repository.updateUserStatus(targetUser._id.toString(), dto.status);

    await this.repository.createAuditLog(
      adminId,
      adminEmail,
      'UPDATE_USER_STATUS',
      'USER',
      targetUser._id.toString(),
      `Admin changed user (${targetUser.fullName}, ${targetUser.role}) status to '${dto.status}'. Reason: ${dto.reason || 'N/A'}`
    );

    return updatedUser;
  }

  async getKYCList(adminId: string, statusFilter?: string) {
    return this.repository.getKYCList(statusFilter);
  }

  async verifyUserKYC(adminId: string, adminEmail: string, dto: VerifyKYCDTO) {
    const targetUser = await this.repository.findUserById(dto.userId);
    if (!targetUser) {
      throw new Error(`Target user '${dto.userId}' not found`);
    }

    const previousStatus = targetUser.verificationStatus || KYCVerificationStatus.PENDING;
    const newStatus =
      dto.decision === 'APPROVED'
        ? KYCVerificationStatus.APPROVED
        : dto.decision === 'REJECTED'
        ? KYCVerificationStatus.REJECTED
        : KYCVerificationStatus.RE_UPLOAD_REQUESTED;

    const updatedKYC = await this.repository.updateKYCStatus(targetUser._id.toString(), newStatus);

    // Record Verification Log
    await this.repository.createVerificationLog({
      adminId,
      userId: targetUser._id.toString(),
      role: targetUser.role,
      previousStatus,
      newStatus,
      notes: dto.notes,
      rejectionReason: dto.rejectionReason,
    });

    // Record Audit Log
    await this.repository.createAuditLog(
      adminId,
      adminEmail,
      `KYC_${dto.decision}`,
      'KYC',
      targetUser._id.toString(),
      `Admin evaluated KYC for ${targetUser.fullName} (${targetUser.role}) to '${newStatus}'. Notes: ${dto.notes || 'None'}`
    );

    // Send Notification to User
    try {
      const { notificationService } = await import('../notifications/notification.service.js');
      await notificationService.createNotification({
        userId: targetUser._id.toString(),
        role: targetUser.role as any,
        title: `KYC Verification ${dto.decision}`,
        message:
          dto.decision === 'APPROVED'
            ? 'Your KYC documents have been verified and approved by Platform Admin. Full trading access unlocked.'
            : `Your KYC evaluation result: ${dto.decision}. Reason: ${dto.rejectionReason || dto.notes || 'Please review your uploaded documents.'}`,
        notificationType: 'SYSTEM',
        referenceType: 'OTHER',
        clickDestination: `/${targetUser.role.toLowerCase()}/profile`,
      });
    } catch (err) {
      console.warn('Failed to send KYC decision notification', err);
    }

    return {
      message: `KYC status updated to ${newStatus}`,
      kyc: updatedKYC,
    };
  }

  async getAuditLogs(adminId: string) {
    return this.repository.getAuditLogs();
  }

  async globalSearch(adminId: string, term: string) {
    if (!term || term.trim() === '') return { users: [], orders: [], shipments: [], kycs: [] };
    return this.repository.globalSearch(term);
  }

  async getTickets(adminId: string, status?: string, priority?: string) {
    return this.repository.getTickets(status, priority);
  }

  async replyToTicket(adminId: string, adminName: string, ticketId: string, message: string) {
    const reply = await this.repository.replyToTicket(ticketId, adminId, adminName, message);
    await this.repository.createAuditLog(
      adminId,
      adminName,
      'REPLY_SUPPORT_TICKET',
      'SUPPORT',
      ticketId,
      `Admin replied to support ticket: ${message.slice(0, 50)}...`
    );
    return reply;
  }

  async updateTicketStatus(adminId: string, adminEmail: string, ticketId: string, status: string, priority?: string) {
    const updated = await this.repository.updateTicketStatus(ticketId, status, priority);
    await this.repository.createAuditLog(
      adminId,
      adminEmail,
      'UPDATE_TICKET_STATUS',
      'SUPPORT',
      ticketId,
      `Admin changed support ticket status to '${status}'`
    );
    return updated;
  }

  async getReports(adminId: string, status?: string, type?: string) {
    return this.repository.getReports(status, type);
  }

  async updateReportStatus(adminId: string, adminEmail: string, reportId: string, status: string, notes?: string) {
    const updated = await this.repository.updateReportStatus(reportId, status, notes, adminId);
    await this.repository.createAuditLog(
      adminId,
      adminEmail,
      'UPDATE_REPORT_STATUS',
      'REPORT',
      reportId,
      `Admin updated report status to '${status}'. Notes: ${notes || 'N/A'}`
    );
    return updated;
  }

  async getOrdersList(adminId: string, status?: string) {
    return this.repository.getOrdersList(status);
  }

  async getPaymentsList(adminId: string) {
    return this.repository.getPaymentsList();
  }

  async getWalletsList(adminId: string) {
    return this.repository.getWalletsList();
  }

  async getAnalyticsData(adminId: string) {
    return this.repository.getAnalyticsData();
  }

  async getNotifications(adminId: string) {
    return this.repository.getNotifications();
  }
}

export const adminService = new AdminService();
