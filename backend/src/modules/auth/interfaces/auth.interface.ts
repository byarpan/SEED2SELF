export interface AuthUserResponse {
  id: string;
  userId?: string;
  farmerId?: string;
  processorId?: string;
  fullName: string;
  email?: string;
  phone: string;
  role: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER' | 'ADMIN';
  verificationStatus: string;
  averageRating: number;
  reviewCount: number;
  profilePhoto?: string;
  createdAt: Date;
}

export interface AuthResponse {
  user: AuthUserResponse;
  token: string;
  expiresIn: string;
}
