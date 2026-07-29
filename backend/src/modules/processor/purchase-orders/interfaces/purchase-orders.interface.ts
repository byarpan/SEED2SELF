export interface PurchaseOrderItemResponse {
  id: string;
  orderNumber: string;
  batchNumber: string;
  productCategory: string;
  productName: string;
  productImage?: string;
  buyerName: string;
  buyerCompany?: string;
  buyerEmail?: string;
  buyerPhone?: string;
  orderDate: Date | string;
  formattedOrderDate: string;
  quantityRequested: string;
  quantityKg: number;
  unit: string;
  totalOfferAmount: string;
  totalAmount: number;
  escrowStatus: 'LOCKED' | 'RELEASED' | 'REFUNDED';
  escrowStatusLabel: string;
  orderStatus: string;
  orderStatusLabel: string;
  deliveryStatus: string;
  shipmentId?: string;
  trackingNumber?: string;
  carrierName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderCountsResponse {
  all: number;
  pending: number;
  accepted: number;
  rejected: number;
  dispatched: number;
}

export interface PurchaseOrderListResponse {
  orders: PurchaseOrderItemResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  counts: PurchaseOrderCountsResponse;
}
