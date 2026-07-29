export interface RegisterProcessorDTO {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
}

export interface UpdateBasicInfoDTO {
  fullName?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string | Date;
  profilePhoto?: string;
}

export interface UpdateProcessorAddressDTO {
  addressLine?: string;
  village?: string;
  district?: string;
  state?: string;
  pinCode?: string;
  country?: string;
}

export interface UpdateProcessorKYCDTO {
  aadhaarNumber?: string;
  frontImage?: string;
  backImage?: string;
}

export interface AddReviewDTO {
  reviewerId: string;
  rating: number;
  comment?: string;
}
