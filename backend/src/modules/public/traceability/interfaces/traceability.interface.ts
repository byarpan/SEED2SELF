export interface FarmerStageResponse {
  farmerId: string;
  farmerName: string;
  farmName?: string;
  farmLocation?: string;
  gpsCoordinates?: string;
  soilInfo?: string;
  cropCategory: string;
  cropName: string;
  cropVariety?: string;
  harvestVolume: number;
  harvestDate: Date;
  farmGatePricePerKg: number;
  certification?: string;
}

export interface ProcessorStageResponse {
  processorId?: string;
  processorName?: string;
  facilityName?: string;
  processingDate?: Date;
  qualityInspectionStatus: 'PASSED' | 'FAILED' | 'PENDING';
  remarks?: string;
  processorPricePerKg?: number;
  packagingDetails?: string;
}

export interface DistributorStageResponse {
  distributorId?: string;
  distributorName?: string;
  carrierName?: string;
  trackingNumber?: string;
  warehouseLocation?: string;
  dispatchDate?: Date;
  arrivalDate?: Date;
  logisticsStatus: string;
  distributorPricePerKg?: number;
}

export interface RetailerStageResponse {
  retailerId?: string;
  retailerName?: string;
  storeName?: string;
  shelfArrivalDate?: Date;
  consumerPricePerKg?: number;
  farmerRevenueSharePercentage?: number;
  escrowStatus: string;
  escrowExecutionDetails?: string;
  availabilityStatus: string;
}

export interface LineageNodeResponse {
  stage: 'FARMER' | 'PROCESSOR' | 'DISTRIBUTOR' | 'RETAILER' | 'CUSTOMER';
  title: string;
  name: string;
  status: string;
  timestamp?: Date;
  details?: Record<string, any>;
}

export interface DigitalPassportResponse {
  batchId: string;
  productName: string;
  cropCategory: string;
  cropVariety?: string;
  originLocation: string;
  farmerName: string;
  harvestVolume: string;
  currentCustodian: string;
  currentStatus: string;
  authenticityStatus: 'VERIFIED' | 'PENDING' | 'INVALID';
  blockchainHash: string;
  smartContractStatus: string;
  timeline: {
    eventType: string;
    description: string;
    performedByRole: string;
    timestamp: Date;
  }[];
  generatedAt: Date;
}

export interface TraceabilitySearchResult {
  batchId: string;
  productName: string;
  currentStatus: string;
  currentCustodian: string;
  farmerStage: FarmerStageResponse;
  processorStage?: ProcessorStageResponse;
  distributorStage?: DistributorStageResponse;
  retailerStage?: RetailerStageResponse;
  passport: DigitalPassportResponse;
  lineage: LineageNodeResponse[];
}

export interface TraceabilityQRResponse {
  batchId: string;
  traceUrl: string;
  qrCodeDataUrl: string;
}
