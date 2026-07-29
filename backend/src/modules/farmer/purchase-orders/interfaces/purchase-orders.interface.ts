export interface PurchaseOrderResponse {
  id: string;
  orderNumber: string;
  farmerId: string;
  processorId: string;
  buyerName: string;
  cropName: string;
  variety?: string;
  batchNumber: string;
  quantityKg: number;
  pricePerKg: number;
  totalAmount: number;
  orderStatus?: string;
  deliveryStatus: string;
  paymentStatus?: string;
  escrowStatus: string;
  shipmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderListResponse {
  orders: PurchaseOrderResponse[];
  total: number;
  page?: number;
  limit?: number;
}
