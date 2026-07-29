import QRCode from 'qrcode';
import { HarvestRepository, harvestRepository } from './harvest.repository.js';
import { RegisterHarvestDTO, UpdateHarvestDTO, HarvestQueryDTO } from './dto/harvest.dto.js';
import { HarvestResponse, HarvestQRResponse, HarvestListResponse } from './interfaces/harvest.interface.js';
import { IHarvest } from '../../../shared/models/Harvest.js';
import { ListingStatus } from '../../../shared/enums/ListingStatus.js';
import { HarvestStatus } from '../../../shared/enums/HarvestStatus.js';
import { TraceabilityEventType } from '../../../shared/enums/TraceabilityEventType.js';
import { generateBatchId } from '../../../shared/helpers/sequence.helper.js';

export class HarvestService {
  constructor(private repository: HarvestRepository = harvestRepository) {}

  private mapHarvestToResponse(harvest: IHarvest): HarvestResponse {
    return {
      id: harvest._id.toString(),
      batchId: harvest.batchId,
      farmerId: harvest.farmerId.toString(),
      farmId: harvest.farmId ? harvest.farmId.toString() : undefined,
      cropCategory: harvest.cropCategory,
      cropName: harvest.cropName,
      cropVariety: harvest.cropVariety || 'None',
      harvestVolume: harvest.harvestVolume,
      availableVolume: harvest.availableVolume,
      sellingPrice: harvest.sellingPrice,
      harvestDate: harvest.harvestDate,
      cropImage: harvest.cropImage,
      listingStatus: harvest.listingStatus,
      harvestStatus: harvest.harvestStatus,
      createdAt: harvest.createdAt,
      updatedAt: harvest.updatedAt,
    };
  }

  async registerHarvest(userId: string, dto: RegisterHarvestDTO): Promise<HarvestResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const batchId = await generateBatchId();

    const harvestData: Partial<IHarvest> = {
      batchId,
      farmerId: user._id,
      farmId: dto.farmId ? (dto.farmId as any) : undefined,
      cropCategory: dto.cropCategory.trim(),
      cropName: dto.cropName.trim(),
      cropVariety: dto.cropVariety ? dto.cropVariety.trim() : 'None',
      harvestVolume: dto.harvestVolume,
      availableVolume: dto.harvestVolume,
      sellingPrice: dto.sellingPrice,
      harvestDate: new Date(dto.harvestDate),
      cropImage: dto.cropImage,
      listingStatus: ListingStatus.LISTED,
      harvestStatus: HarvestStatus.ACTIVE,
    };

    const harvest = await this.repository.createHarvest(harvestData);

    // Create Append-Only Traceability Events
    await this.repository.createTraceabilityEvent({
      batchId,
      eventType: TraceabilityEventType.HARVEST_REGISTERED,
      performedBy: user._id,
      performedByRole: 'FARMER',
      metadata: {
        cropCategory: harvest.cropCategory,
        cropName: harvest.cropName,
        cropVariety: harvest.cropVariety,
        harvestVolume: harvest.harvestVolume,
        sellingPrice: harvest.sellingPrice,
        harvestDate: harvest.harvestDate,
      },
      timestamp: new Date(),
    });

    await this.repository.createTraceabilityEvent({
      batchId,
      eventType: TraceabilityEventType.HARVEST_LISTED,
      performedBy: user._id,
      performedByRole: 'FARMER',
      timestamp: new Date(),
    });

