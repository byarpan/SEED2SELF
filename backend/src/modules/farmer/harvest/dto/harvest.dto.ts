export interface RegisterHarvestDTO {
  cropCategory: string;
  cropName: string;
  cropVariety?: string;
  harvestVolume: number;
  sellingPrice: number;
  harvestDate: string | Date;
  cropImage?: string;
  farmId?: string;
}

export interface UpdateHarvestDTO {
  cropCategory?: string;
  cropName?: string;
  cropVariety?: string;
  harvestVolume?: number;
  sellingPrice?: number;
  harvestDate?: string | Date;
  cropImage?: string;
}

export interface HarvestQueryDTO {
  userId?: string;
  cropCategory?: string;
  listingStatus?: string;
  search?: string;
  page?: number;
  limit?: number;
}
