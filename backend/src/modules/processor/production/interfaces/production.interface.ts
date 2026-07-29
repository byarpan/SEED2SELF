import mongoose from 'mongoose';

export interface ICreateProcessedProductInput {
  productCategory: string;
  productName: string;
  parentRawBatchId?: string;
  processedVolume: number;
  sellingPrice: number;
  processingDate?: string | Date;
  productImage: string;
  unit?: string;
  notes?: string;
}

export interface IUpdateProcessedProductInput {
  productCategory?: string;
  productName?: string;
  sellingPrice?: number;
  productImage?: string;
}

export interface IProcessedProductResponse {
  id: string;
  processedProductId: string;
  batchId: string;
  parentBatchId: string;
  itemType: 'PROCESSED';
  productName: string;
  category: string;
  quantity: string;
  rawQuantity: number;
  availableQuantity: number;
  pricePerUnit: string;
  rawPrice: number;
  date: string;
  status: 'In Stock' | 'Listed' | 'Sold Out';
  listingStatus: 'IN_STOCK' | 'LISTED' | 'SOLD_OUT';
  processingStatus: 'COMPLETED' | 'IN_PROCESSING';
  ownershipTransferred: boolean;
  productImage: string;
  qrCodeUrl: string;
  traceabilityUrl: string;
}

export interface IPurchasedHarvestItemResponse {
  id: string;
  batchId: string;
  itemType: 'RAW';
  productName: string;
  cropName: string;
  farmerName: string;
  farmerLocation: string;
  quantity: string;
  rawQuantity: number;
  availableStock: number;
  purchasePrice: string;
  rawPurchasePrice: number;
  processingStatus: 'Available for Processing' | 'In Processing' | 'Completed';
  lastProcessingDate: string;
  imageUrl: string;
  qrCodeUrl: string;
}

export interface IProductionHistoryResponse {
  completedHarvests: IPurchasedHarvestItemResponse[];
  soldProcessedProducts: IProcessedProductResponse[];
  processingRuns: any[];
}
