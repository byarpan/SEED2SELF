export interface ShipmentResponse {
  id: string;
  shipmentId: string;
  orderId: string;
  batchId: string;
  farmerId: string;
  processorId?: string;
  cropName: string;
  quantity: string;
  value: string;
  numericValue: number;
  destination: string;
  dispatchedDate: string;
  estimatedDelivery?: string;
  acceptedDate?: string;
  rejectedDate?: string;
  status: 'IN_TRANSIT' | 'DELIVERED' | 'ACCEPTED' | 'REJECTED' | 'DISPATCHED' | 'PREPARING';
  currentStep: number;
  inspectionResult?: string;
  rejectionReason?: string;
  trackingNumber?: string;
  carrierName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShipmentListResponse {
  shipments: ShipmentResponse[];
  total: number;
  page?: number;
  limit?: number;
}

export interface ShipmentTrackingStep {
  stepIndex: number;
  title: string;
  subtitle: string;
  isCompleted: boolean;
  isCurrent: boolean;
  statusText: string;
}

export interface ShipmentTrackingResponse {
  shipmentId: string;
  batchId: string;
  status: string;
  currentStep: number;
  steps: ShipmentTrackingStep[];
  carrierName?: string;
  trackingNumber?: string;
  destination?: string;
  estimatedDelivery?: string;
}
