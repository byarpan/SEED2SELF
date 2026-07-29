export interface CreateTicketDTO {
  userId?: string;
  role: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER' | 'ADMIN';
  category: string;
  customCategory?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  subject: string;
  description: string;
  referenceType?: 'ORDER' | 'SHIPMENT' | 'BATCH' | 'PAYMENT' | 'WALLET_TRANSACTION' | 'INVOICE' | 'HARVEST' | 'OTHER';
  referenceId?: string;
}

export interface UpdateTicketStatusDTO {
  status: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
}

export interface AddReplyDTO {
  senderId?: string;
  senderRole?: string;
  senderName?: string;
  message: string;
  attachmentUrl?: string;
  isInternalNote?: boolean;
}

export interface TicketQueryDTO {
  userId?: string;
  role?: string;
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FAQQueryDTO {
  role?: string;
  category?: string;
  search?: string;
}
