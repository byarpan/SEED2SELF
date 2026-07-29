import mongoose from 'mongoose';
import Harvest, { IHarvest } from '../../../shared/models/Harvest.js';
import BatchLineage, { IBatchLineage } from '../../../shared/models/BatchLineage.js';
import TraceabilityEvent, { ITraceabilityEvent } from '../../../shared/models/TraceabilityEvent.js';
import Shipment, { IShipment } from '../../../shared/models/Shipment.js';
import Order, { IOrder } from '../../../shared/models/Order.js';
import Payment, { IPayment } from '../../../shared/models/Payment.js';
import User, { IUser } from '../../../shared/models/User.js';
import Farm, { IFarm } from '../../../shared/models/Farm.js';
import ProcessedProduct, { IProcessedProduct } from '../../../shared/models/ProcessedProduct.js';
import ProcessingRun, { IProcessingRun } from '../../../shared/models/ProcessingRun.js';

export class TraceabilityRepository {
  /**
   * Find Harvest by Batch ID
   */
  async findHarvestByBatchId(batchId: string): Promise<IHarvest | null> {
    return Harvest.findOne({ batchId }).exec();
  }

  /**
   * Find Harvest by MongoDB ObjectId
   */
  async findHarvestById(id: string): Promise<IHarvest | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    return Harvest.findById(id).exec();
  }

  /**
   * Find Processed Product by Batch ID or Processed Product ID
   */
  async findProcessedProductByBatchId(batchId: string): Promise<IProcessedProduct | null> {
    return ProcessedProduct.findOne({
      $or: [{ batchId }, { processedProductId: batchId }],
    }).exec();
  }

  /**
   * Find Processing Run by Child Batch ID
   */
  async findProcessingRunByChildBatchId(childBatchId: string): Promise<IProcessingRun | null> {
    return ProcessingRun.findOne({ childBatchId }).exec();
  }

  /**
   * Find Farmer User by ID
   */
  async findFarmerById(farmerId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    if (typeof farmerId === 'string' && !mongoose.Types.ObjectId.isValid(farmerId)) return null;
    return User.findById(farmerId).exec();
  }

  /**
   * Find Farm by ID
   */
  async findFarmById(farmId: string | mongoose.Types.ObjectId): Promise<IFarm | null> {
    if (typeof farmId === 'string' && !mongoose.Types.ObjectId.isValid(farmId)) return null;
    return Farm.findById(farmId).exec();
  }

  /**
   * Find Shipment by Batch ID
   */
  async findShipmentByBatchId(batchId: string): Promise<IShipment | null> {
    return Shipment.findOne({
      $or: [{ batchId }, { shipmentId: batchId }],
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find Orders by Batch Number
   */
  async findOrdersByBatchNumber(batchNumber: string): Promise<IOrder[]> {
    return Order.find({
      $or: [{ batchNumber }, { orderNumber: batchNumber }],
    })
      .sort({ createdAt: -1 })
      .exec();
  }

  /**
   * Find Payment by Order ID
   */
  async findPaymentByOrderId(orderId: string): Promise<IPayment | null> {
    const isObjId = mongoose.Types.ObjectId.isValid(orderId);
    return Payment.findOne({
      $or: [
        { orderId: isObjId ? new mongoose.Types.ObjectId(orderId) : null },
        { paymentId: orderId },
      ],
    }).exec();
  }

  /**
   * Find Traceability Events by Batch ID
   */
  async findTraceabilityEvents(batchId: string): Promise<ITraceabilityEvent[]> {
    return TraceabilityEvent.find({ batchId }).sort({ timestamp: 1 }).exec();
  }

  /**
   * Find Child Batches from BatchLineage
   */
  async findChildBatches(parentBatchId: string): Promise<IBatchLineage[]> {
    return BatchLineage.find({ parentBatchId }).exec();
  }

  /**
   * Find Parent Lineage records for a Child Batch ID
   */
  async findParentLineages(childBatchId: string): Promise<IBatchLineage[]> {
    return BatchLineage.find({ childBatchId }).exec();
  }

  /**
   * Find User by ID
   */
  async findUserById(userId: string | mongoose.Types.ObjectId): Promise<IUser | null> {
    if (typeof userId === 'string' && !mongoose.Types.ObjectId.isValid(userId)) return null;
    return User.findById(userId).exec();
  }
}

export const traceabilityRepository = new TraceabilityRepository();
