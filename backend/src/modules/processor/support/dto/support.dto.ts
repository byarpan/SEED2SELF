export interface CreateTicketDTO {
  category: string;
  subject: string;
  description: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  attachmentUrl?: string;
  referenceType?: 'ORDER' | 'SHIPMENT' | 'BATCH' | 'PAYMENT' | 'WALLET_TRANSACTION' | 'INVOICE' | 'HARVEST' | 'OTHER';
  referenceId?: string;
  processorId?: string;
}

export interface TicketQueryDTO {
  page?: number;
  limit?: number;
  status?: 'OPEN' | 'IN_PROGRESS' | 'WAITING_FOR_USER' | 'RESOLVED' | 'CLOSED';
  category?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  search?: string;
  processorId?: string;
}

export interface CreateReplyDTO {
  message: string;
  attachmentUrl?: string;
  processorId?: string;
}
