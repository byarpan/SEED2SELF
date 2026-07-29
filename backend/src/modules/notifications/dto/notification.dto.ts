export interface CreateNotificationDTO {
  userId: string;
  role: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER' | 'ADMIN';
  title: string;
  message: string;
  notificationType: string;
  referenceType?: 'ORDER' | 'SHIPMENT' | 'BATCH' | 'PAYMENT' | 'WALLET_TRANSACTION' | 'INVOICE' | 'HARVEST' | 'SUPPORT_TICKET' | 'TRACEABILITY' | 'OTHER';
  referenceId?: string;
  clickDestination?: string;
}

export interface NotificationQueryDTO {
  userId?: string;
  role?: string;
  isRead?: boolean;
  page?: number;
  limit?: number;
}
