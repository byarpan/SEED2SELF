export interface AdminLoginDTO {
  email: string;
  password: string;
}

export interface VerifyKYCDTO {
  userId: string;
  decision: 'APPROVED' | 'REJECTED' | 'RE_UPLOAD_REQUESTED';
  notes?: string;
  rejectionReason?: string;
}

export interface UpdateUserStatusDTO {
  userId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'DISABLED';
  reason?: string;
}

export interface TicketReplyDTO {
  ticketId: string;
  message: string;
  status?: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
}
