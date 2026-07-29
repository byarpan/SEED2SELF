export interface ShipmentQueryDTO {
  userId?: string;
  status?: 'ACTIVE' | 'HISTORY' | 'IN_TRANSIT' | 'DELIVERED' | 'ACCEPTED' | 'REJECTED' | 'ALL';
  search?: string;
  page?: number;
  limit?: number;
}

export interface InspectionDTO {
  decision: 'ACCEPTED' | 'REJECTED';
  rejectionReason?: string;
  notes?: string;
}

export interface UpdateShipmentStatusDTO {
  status: 'DISPATCHED' | 'IN_TRANSIT' | 'DELIVERED' | 'ACCEPTED' | 'REJECTED';
  trackingNumber?: string;
  carrierName?: string;
}

export interface StartShipmentDTO {
  orderId: string;
  carrierName?: string;
  trackingNumber?: string;
  estimatedDelivery?: string | Date;
}
