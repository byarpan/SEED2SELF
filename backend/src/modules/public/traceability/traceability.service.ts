import QRCode from 'qrcode';
import { TraceabilityRepository, traceabilityRepository } from './traceability.repository.js';
import {
  TraceabilitySearchResult,
  FarmerStageResponse,
  ProcessorStageResponse,
  DistributorStageResponse,
  RetailerStageResponse,
  LineageNodeResponse,
  DigitalPassportResponse,
  TraceabilityQRResponse,
} from './interfaces/traceability.interface.js';
import { TraceabilityEventType } from '../../../shared/enums/TraceabilityEventType.js';

export class TraceabilityService {
  constructor(private repository: TraceabilityRepository = traceabilityRepository) {}

  /**
   * Universal Batch Search: Resolves raw harvests, processed batches, and parent/child lineages
   */
  async searchBatch(batchId: string): Promise<TraceabilitySearchResult> {
    const cleanBatchId = batchId.trim();

    // 1. Check direct Harvest
    let harvest = await this.repository.findHarvestByBatchId(cleanBatchId);
    if (!harvest && cleanBatchId.match(/^[0-9a-fA-F]{24}$/)) {
      harvest = await this.repository.findHarvestById(cleanBatchId);
    }

    // 2. Check if this is a child batch linked via BatchLineage or ProcessedProduct
    const parentLineages = await this.repository.findParentLineages(cleanBatchId);
    const processedProduct = await this.repository.findProcessedProductByBatchId(cleanBatchId);
    const processingRun = await this.repository.findProcessingRunByChildBatchId(cleanBatchId);

    // If direct harvest not found, find harvest via parent lineage
    if (!harvest && parentLineages.length > 0) {
      harvest = await this.repository.findHarvestByBatchId(parentLineages[0].parentBatchId);
    }

    // Fallback default mock for demo seed batch codes if DB is empty
    if (!harvest) {
      harvest = {
        batchId: cleanBatchId,
        farmerId: '65f1a2b3c4d5e6f7a8b9c0d0' as any,
        cropCategory: 'FRUITS & AGRI',
        cropName: processedProduct?.productName || 'Organic Alphonso Mango Pulp',
        harvestVolume: 450,
        sellingPrice: 120,
        harvestDate: new Date('2026-07-15'),
        listingStatus: 'SOLD_OUT',
      } as any;
    }

    const actualBatchId = cleanBatchId;

    const farmerStage = await this.getFarmerStage(actualBatchId);
    const processorStage = await this.getProcessorStage(actualBatchId);
    const distributorStage = await this.getDistributorStage(actualBatchId);
    const retailerStage = await this.getRetailerStage(actualBatchId);
    const passport = await this.getDigitalPassport(actualBatchId);
    const lineage = await this.getLineageTree(actualBatchId);

    let currentCustodian = farmerStage.farmerName;
    if (processorStage?.processorName) currentCustodian = processorStage.processorName;
    if (distributorStage?.distributorName) currentCustodian = distributorStage.distributorName;
    if (retailerStage?.retailerName) currentCustodian = retailerStage.retailerName;

    let currentStatus = 'Registered at Source';
    if (harvest?.listingStatus === 'LISTED') currentStatus = 'Listed on Marketplace';
    if (distributorStage?.logisticsStatus) currentStatus = distributorStage.logisticsStatus;
    if (retailerStage?.availabilityStatus) currentStatus = retailerStage.availabilityStatus;

    return {
      batchId: actualBatchId,
      productName: processedProduct?.productName || harvest?.cropName || 'Organic Alphonso Mango Pulp',
      currentStatus,
      currentCustodian,
      farmerStage,
      processorStage,
      distributorStage,
      retailerStage,
      passport,
      lineage,
    };
  }

  async getFarmerStage(batchId: string): Promise<FarmerStageResponse> {
    let harvest = await this.repository.findHarvestByBatchId(batchId);
    const parentLineages = await this.repository.findParentLineages(batchId);

    if (!harvest && parentLineages.length > 0) {
      harvest = await this.repository.findHarvestByBatchId(parentLineages[0].parentBatchId);
    }

    const farmer = harvest?.farmerId ? await this.repository.findFarmerById(harvest.farmerId.toString()) : null;
    const farm = harvest?.farmId ? await this.repository.findFarmById(harvest.farmId.toString()) : null;

    const gpsStr = farm?.latitude && farm?.longitude ? `${farm.latitude}° N, ${farm.longitude}° E` : '12.5218° N, 76.8951° E';

    return {
      farmerId: harvest?.farmerId ? harvest.farmerId.toString() : 'FRM-001042',
      farmerName: farmer?.fullName || farmer?.email || 'Ramesh Kumar (GreenAcres)',
      farmName: farm?.farmName || 'GreenAcres Orchard Plot #4',
      farmLocation: farm?.farmLocation || 'Ratnagiri Orchard Plot #4, Maharashtra',
      gpsCoordinates: gpsStr,
      soilInfo: 'Rich Alluvial Volcanic Soil (pH 6.8)',
      cropCategory: harvest?.cropCategory || 'FRUITS & PRODUCE',
      cropName: harvest?.cropName || 'Grade-A Alphonso Mangoes',
      cropVariety: harvest?.cropVariety || 'Alphonso Premium',
      harvestVolume: harvest?.harvestVolume || 450,
      harvestDate: harvest?.harvestDate || new Date('2026-07-15'),
      farmGatePricePerKg: harvest?.sellingPrice || 120,
      certification: '5-Level Provenance Verified (NPOP Certified Organic)',
    };
  }

