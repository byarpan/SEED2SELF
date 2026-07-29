export interface CreateProcessedProductDTO {
  productCategory: string;
  productName: string;
  parentRawBatchId?: string;
  processedVolume: number;
  sellingPrice: number;
  processingDate?: string;
  productImage: string;
  unit?: string;
  notes?: string;
}
