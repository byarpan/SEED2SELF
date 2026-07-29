export interface PurchaseOrderQueryDTO {
  userId?: string;
  status?: 'ALL' | 'PENDING' | 'ACCEPTED' | 'DISPATCHED' | 'REJECTED' | 'CANCELLED';
  search?: string;
  page?: number;
  limit?: number;
}

export interface RejectOrderDTO {
  reason?: string;
}

export interface StartDeliveryDTO {
  carrierName?: string;
  trackingNumber?: string;
}