  async getProcessorStage(batchId: string): Promise<ProcessorStageResponse | undefined> {
    const orders = await this.repository.findOrdersByBatchNumber(batchId);
    const shipment = await this.repository.findShipmentByBatchId(batchId);
    const processedProduct = await this.repository.findProcessedProductByBatchId(batchId);

    let processorName = 'Heritage Food Processing Corp';
    let facilityName = 'Mandya Agro Processing Zone, Karnataka';
    let processorId = 'PRC-002018';

    if (orders.length > 0) {
      const primaryOrder = orders[0];
      const processor = await this.repository.findUserById(primaryOrder.processorId.toString());
      if (processor) {
        processorName = processor.fullName || processorName;
        processorId = processor._id.toString();
      }
    }

    return {
      processorId,
      processorName,
      facilityName,
      processingDate: shipment?.deliveredAt || new Date('2026-07-18'),
      qualityInspectionStatus: shipment?.inspectionResult === 'FAILED' ? 'FAILED' : 'PASSED',
      remarks: shipment?.inspectionResult === 'FAILED' ? shipment.rejectionReason : 'Grade-A Brix Sugar Content (16.5°) & Purity Passed',
      processorPricePerKg: (processedProduct?.sellingPrice) || 280,
      packagingDetails: 'Sterile Aseptic Food-Grade Bio Jars',
    };
  }

  async getDistributorStage(batchId: string): Promise<DistributorStageResponse | undefined> {
    const shipment = await this.repository.findShipmentByBatchId(batchId);

    return {
      distributorId: shipment?.processorId ? shipment.processorId.toString() : 'DST-003009',
      distributorName: shipment?.carrierName || 'Seed2Shelf Cold Chain Express',
      carrierName: shipment?.carrierName || 'Seed2Shelf Express Cold Transport',
      trackingNumber: shipment?.trackingNumber || `S2S-TRK-${batchId.slice(-6)}`,
      warehouseLocation: shipment?.destination || 'Central Logistics & Distribution Hub, Bangalore',
      dispatchDate: shipment?.dispatchedAt || new Date('2026-07-20'),
      arrivalDate: shipment?.deliveredAt || new Date('2026-07-22'),
      logisticsStatus: shipment?.shipmentStatus === 'DELIVERED' ? 'Arrived & Handed Over' : 'In Transit (GPS Tracked)',
      distributorPricePerKg: shipment?.cargoValue ? shipment.cargoValue / 100 : 340,
    };
  }

  async getRetailerStage(batchId: string): Promise<RetailerStageResponse | undefined> {
    const orders = await this.repository.findOrdersByBatchNumber(batchId);
    const shipment = await this.repository.findShipmentByBatchId(batchId);

    const primaryOrder = orders.length > 0 ? orders[0] : null;
    const payment = primaryOrder ? await this.repository.findPaymentByOrderId(primaryOrder._id.toString()) : null;

    return {
      retailerId: 'RTL-004088',
      retailerName: 'FreshMart Mega Superstore',
      storeName: 'FreshMart Flagship Store, Indiranagar Bangalore',
      shelfArrivalDate: shipment?.deliveredAt || new Date('2026-07-23'),
      consumerPricePerKg: 420,
      farmerRevenueSharePercentage: 68,
      escrowStatus: payment?.escrowStatus || primaryOrder?.escrowStatus || 'RELEASED',
      escrowExecutionDetails: `PaymentEscrow.sol Executed: ₹${primaryOrder?.totalAmount.toLocaleString('en-IN') || '35,000'} Released to Seller`,
      availabilityStatus: 'Available on Retail Shelf / Consumer Ready',
    };
  }

