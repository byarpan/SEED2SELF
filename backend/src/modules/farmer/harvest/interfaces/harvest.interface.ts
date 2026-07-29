import { ListingStatus } from '../../../../shared/enums/ListingStatus.js';
import { HarvestStatus } from '../../../../shared/enums/HarvestStatus.js';

export interface HarvestResponse {
  id: string;
  batchId: string;
  farmerId: string;
  farmId?: string;
  cropCategory: string;
  cropName: string;
  cropVariety?: string;
  harvestVolume: number;
  availableVolume: number;
  sellingPrice: number;
  harvestDate: Date;
  cropImage?: string;
  listingStatus: ListingStatus;
  harvestStatus: HarvestStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface HarvestQRResponse {
  batchId: string;
  traceUrl: string;
  qrCodeDataUrl: string;
}

export interface HarvestListResponse {
  harvests: HarvestResponse[];
  total: number;
  page?: number;
  limit?: number;
}
