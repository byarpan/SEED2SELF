export interface MarketplaceQueryDTO {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}

export interface AddToCartDTO {
  harvestId: string;
  quantityKg: number;
}

export interface UpdateCartQuantityDTO {
  harvestId: string;
  quantityKg: number;
}

export interface CreateFactoryDTO {
  factoryName: string;
  contactPerson: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  isDefault?: boolean;
}

export interface UpdateFactoryDTO {
  factoryName?: string;
  contactPerson?: string;
  contactNumber?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string;
  isDefault?: boolean;
}

export interface CheckoutDTO {
  factoryId: string;
  targetDeliveryDate?: string;
  notes?: string;
}

export interface InitiatePaymentDTO {
  checkoutId?: string;
  factoryId: string;
  totalAmount: number;
}

export interface VerifyPaymentDTO {
  razorpayPaymentId: string;
  razorpayOrderId: string;
  razorpaySignature: string;
  checkoutId?: string;
  factoryId: string;
}
