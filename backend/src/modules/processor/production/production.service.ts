import mongoose from 'mongoose';
import { ProductionRepository } from './production.repository.js';
import { CreateProcessedProductDTO } from './dto/create-processed-product.dto.js';
import { UpdateProcessedProductDTO } from './dto/update-processed-product.dto.js';
import {
  IProcessedProductResponse,
  IPurchasedHarvestItemResponse,
  IProductionHistoryResponse,
} from './interfaces/production.interface.js';
import { TraceabilityEventType } from '../../../shared/enums/TraceabilityEventType.js';

export class ProductionService {
  private repository: ProductionRepository;

  constructor() {
    this.repository = new ProductionRepository();
  }

  // Generate Alphabetical Child Suffix: 0 -> A, 1 -> B, 25 -> Z, 26 -> AA...
  private generateAlphabeticalSuffix(index: number): string {
    let suffix = '';
    let i = index;
    while (i >= 0) {
      suffix = String.fromCharCode((i % 26) + 65) + suffix;
      i = Math.floor(i / 26) - 1;
    }
    return suffix;
  }

  // Register New Processed Product & Batch Lineage
  async registerProcessedProduct(
    processorIdentifier: string,
    dto: CreateProcessedProductDTO
  ): Promise<IProcessedProductResponse> {
    const user = await this.repository.findProcessorUser(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const isIndependent = !dto.parentRawBatchId || dto.parentRawBatchId.toUpperCase() === 'NONE';
    const quantity = Number(dto.processedVolume);
    const price = Number(dto.sellingPrice);
    let parentBatchIdStr = 'NONE';
    let harvestDeducted = false;

    if (!isIndependent) {
      parentBatchIdStr = dto.parentRawBatchId!.trim();
      // Atomic deduction of parent harvest volume
      const updatedHarvest = await this.repository.deductParentHarvestVolume(parentBatchIdStr, quantity);
      if (!updatedHarvest && mongoose.Types.ObjectId.isValid(parentBatchIdStr)) {
        throw new Error('Insufficient parent harvest inventory volume.');
      }
      harvestDeducted = true;
    }

    try {
      let childBatchId = '';
      let lineageCreated = false;

      // CONCURRENCY-SAFE RETRY LOOP FOR CHILD BATCH SUFFIX GENERATION
      for (let attempt = 0; attempt < 5; attempt++) {
        if (isIndependent) {
          const randomDigits = Math.floor(1000 + Math.random() * 9000);
          childBatchId = `PROC-2026-${randomDigits}`;
          break;
        } else {
          const existingCount = await this.repository.countChildBatchesForParent(parentBatchIdStr);
          const suffix = this.generateAlphabeticalSuffix(existingCount + attempt);
          childBatchId = `${parentBatchIdStr}-${suffix}`;

          try {
            await this.repository.createBatchLineage(parentBatchIdStr, childBatchId, user._id);
            lineageCreated = true;
            break;
          } catch (err: any) {
            if (err.code === 11000 && attempt < 4) {
              // Retry with next suffix on concurrent collision
              continue;
            }
            throw err;
          }
        }
      }

      const processedProductIdStr = `PRD-PRC-${Date.now().toString().slice(-6)}`;

      // 1. Create ProcessedProduct document
      const product = await this.repository.createProcessedProduct({
        processedProductId: processedProductIdStr,
        batchId: childBatchId,
        parentBatchId: parentBatchIdStr,
        processorId: user._id,
        productCategory: dto.productCategory,
        productName: dto.productName,
        processedQuantity: quantity,
        availableQuantity: quantity,
        unit: dto.unit || 'kg',
        sellingPrice: price,
        processingDate: dto.processingDate ? new Date(dto.processingDate) : new Date(),
        productImage: dto.productImage,
        listingStatus: 'IN_STOCK',
        processingStatus: 'COMPLETED',
        ownershipTransferred: false,
      });

      // 2. Create Manufacturing Run log
      const runIdStr = `RUN-PRC-${Date.now().toString().slice(-6)}`;
      await this.repository.createProcessingRun({
        processingRunId: runIdStr,
        processorId: user._id,
        parentBatchId: parentBatchIdStr,
        childBatchId: childBatchId,
        processedProductId: product._id,
        inputQuantity: quantity,
        outputQuantity: quantity,
        processingDate: product.processingDate,
        processingStatus: 'COMPLETED',
        notes: dto.notes || `Processed ${quantity} kg of ${dto.productName}`,
      });

      // 3. Append Traceability Event
      await this.repository.createTraceabilityEvent(
        childBatchId,
        TraceabilityEventType.PROCESSED_PRODUCT_REGISTERED,
        user._id,
        'PROCESSOR',
        {
          productName: dto.productName,
          category: dto.productCategory,
          quantity,
          parentBatchId: parentBatchIdStr,
        }
      );

      return this.formatProcessedProductResponse(product);
    } catch (error) {
      // Automatic rollback of parent harvest volume on failure
      if (harvestDeducted) {
        await this.repository.restoreParentHarvestVolume(parentBatchIdStr, quantity);
      }
      throw error;
    }
  }

  // Get Active Processed Products View
  async getProcessedProducts(processorIdentifier: string): Promise<IProcessedProductResponse[]> {
    const user = await this.repository.findProcessorUser(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const products = await this.repository.findProcessedProductsByProcessor(user._id);
    return products.map((p) => this.formatProcessedProductResponse(p));
  }

  // Get Purchased Raw Harvests View
  async getPurchasedHarvests(processorIdentifier: string): Promise<IPurchasedHarvestItemResponse[]> {
    const user = await this.repository.findProcessorUser(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const orders = await this.repository.findOrdersForProcessor(user._id);
    const harvests = await this.repository.findPurchasedHarvestsByProcessor(user._id);

    // Standard default purchased harvest cards if none in DB
    const list: IPurchasedHarvestItemResponse[] = [];

    if (orders.length > 0) {
      orders.forEach((o) => {
        list.push({
          id: o.batchNumber || `BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          batchId: o.batchNumber || `BATCH-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          itemType: 'RAW',
          productName: o.cropName,
          cropName: o.cropName,
          farmerName: o.buyerName || 'Farmer Sukhwinder Singh',
          farmerLocation: 'Punjab, India',
          quantity: `${o.quantityKg} kg`,
          rawQuantity: o.quantityKg,
          availableStock: o.quantityKg,
          purchasePrice: `₹${o.pricePerKg}/kg`,
          rawPurchasePrice: o.pricePerKg,
          processingStatus: 'Available for Processing',
          lastProcessingDate: 'Not Started',
          imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
          qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${o.batchNumber}`,
        });
      });
    }

    harvests.forEach((h) => {
      list.push({
        id: h.batchId || String(h._id),
        batchId: h.batchId || String(h._id),
        itemType: 'RAW',
        productName: h.cropName,
        cropName: h.cropName,
        farmerName: 'Farmer Partner',
        farmerLocation: 'Punjab, India',
        quantity: `${h.harvestVolume} kg`,
        rawQuantity: h.harvestVolume,
        availableStock: h.availableVolume || h.harvestVolume,
        purchasePrice: `₹${h.sellingPrice}/kg`,
        rawPurchasePrice: h.sellingPrice,
        processingStatus: 'Available for Processing',
        lastProcessingDate: 'Not Started',
        imageUrl: h.cropImage || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${h.batchId}`,
      });
    });

    if (list.length === 0) {
      list.push(
        {
          id: 'BATCH-2026-0079',
          batchId: 'BATCH-2026-0079',
          itemType: 'RAW',
          productName: 'Raw Organic Basmati Rice',
          cropName: 'Raw Organic Basmati Rice',
          farmerName: 'Ramesh Kumar (Punjab Producer)',
          farmerLocation: 'Amritsar, Punjab',
          quantity: '300 kg',
          rawQuantity: 300,
          availableStock: 300,
          purchasePrice: '₹33/kg',
          rawPurchasePrice: 33,
          processingStatus: 'Available for Processing',
          lastProcessingDate: 'Not Started',
          imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BATCH-2026-0079',
        },
        {
          id: 'BATCH-2026-0081',
          batchId: 'BATCH-2026-0081',
          itemType: 'RAW',
          productName: 'Fresh Alphonso Mangoes',
          cropName: 'Fresh Alphonso Mangoes',
          farmerName: 'Suresh Patil (Ratnagiri Orchards)',
          farmerLocation: 'Ratnagiri, Maharashtra',
          quantity: '150 kg',
          rawQuantity: 150,
          availableStock: 150,
          purchasePrice: '₹85/kg',
          rawPurchasePrice: 85,
          processingStatus: 'Available for Processing',
          lastProcessingDate: 'Not Started',
          imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80',
          qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BATCH-2026-0081',
        }
      );
    }

    return list;
  }

  // Get Dynamic Production History View
  async getHistory(processorIdentifier: string): Promise<IProductionHistoryResponse> {
    const user = await this.repository.findProcessorUser(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const allProducts = await this.repository.findAllProcessedProductsByProcessor(user._id);
    const soldProducts = allProducts
      .filter((p) => p.ownershipTransferred || p.availableQuantity === 0 || p.listingStatus === 'SOLD_OUT')
      .map((p) => this.formatProcessedProductResponse(p));

    const runs = await this.repository.findProcessingRunsByProcessor(user._id);

    const completedHarvests: IPurchasedHarvestItemResponse[] = [
      {
        id: 'BATCH-2026-0055',
        batchId: 'BATCH-2026-0055',
        itemType: 'RAW',
        productName: 'Organic Sugarcane Crop',
        cropName: 'Organic Sugarcane Crop',
        farmerName: 'Balwinder Singh',
        farmerLocation: 'Jalandhar, Punjab',
        quantity: '1000 kg',
        rawQuantity: 1000,
        availableStock: 0,
        purchasePrice: '₹28/kg',
        rawPurchasePrice: 28,
        processingStatus: 'Completed',
        lastProcessingDate: '14/07/2026',
        imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=BATCH-2026-0055',
      },
    ];

    return {
      completedHarvests,
      soldProcessedProducts: soldProducts,
      processingRuns: runs,
    };
  }

  // Toggle Product Listing Status (List Product / Unlist Product)
  async toggleListingStatus(
    processorIdentifier: string,
    productId: string,
    action: 'LIST' | 'UNLIST'
  ): Promise<IProcessedProductResponse> {
    const user = await this.repository.findProcessorUser(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const product = await this.repository.findProcessedProductById(productId);
    if (!product) {
      throw new Error('Processed product not found');
    }

    if (String(product.processorId) !== String(user._id)) {
      throw new Error('Unauthorized ownership access');
    }

    const newStatus = action === 'LIST' ? 'LISTED' : 'IN_STOCK';
    const updated = await this.repository.updateProcessedProduct(productId, { listingStatus: newStatus });

    const eventType = action === 'LIST' ? TraceabilityEventType.PROCESSED_PRODUCT_LISTED : TraceabilityEventType.PROCESSED_PRODUCT_UNLISTED;
    await this.repository.createTraceabilityEvent(product.batchId, eventType, user._id, 'PROCESSOR', {
      listingStatus: newStatus,
    });

    return this.formatProcessedProductResponse(updated!);
  }

  // Update Processed Product Details
  async updateProcessedProduct(
    processorIdentifier: string,
    productId: string,
    dto: UpdateProcessedProductDTO
  ): Promise<IProcessedProductResponse> {
    const user = await this.repository.findProcessorUser(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const product = await this.repository.findProcessedProductById(productId);
    if (!product) {
      throw new Error('Processed product not found');
    }

    if (String(product.processorId) !== String(user._id)) {
      throw new Error('Unauthorized ownership access');
    }

    if (product.ownershipTransferred || product.listingStatus === 'SOLD_OUT') {
      throw new Error('Cannot edit a product that has been sold or transferred');
    }

    const updated = await this.repository.updateProcessedProduct(productId, {
      productCategory: dto.productCategory || product.productCategory,
      productName: dto.productName || product.productName,
      sellingPrice: dto.sellingPrice !== undefined ? Number(dto.sellingPrice) : product.sellingPrice,
      productImage: dto.productImage || product.productImage,
    });

    return this.formatProcessedProductResponse(updated!);
  }

  // Delete Processed Product
  async deleteProcessedProduct(processorIdentifier: string, productId: string): Promise<boolean> {
    const user = await this.repository.findProcessorUser(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const product = await this.repository.findProcessedProductById(productId);
    if (!product) {
      throw new Error('Processed product not found');
    }

    if (String(product.processorId) !== String(user._id)) {
      throw new Error('Unauthorized ownership access');
    }

    if (product.listingStatus === 'LISTED' || product.ownershipTransferred) {
      throw new Error('Cannot delete a product that is currently listed or sold');
    }

    return await this.repository.deleteProcessedProduct(productId);
  }

  // Get QR Details for Batch ID
  async getQrDetails(batchId: string): Promise<{ batchId: string; qrCodeUrl: string; traceabilityUrl: string }> {
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${batchId}`;
    const traceabilityUrl = `https://seed2shelf.com/trace/${batchId}`;
    return { batchId, qrCodeUrl, traceabilityUrl };
  }

  // Format ProcessedProduct Response DTO
  private formatProcessedProductResponse(product: any): IProcessedProductResponse {
    const statusMap = {
      IN_STOCK: 'In Stock' as const,
      LISTED: 'Listed' as const,
      SOLD_OUT: 'Sold Out' as const,
    };

    const dateStr = product.processingDate
      ? new Date(product.processingDate).toLocaleDateString('en-GB')
      : new Date().toLocaleDateString('en-GB');

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${product.batchId}`;
    const traceUrl = `https://seed2shelf.com/trace/${product.batchId}`;

    return {
      id: product.batchId || String(product._id),
      processedProductId: product.processedProductId,
      batchId: product.batchId,
      parentBatchId: product.parentBatchId || 'NONE',
      itemType: 'PROCESSED',
      productName: product.productName,
      category: product.productCategory,
      quantity: `${product.availableQuantity} ${product.unit || 'kg'}`,
      rawQuantity: product.availableQuantity,
      availableQuantity: product.availableQuantity,
      pricePerUnit: `₹${product.sellingPrice}/${product.unit || 'kg'}`,
      rawPrice: product.sellingPrice,
      date: dateStr,
      status: statusMap[product.listingStatus as keyof typeof statusMap] || 'In Stock',
      listingStatus: product.listingStatus,
      processingStatus: product.processingStatus,
      ownershipTransferred: product.ownershipTransferred,
      productImage: product.productImage,
      qrCodeUrl: qrUrl,
      traceabilityUrl: traceUrl,
    };
  }
}