    return this.mapHarvestToResponse(harvest);
  }

  async getActiveHarvests(userId: string, query?: HarvestQueryDTO): Promise<HarvestListResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const { harvests, total } = await this.repository.findActiveHarvestsByFarmerId(user, query);
    const limit = query?.limit || 50;
    const page = query?.page || 1;

    return {
      harvests: harvests.map((h) => this.mapHarvestToResponse(h)),
      total,
      page,
      limit,
    };
  }

  async getHarvestHistory(userId: string, query?: HarvestQueryDTO): Promise<HarvestListResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const { harvests, total } = await this.repository.findSoldHarvestsByFarmerId(user, query);
    const limit = query?.limit || 50;
    const page = query?.page || 1;

    return {
      harvests: harvests.map((h) => this.mapHarvestToResponse(h)),
      total,
      page,
      limit,
    };
  }

  async getHarvestDetails(harvestIdOrBatchId: string): Promise<HarvestResponse> {
    let harvest = await this.repository.findHarvestByBatchId(harvestIdOrBatchId);
    if (!harvest && harvestIdOrBatchId.match(/^[0-9a-fA-F]{24}$/)) {
      harvest = await this.repository.findHarvestById(harvestIdOrBatchId);
    }

    if (!harvest) {
      throw new Error(`Harvest batch '${harvestIdOrBatchId}' not found in MongoDB Atlas`);
    }

    return this.mapHarvestToResponse(harvest);
  }

  async updateHarvest(userId: string, harvestId: string, dto: UpdateHarvestDTO): Promise<HarvestResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const harvest = await this.repository.findHarvestById(harvestId);
    if (!harvest) {
      throw new Error(`Harvest batch '${harvestId}' not found in MongoDB Atlas`);
    }

    if (harvest.farmerId.toString() !== user._id.toString() && harvest.farmerId.toString() !== user.farmerId) {
      throw new Error('Unauthorized to update this harvest batch');
    }

    if (harvest.harvestStatus === HarvestStatus.SOLD) {
      throw new Error('Cannot edit a harvest batch that has already been purchased/sold.');
    }

    const childBatches = await this.repository.findChildBatches(harvest.batchId);
    if (childBatches.length > 0) {
      throw new Error('Cannot edit a harvest batch that has been processed into child batches.');
    }

    const updatePayload: Partial<IHarvest> = {};
    if (dto.cropCategory !== undefined) updatePayload.cropCategory = dto.cropCategory.trim();
    if (dto.cropName !== undefined) updatePayload.cropName = dto.cropName.trim();
    if (dto.cropVariety !== undefined) updatePayload.cropVariety = dto.cropVariety.trim();
    if (dto.sellingPrice !== undefined) updatePayload.sellingPrice = dto.sellingPrice;
    if (dto.cropImage !== undefined) updatePayload.cropImage = dto.cropImage;
    if (dto.harvestVolume !== undefined) {
      updatePayload.harvestVolume = dto.harvestVolume;
      const volumeDiff = dto.harvestVolume - harvest.harvestVolume;
      updatePayload.availableVolume = Math.max(0, harvest.availableVolume + volumeDiff);
    }

    if (dto.harvestDate !== undefined) {
      updatePayload.harvestDate = new Date(dto.harvestDate);
    }

    const updatedHarvest = await this.repository.updateHarvest(harvestId, updatePayload);
    if (!updatedHarvest) {
      throw new Error('Failed to update harvest in MongoDB Atlas');
    }

    // Append-Only Traceability Event
    await this.repository.createTraceabilityEvent({
      batchId: harvest.batchId,
      eventType: TraceabilityEventType.HARVEST_UPDATED,
      performedBy: user._id,
      performedByRole: 'FARMER',
      metadata: updatePayload,
      timestamp: new Date(),
    });

    return this.mapHarvestToResponse(updatedHarvest);
  }

  async deleteHarvest(userId: string, harvestId: string): Promise<boolean> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const harvest = await this.repository.findHarvestById(harvestId);
    if (!harvest) {
      throw new Error(`Harvest batch '${harvestId}' not found in MongoDB Atlas`);
    }

    if (harvest.farmerId.toString() !== user._id.toString() && harvest.farmerId.toString() !== user.farmerId) {
      throw new Error('Unauthorized to delete this harvest batch');
    }

    if (harvest.harvestStatus === HarvestStatus.SOLD) {
      throw new Error('Cannot delete a harvest batch that has already been purchased/sold.');
    }

    const childBatches = await this.repository.findChildBatches(harvest.batchId);
    if (childBatches.length > 0) {
      throw new Error('Cannot delete a harvest batch that has child processing batches.');
    }

    const deleted = await this.repository.deleteHarvest(harvestId);

    // Append-Only Traceability Event
    await this.repository.createTraceabilityEvent({
      batchId: harvest.batchId,
      eventType: TraceabilityEventType.HARVEST_DELETED,
      performedBy: user._id,
      performedByRole: 'FARMER',
      timestamp: new Date(),
    });

    return deleted;
  }

  async listProduct(userId: string, harvestId: string): Promise<HarvestResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const harvest = await this.repository.findHarvestById(harvestId);
    if (!harvest) {
      throw new Error(`Harvest batch '${harvestId}' not found in MongoDB Atlas`);
    }

    const updatedHarvest = await this.repository.updateHarvest(harvestId, {
      listingStatus: ListingStatus.LISTED,
    });

    if (!updatedHarvest) {
      throw new Error('Failed to list harvest batch');
    }

    await this.repository.createTraceabilityEvent({
      batchId: harvest.batchId,
      eventType: TraceabilityEventType.HARVEST_LISTED,
      performedBy: user._id,
      performedByRole: 'FARMER',
      timestamp: new Date(),
    });

    return this.mapHarvestToResponse(updatedHarvest);
  }

  async unlistProduct(userId: string, harvestId: string): Promise<HarvestResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const harvest = await this.repository.findHarvestById(harvestId);
    if (!harvest) {
      throw new Error(`Harvest batch '${harvestId}' not found in MongoDB Atlas`);
    }

    const updatedHarvest = await this.repository.updateHarvest(harvestId, {
      listingStatus: ListingStatus.UNLISTED,
    });

    if (!updatedHarvest) {
      throw new Error('Failed to unlist harvest batch');
    }

    await this.repository.createTraceabilityEvent({
      batchId: harvest.batchId,
      eventType: TraceabilityEventType.HARVEST_UNLISTED,
      performedBy: user._id,
      performedByRole: 'FARMER',
      timestamp: new Date(),
    });

    return this.mapHarvestToResponse(updatedHarvest);
  }

  async getQR(harvestIdOrBatchId: string): Promise<HarvestQRResponse> {
    let harvest = await this.repository.findHarvestByBatchId(harvestIdOrBatchId);
    if (!harvest && harvestIdOrBatchId.match(/^[0-9a-fA-F]{24}$/)) {
      harvest = await this.repository.findHarvestById(harvestIdOrBatchId);
    }

    if (!harvest) {
      throw new Error(`Harvest batch '${harvestIdOrBatchId}' not found in MongoDB Atlas`);
    }

    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const traceUrl = `${baseUrl}/trace/${harvest.batchId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(traceUrl, { margin: 2, width: 300 });

    return {
      batchId: harvest.batchId,
      traceUrl,
      qrCodeDataUrl,
    };
  }
}

export const harvestService = new HarvestService();
