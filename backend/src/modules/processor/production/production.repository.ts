import mongoose from 'mongoose';
import { User, IUser } from '../../../shared/models/User.js';
import { Harvest, IHarvest } from '../../../shared/models/Harvest.js';
import { ProcessedProduct, IProcessedProduct } from '../../../shared/models/ProcessedProduct.js';
import { ProcessingRun, IProcessingRun } from '../../../shared/models/ProcessingRun.js';
import { BatchLineage, IBatchLineage } from '../../../shared/models/BatchLineage.js';
import { TraceabilityEvent, ITraceabilityEvent } from '../../../shared/models/TraceabilityEvent.js';
import { TraceabilityEventType } from '../../../shared/enums/TraceabilityEventType.js';
import { Order, IOrder } from '../../../shared/models/Order.js';

export class ProductionRepository {
  async findProcessorUser(identifier: string): Promise<IUser | null> {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      const user = await User.findById(identifier);
      if (user) return user;
    }
    return await User.findOne({
      $or: [
        { email: identifier },
        { _id: mongoose.Types.ObjectId.isValid(identifier) ? identifier : null },
        { role: 'PROCESSOR' },
      ],
    });
  }

  async findHarvestByBatchIdOrId(batchOrId: string): Promise<IHarvest | null> {
    if (mongoose.Types.ObjectId.isValid(batchOrId)) {
      const harvest = await Harvest.findById(batchOrId);
      if (harvest) return harvest;
    }
    return await Harvest.findOne({
      $or: [{ batchNumber: batchOrId }, { harvestId: batchOrId }],
    });
  }

  async countChildBatchesForParent(parentBatchId: string): Promise<number> {
    return await BatchLineage.countDocuments({ parentBatchId });
  }

  async deductParentHarvestVolume(batchIdOrId: string, volume: number): Promise<IHarvest | null> {
    let query: any = { availableVolume: { $gte: volume } };
    if (mongoose.Types.ObjectId.isValid(batchIdOrId)) {
      query.$or = [{ _id: batchIdOrId }, { batchId: batchIdOrId }];
    } else {
      query.batchId = batchIdOrId;
    }

    return await Harvest.findOneAndUpdate(
      query,
      { $inc: { availableVolume: -volume } },
      { new: true }
    );
  }

  async restoreParentHarvestVolume(batchIdOrId: string, volume: number): Promise<void> {
    let query: any = {};
    if (mongoose.Types.ObjectId.isValid(batchIdOrId)) {
      query.$or = [{ _id: batchIdOrId }, { batchId: batchIdOrId }];
    } else {
      query.batchId = batchIdOrId;
    }

    await Harvest.updateOne(query, { $inc: { availableVolume: volume } });
  }

  async createBatchLineage(
    parentBatchId: string,
    childBatchId: string,
    createdBy: mongoose.Types.ObjectId
  ): Promise<IBatchLineage> {
    const lineage = new BatchLineage({
      parentBatchId,
      childBatchId,
      createdBy,
    });
    return await lineage.save();
  }

  async createTraceabilityEvent(
    batchId: string,
    eventType: TraceabilityEventType,
    performedBy: mongoose.Types.ObjectId,
    performedByRole: string,
    metadata?: Record<string, any>
  ): Promise<ITraceabilityEvent> {
    const event = new TraceabilityEvent({
      batchId,
      eventType,
      performedBy,
      performedByRole,
      metadata,
      timestamp: new Date(),
    });
    return await event.save();
  }

  async createProcessedProduct(data: Partial<IProcessedProduct>): Promise<IProcessedProduct> {
    const product = new ProcessedProduct(data);
    return await product.save();
  }

  async createProcessingRun(data: Partial<IProcessingRun>): Promise<IProcessingRun> {
    const run = new ProcessingRun(data);
    return await run.save();
  }

  async findProcessedProductsByProcessor(processorId: mongoose.Types.ObjectId): Promise<IProcessedProduct[]> {
    return await ProcessedProduct.find({
      processorId,
      ownershipTransferred: false,
      availableQuantity: { $gt: 0 },
    }).sort({ createdAt: -1 });
  }

  async findAllProcessedProductsByProcessor(processorId: mongoose.Types.ObjectId): Promise<IProcessedProduct[]> {
    return await ProcessedProduct.find({ processorId }).sort({ createdAt: -1 });
  }

  async findProcessedProductById(id: string): Promise<IProcessedProduct | null> {
    if (mongoose.Types.ObjectId.isValid(id)) {
      const prod = await ProcessedProduct.findById(id);
      if (prod) return prod;
    }
    return await ProcessedProduct.findOne({
      $or: [{ processedProductId: id }, { batchId: id }],
    });
  }

  async updateProcessedProduct(
    id: string,
    updateData: Partial<IProcessedProduct>
  ): Promise<IProcessedProduct | null> {
    let query: any = { _id: mongoose.Types.ObjectId.isValid(id) ? id : null };
    let prod = await ProcessedProduct.findOne({
      $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { processedProductId: id }, { batchId: id }],
    });
    if (!prod) return null;

    Object.assign(prod, updateData);
    return await prod.save();
  }

  async deleteProcessedProduct(id: string): Promise<boolean> {
    const res = await ProcessedProduct.deleteOne({
      $or: [{ _id: mongoose.Types.ObjectId.isValid(id) ? id : null }, { processedProductId: id }, { batchId: id }],
    });
    return (res.deletedCount || 0) > 0;
  }

  async findPurchasedHarvestsByProcessor(processorId: mongoose.Types.ObjectId): Promise<IHarvest[]> {
    // 1. Direct harvests owned by or assigned to processor
    const directHarvests = await Harvest.find({
      $or: [{ processorId }, { harvestStatus: 'ACTIVE' }, { listingStatus: 'LISTED' }],
    }).sort({ createdAt: -1 });

    // 2. Purchased harvests via Orders
    const orders = await Order.find({ processorId, paymentStatus: 'SUCCESS' }).populate('farmerId');
    return directHarvests;
  }

  async findOrdersForProcessor(processorId: mongoose.Types.ObjectId): Promise<IOrder[]> {
    return await Order.find({ processorId }).sort({ createdAt: -1 });
  }

  async findProcessingRunsByProcessor(processorId: mongoose.Types.ObjectId): Promise<IProcessingRun[]> {
    return await ProcessingRun.find({ processorId }).sort({ createdAt: -1 });
  }
}
