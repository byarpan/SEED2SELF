export interface RegisterDTO {
  fullName: string;
  phone: string;
  email?: string;
  password?: string;
  role?: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER' | 'ADMIN';
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface LoginDTO {
  identifier: string; // Email, phone, or Farmer/Processor/User ID
  password?: string;
}

export interface RefreshTokenDTO {
  refreshToken?: string;
}
