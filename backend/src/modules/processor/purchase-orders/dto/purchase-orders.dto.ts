export interface PurchaseOrderQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface RejectOrderDTO {
  reason?: string;
  rejectionReason?: string;
}

export interface StartDeliveryDTO {
  carrierName?: string;
  trackingNumber?: string;
  estimatedDeliveryDays?: number;
  destination?: string;
  notes?: string;
}
