export interface ProcessorHeaderSection {
  profilePhoto?: string;
  fullName: string;
  role: string;
  processorId: string;
  averageRating: number;
  reviewCount: number;
  reviewStatusText: string;
  verificationStatus: string;
}

export interface ProcessorBasicInfoSection {
  fullName: string;
  phone: string;
  email: string;
  gender: string;
  dateOfBirth?: Date | string;
  processorId: string;
}

export interface ProcessorAddressSection {
  addressLine: string;
  village: string;
  district: string;
  state: string;
  pinCode: string;
  country: string;
}

export interface ProcessorKYCSection {
  documentType: string;
  aadhaarNumber: string;
  frontImage: string;
  backImage: string;
  verificationStatus: string;
}

export interface ProcessorReviewItem {
  id: string;
  reviewerId: string;
  reviewerName?: string;
  reviewerPhoto?: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface ProcessorReviewsSection {
  averageRating: number;
  reviewCount: number;
  reviewMessage: string;
  reviews: ProcessorReviewItem[];
}

export interface ProcessorFullProfileResponse {
  header: ProcessorHeaderSection;
  basicInfo: ProcessorBasicInfoSection;
  address: ProcessorAddressSection;
  kyc: ProcessorKYCSection;
  reviews: ProcessorReviewsSection;
  raw: {
    user: any;
    address: any;
    kyc: any;
  };
}
