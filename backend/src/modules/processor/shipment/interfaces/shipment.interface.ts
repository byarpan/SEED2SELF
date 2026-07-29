export interface LogisticsTimelineStep {
  title: string;
  location: string;
  timestamp: string;
  status: 'completed' | 'current' | 'pending';
  description?: string;
}

export interface ShipmentItemResponse {
  id: string;
  shipmentId: string;
  orderId: string;
  orderNumber?: string;
  batchId: string;
  dispatchDate: Date | string;
  formattedDispatchDate: string;
  cargoName: string;
  cargoQuantity: string;
  cargoValue: number;
  formattedCargoValue: string;
  counterpartyId?: string;
  counterpartyName: string;
  counterpartyRole: string;
  destination: string;
  estimatedArrival: Date | string;
  formattedEstimatedArrival: string;
  escrowStatus: 'LOCKED' | 'RELEASED' | 'REFUNDED';
  escrowStatusLabel: string;
  shipmentStatus: string;
  shipmentStatusLabel: string;
  inspectionResult: 'PASSED' | 'FAILED' | 'PENDING';
  rejectionReason?: string;
  trackingNumber?: string;
  carrierName?: string;
  liveLogisticsTimeline: LogisticsTimelineStep[];
  acceptedAt?: Date | string;
  rejectedAt?: Date | string;
  deliveredAt?: Date | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentCountsResponse {
  incomingPending: number;
  incomingHistoryAll: number;
  incomingHistoryAccepted: number;
  incomingHistoryRejected: number;
  outgoingActive: number;
  outgoingHistoryAll: number;
  outgoingHistoryAccepted: number;
  outgoingHistoryRejected: number;
}

export interface ShipmentListResponse {
  shipments: ShipmentItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: ShipmentCountsResponse;
}
