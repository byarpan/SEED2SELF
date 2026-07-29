export interface RegisterFarmerDTO {
  fullName: string;
  email?: string;
  phone: string;
  password?: string;
}

export interface UpdateProfileDTO {
  fullName?: string;
  email?: string;
  phone?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
  dateOfBirth?: string | Date;
  profilePhoto?: string;
}

export interface UpdateAddressDTO {
  addressLine: string;
  village: string;
  district: string;
  state: string;
  pinCode: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

export interface UpdateKYCDTO {
  aadhaarNumber: string;
  panNumber?: string;
  frontImage?: string;
  backImage?: string;
  frontDocument?: { url: string; publicId: string };
  backDocument?: { url: string; publicId: string };
}

export interface BankAccountDTO {
  bankName: string;
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  branchLocation?: string;
}

export interface NotificationSettingsDTO {
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  orderAlerts?: boolean;
  paymentAlerts?: boolean;
}
