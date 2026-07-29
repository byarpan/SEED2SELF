export interface FarmDetailsResponse {
  id?: string;
  farmName?: string;
  farmLocation?: string;
  latitude?: number;
  longitude?: number;
  googleMapsUrl?: string | null;
  totalLandArea?: number;
  landAreaUnit?: string;
  farmingPractice?: string;
  mainCultivatedCrops?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface FarmerDashboardResponse {
  farmerId?: string;
  fullName: string;
  email?: string;
  phone: string;
  profilePhoto?: string;
  farm: FarmDetailsResponse | null;
}
