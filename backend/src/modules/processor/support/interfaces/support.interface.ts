export interface SupportReplyResponse {
  id: string;
  ticketId: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  message: string;
  attachmentUrl?: string;
  timestamp: Date | string;
}

export interface SupportTicketResponse {
  id: string;
  ticketNumber: string;
  processorId: string;
  role: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  subject: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  assignedStaff?: string;
  replies?: SupportReplyResponse[];
  latestReply?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketListResponse {
  tickets: SupportTicketResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FAQResponse {
  id: string;
  role: string;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
}
