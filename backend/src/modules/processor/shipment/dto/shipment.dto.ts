export interface IncomingShipmentQueryDTO {
  page?: number;
  limit?: number;
  tab?: 'pending' | 'history';
  subFilter?: 'all' | 'accepted' | 'rejected';
  search?: string;
}

export interface OutgoingShipmentQueryDTO {
  page?: number;
  limit?: number;
  tab?: 'active' | 'history';
  subFilter?: 'all' | 'accepted' | 'rejected';
  search?: string;
}

export interface RejectDeliveryDTO {
  rejectionReason: string;
  notes?: string;
}

export interface UpdateShipmentStatusDTO {
  status?: 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED';
  trackingNumber?: string;
  carrierName?: string;
  rejectionReason?: string;
}
