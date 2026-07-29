export interface SupportReplyResponse {
  id: string;
  senderId: string;
  senderRole: string;
  senderName: string;
  message: string;
  attachmentUrl?: string;
  isInternalNote: boolean;
  timestamp: Date;
}

export interface SupportTicketResponse {
  id: string;
  ticketNumber: string;
  userId: string;
  role: string;
  category: string;
  customCategory?: string;
  priority: string;
  status: string;
  subject: string;
  description: string;
  referenceType?: string;
  referenceId?: string;
  assignedTo?: string;
  resolvedAt?: Date;
  closedAt?: Date;
  replies?: SupportReplyResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SupportListResponse {
  tickets: SupportTicketResponse[];
  total: number;
  page?: number;
  limit?: number;
}

export interface FAQResponse {
  id: string;
  role: string;
  category: string;
  question: string;
  answer: string;
  displayOrder: number;
}

export interface CategoryResponse {
  role: string;
  categories: string[];
}
