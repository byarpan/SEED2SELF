export interface MarketplaceHarvestItemResponse {
  id: string;
  batchId: string;
  cropName: string;
  cropCategory: string;
  cropVariety?: string;
  farmerName: string;
  farmerId: string;
  farmLocation: string;
  harvestDate: Date | string;
  availableVolume: number;
  sellingPrice: number;
  cropImage?: string;
  verifiedBadge: boolean;
  listingStatus: string;
}

export interface CartItemResponse {
  harvestId: string;
  batchId: string;
  cropName: string;
  farmerName: string;
  quantityKg: number;
  pricePerKg: number;
  subtotal: number;
  cropImage?: string;
}

export interface CartSummaryResponse {
  items: CartItemResponse[];
  cropSubtotal: number;
  gst: number;
  platformFee: number;
  grandTotal: number;
}

export interface RazorpayPaymentInitiationResponse {
  orderId: string;
  keyId: string;
  amount: number;
  currency: string;
  checkoutId: string;
}

export interface OrderConfirmationResponse {
  orderReferenceId: string;
  orderNumber: string;
  factoryDeliveryLocation: {
    factoryName: string;
    contactPerson: string;
    contactNumber: string;
    fullAddress: string;
  };
  receiverContactInformation: {
    name: string;
    phone: string;
  };
  purchasedCropBatches: Array<{
    batchId: string;
    cropName: string;
    farmerName: string;
    quantityKg: number;
    totalPrice: number;
  }>;
  escrowLockedAmount: string;
  rawEscrowAmount: number;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: Date;
}