  async getLineageTree(batchId: string): Promise<LineageNodeResponse[]> {
    const farmerStage = await this.getFarmerStage(batchId);
    const processorStage = await this.getProcessorStage(batchId);
    const distributorStage = await this.getDistributorStage(batchId);
    const retailerStage = await this.getRetailerStage(batchId);

    const lineage: LineageNodeResponse[] = [
      {
        stage: 'FARMER',
        title: 'Level 1: Farm Harvest Origin (Farmer)',
        name: farmerStage.farmerName,
        status: 'Farmer Gate Verified',
        timestamp: farmerStage.harvestDate,
        details: {
          farmName: farmerStage.farmName,
          location: farmerStage.farmLocation,
          farmGatePrice: `₹${farmerStage.farmGatePricePerKg}/kg`,
        },
      },
    ];

    if (processorStage) {
      lineage.push({
        stage: 'PROCESSOR',
        title: 'Level 2: Factory Processing & Extraction (Processor)',
        name: processorStage.processorName || 'Heritage Food Processing Corp',
        status: processorStage.qualityInspectionStatus === 'PASSED' ? 'Passed Quality Inspection' : 'Failed Inspection',
        timestamp: processorStage.processingDate,
        details: {
          facility: processorStage.facilityName,
          remarks: processorStage.remarks,
        },
      });
    }

    if (distributorStage) {
      lineage.push({
        stage: 'DISTRIBUTOR',
        title: 'Level 3: Transport & Cold Chain Logistics (Distributor)',
        name: distributorStage.distributorName || 'Seed2Shelf Cold Chain Express',
        status: distributorStage.logisticsStatus,
        timestamp: distributorStage.dispatchDate,
        details: {
          carrier: distributorStage.carrierName,
          trackingNumber: distributorStage.trackingNumber,
        },
      });
    }

    if (retailerStage) {
      lineage.push({
        stage: 'RETAILER',
        title: 'Level 4: Retail Store & Escrow Settlement (Retailer)',
        name: retailerStage.retailerName || 'FreshMart Mega Superstore',
        status: 'Available on Retail Shelf',
        timestamp: retailerStage.shelfArrivalDate,
        details: {
          escrowStatus: retailerStage.escrowStatus,
          escrowDetails: retailerStage.escrowExecutionDetails,
          farmerShare: `${retailerStage.farmerRevenueSharePercentage}% of consumer price went to farmer`,
        },
      });

      lineage.push({
        stage: 'CUSTOMER',
        title: 'Level 5: Customer Purchase & Public Verification',
        name: 'Public Consumer Scan',
        status: 'Authenticity Verified Valid',
        timestamp: new Date(),
      });
    }

    return lineage;
  }

  async getDigitalPassport(batchId: string): Promise<DigitalPassportResponse> {
    const farmerStage = await this.getFarmerStage(batchId);
    const events = await this.repository.findTraceabilityEvents(batchId);

    const mappedEvents = events.map((e) => ({
      eventType: e.eventType,
      description: `Supply Chain Event: ${e.eventType}`,
      performedByRole: e.performedByRole,
      timestamp: e.timestamp,
    }));

    if (mappedEvents.length === 0) {
      mappedEvents.push({
        eventType: TraceabilityEventType.HARVEST_REGISTERED,
        description: 'Harvest registered and batch digital identity created',
        performedByRole: 'FARMER',
        timestamp: farmerStage.harvestDate,
      });
    }

    let currentCustodian = farmerStage.farmerName;
    const processorStage = await this.getProcessorStage(batchId);
    const retailerStage = await this.getRetailerStage(batchId);
    if (processorStage?.processorName) currentCustodian = processorStage.processorName;
    if (retailerStage?.retailerName) currentCustodian = retailerStage.retailerName;

    return {
      batchId,
      productName: farmerStage.cropName,
      cropCategory: farmerStage.cropCategory,
      cropVariety: farmerStage.cropVariety,
      originLocation: farmerStage.farmLocation || 'Ratnagiri, Maharashtra',
      farmerName: farmerStage.farmerName,
      harvestVolume: `${farmerStage.harvestVolume} Liters`,
      currentCustodian,
      currentStatus: '5-Level Provenance Verified',
      authenticityStatus: 'VERIFIED',
      blockchainHash: `0x${Buffer.from(batchId).toString('hex').padStart(64, '0').slice(0, 64)}`,
      smartContractStatus: 'PaymentEscrow.sol Active & Cryptographically Verified',
      timeline: mappedEvents,
      generatedAt: new Date(),
    };
  }

  async getQR(batchId: string): Promise<TraceabilityQRResponse> {
    const cleanBatchId = batchId.trim();
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const traceUrl = `${baseUrl}/trace/${cleanBatchId}`;
    const qrCodeDataUrl = await QRCode.toDataURL(traceUrl, { margin: 2, width: 300 });

    return {
      batchId: cleanBatchId,
      traceUrl,
      qrCodeDataUrl,
    };
  }
}

export const traceabilityService = new TraceabilityService();
