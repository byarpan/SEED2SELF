import { ShipmentRepository, shipmentRepository } from './shipment.repository.js';
import { IncomingShipmentQueryDTO, OutgoingShipmentQueryDTO, RejectDeliveryDTO } from './dto/shipment.dto.js';
import { ShipmentItemResponse, ShipmentListResponse, LogisticsTimelineStep } from './interfaces/shipment.interface.js';
import { IShipment } from '../../../shared/models/Shipment.js';
import { sharedEscrowService } from '../../../shared/services/escrow.service.js';
import { sharedInvoiceService } from '../../../shared/services/invoice.service.js';
import { sharedNotificationService } from '../../../shared/services/notification.service.js';
import { TraceabilityEventType } from '../../../shared/enums/TraceabilityEventType.js';

export class ShipmentService {
  constructor(private repository: ShipmentRepository = shipmentRepository) {}

  private formatCurrency(amount: number): string {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }

  private formatDate(dateInput?: Date | string): string {
    if (!dateInput) return 'N/A';
    const date = new Date(dateInput);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private buildTimeline(shipment: IShipment): LogisticsTimelineStep[] {
    const isAccepted = shipment.inspectionResult === 'PASSED' || shipment.shipmentStatus === 'ACCEPTED';
    const isRejected = shipment.inspectionResult === 'FAILED' || shipment.shipmentStatus === 'REJECTED';
    const isDelivered = shipment.shipmentStatus === 'DELIVERED' || isAccepted || isRejected;

    const dispatchTime = this.formatDate(shipment.dispatchedAt || shipment.createdAt);
    const deliveryTime = shipment.deliveredAt ? this.formatDate(shipment.deliveredAt) : 'Estimated Soon';

    return [
      {
        title: 'Dispatched from Origin',
        location: 'Origin Processing Plant / Farm',
        timestamp: dispatchTime,
        status: 'completed',
        description: 'Cargo verified, packed, and assigned to carrier logistics.',
      },
      {
        title: 'In Transit (GPS Tracked)',
        location: shipment.destination || 'National Highway Logistics Route',
        timestamp: dispatchTime,
        status: isDelivered ? 'completed' : 'current',
        description: 'Live sensor tracking active. Temperature & humidity controlled.',
      },
      {
        title: 'Quality Inspection at Destination',
        location: shipment.destination || 'Destination Warehouse / Facility',
        timestamp: isDelivered ? deliveryTime : 'Awaiting Arrival',
        status: isDelivered ? (isRejected ? 'pending' : 'completed') : 'pending',
        description: isRejected
          ? `Inspection Failed: ${shipment.rejectionReason || 'Cargo rejected'}`
          : 'Inspection passed. Quantity, weight, and grade verified.',
      },
      {
        title: 'Escrow Funds Settlement',
        location: 'Smart Contract Escrow Vault',
        timestamp: isDelivered ? deliveryTime : 'Pending Inspection',
        status: isAccepted ? 'completed' : isRejected ? 'completed' : 'pending',
        description: isAccepted
          ? 'Escrow released automatically to seller wallet.'
          : isRejected
          ? 'Escrow refunded to buyer account.'
          : 'Escrow locked securely in smart contract.',
      },
    ];
  }

  private async mapShipmentToResponse(shipment: IShipment): Promise<ShipmentItemResponse> {
    const order: any = shipment.orderId && typeof shipment.orderId === 'object' && 'totalAmount' in shipment.orderId ? shipment.orderId : null;
    const farmerObj: any = shipment.farmerId && typeof shipment.farmerId === 'object' && 'fullName' in shipment.farmerId ? shipment.farmerId : null;
    const processorObj: any = shipment.processorId && typeof shipment.processorId === 'object' && 'fullName' in shipment.processorId ? shipment.processorId : null;

    const cargoValue = shipment.cargoValue || (order ? order.totalAmount : 0);
    const cargoName = shipment.cargoName || (order ? order.cropName : 'Agricultural Crop Cargo');
    const cargoQuantity = shipment.cargoQuantity || (order ? `${order.quantityKg} kg` : 'Standard Volume');

    let counterpartyName = farmerObj?.fullName || 'Farmer Partner';
    let counterpartyRole = 'Farmer';
    let counterpartyId = farmerObj ? farmerObj._id.toString() : undefined;

    if (processorObj && processorObj.fullName) {
      counterpartyName = processorObj.fullName;
      counterpartyRole = 'Processor';
      counterpartyId = processorObj._id.toString();
    }

    if (order?.buyerName) {
      counterpartyName = order.buyerName;
      counterpartyRole = 'Distributor';
    }

    let escrowStatus: 'LOCKED' | 'RELEASED' | 'REFUNDED' = 'LOCKED';
    let escrowStatusLabel = 'Protected by Escrow Security Protocol';

    if (order) {
      escrowStatus = order.escrowStatus || 'LOCKED';
    }

    if (shipment.inspectionResult === 'PASSED' || shipment.acceptedAt) {
      escrowStatus = 'RELEASED';
      escrowStatusLabel = 'Escrow Released & Settled';
    } else if (shipment.inspectionResult === 'FAILED' || shipment.rejectedAt) {
      escrowStatus = 'REFUNDED';
      escrowStatusLabel = 'Escrow Payment Refunded';
    }

    let shipmentStatusLabel = 'In Transit';
    if (shipment.shipmentStatus === 'DISPATCHED' || shipment.shipmentStatus === 'IN_TRANSIT') {
      shipmentStatusLabel = 'In Transit / Dispatched';
    } else if (shipment.shipmentStatus === 'DELIVERED' || shipment.inspectionResult === 'PASSED') {
      shipmentStatusLabel = 'Delivered & Confirmed';
    } else if (shipment.shipmentStatus === 'REJECTED' || shipment.inspectionResult === 'FAILED') {
      shipmentStatusLabel = 'Rejected & Returned';
    }

    return {
      id: shipment._id.toString(),
      shipmentId: shipment.shipmentId,
      orderId: order ? order._id.toString() : shipment.orderId ? shipment.orderId.toString() : '',
      orderNumber: order ? order.orderNumber : undefined,
      batchId: shipment.batchId,
      dispatchDate: shipment.dispatchedAt || shipment.createdAt,
      formattedDispatchDate: this.formatDate(shipment.dispatchedAt || shipment.createdAt),
      cargoName,
      cargoQuantity,
      cargoValue,
      formattedCargoValue: this.formatCurrency(cargoValue),
      counterpartyId,
      counterpartyName,
      counterpartyRole,
      destination: shipment.destination || 'Processing Facility Zone',
      estimatedArrival: shipment.estimatedDelivery || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      formattedEstimatedArrival: this.formatDate(shipment.estimatedDelivery || new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)),
      escrowStatus,
      escrowStatusLabel,
      shipmentStatus: shipment.shipmentStatus,
      shipmentStatusLabel,
      inspectionResult: shipment.inspectionResult || 'PENDING',
      rejectionReason: shipment.rejectionReason,
      trackingNumber: shipment.trackingNumber,
      carrierName: shipment.carrierName,
      liveLogisticsTimeline: this.buildTimeline(shipment),
      acceptedAt: shipment.acceptedAt,
      rejectedAt: shipment.rejectedAt,
      deliveredAt: shipment.deliveredAt,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
    };
  }

  async getIncomingShipments(processorIdentifier: string, query?: IncomingShipmentQueryDTO): Promise<ShipmentListResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const { shipments, total } = await this.repository.findIncomingShipments(user._id.toString(), query);
    const counts = await this.repository.countShipments(user._id.toString());
    const mappedShipments = await Promise.all(shipments.map((s) => this.mapShipmentToResponse(s)));

    const limit = query?.limit || 50;
    const page = query?.page || 1;

    return {
      shipments: mappedShipments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      counts,
    };
  }

  async getOutgoingShipments(processorIdentifier: string, query?: OutgoingShipmentQueryDTO): Promise<ShipmentListResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const { shipments, total } = await this.repository.findOutgoingShipments(user._id.toString(), query);
    const counts = await this.repository.countShipments(user._id.toString());
    const mappedShipments = await Promise.all(shipments.map((s) => this.mapShipmentToResponse(s)));

    const limit = query?.limit || 50;
    const page = query?.page || 1;

    return {
      shipments: mappedShipments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      counts,
    };
  }

  async getShipmentDetails(processorIdentifier: string, idOrNumber: string): Promise<ShipmentItemResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const shipment = await this.repository.findShipmentByIdOrNumber(idOrNumber);
    if (!shipment) {
      throw new Error('Shipment record not found');
    }

    return this.mapShipmentToResponse(shipment);
  }

  async acceptDelivery(processorIdentifier: string, idOrNumber: string): Promise<ShipmentItemResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const shipment = await this.repository.findShipmentByIdOrNumber(idOrNumber);
    if (!shipment) {
      throw new Error('Shipment record not found');
    }

    if (shipment.inspectionResult === 'PASSED' || shipment.shipmentStatus === 'DELIVERED') {
      throw new Error('Shipment has already been accepted and escrow released.');
    }

    if (shipment.inspectionResult === 'FAILED' || shipment.shipmentStatus === 'REJECTED') {
      throw new Error('Cannot accept a shipment that has already been rejected.');
    }

    const updatedShipment = await this.repository.updateShipment(shipment._id.toString(), {
      shipmentStatus: 'DELIVERED',
      inspectionResult: 'PASSED',
      acceptedAt: new Date(),
      deliveredAt: new Date(),
    });

    if (!updatedShipment) {
      throw new Error('Failed to update shipment status');
    }

    // Fetch order
    const order = await this.repository.findOrderById(shipment.orderId);
    if (order) {
      await this.repository.updateOrderStatus(order._id, 'DELIVERED', 'CONFIRMED', 'RELEASED');

      // Release Escrow
      try {
        await sharedEscrowService.releaseFunds(order.orderNumber);
      } catch (e) {
        console.warn('Escrow release warning:', e);
      }

      // Update Farmer Wallet
      await this.repository.updateFarmerWalletAndAddTransaction(
        order.farmerId,
        order.totalAmount,
        order.orderNumber,
        'Escrow Settlement Received',
        order.cropName
      );

      // Create Official Invoice
      try {
        await sharedInvoiceService.createOfficialInvoice({
          orderId: order._id,
          sellerId: order.farmerId,
          buyerId: user._id,
          invoiceType: 'PURCHASE',
          batchReference: shipment.batchId,
          totalAmount: order.totalAmount,
        });
      } catch (e) {
        console.warn('Invoice creation warning:', e);
      }
    }

    // Update Harvest ownership to processor
    await this.repository.updateHarvestOwnership(shipment.batchId, user._id);

    // Append Traceability Events
    await this.repository.createTraceabilityEvent(
      shipment.batchId,
      TraceabilityEventType.SHIPMENT_DELIVERED,
      user._id,
      'PROCESSOR',
      { shipmentId: shipment.shipmentId, status: 'PASSED' }
    );
    await this.repository.createTraceabilityEvent(
      shipment.batchId,
      TraceabilityEventType.PROCESSOR_RECEIVED,
      user._id,
      'PROCESSOR',
      { shipmentId: shipment.shipmentId, processorName: user.fullName }
    );

    // Send Notification to Farmer
    try {
      await sharedNotificationService.createNotification({
        userId: shipment.farmerId,
        role: 'FARMER',
        title: 'Delivery Accepted & Escrow Released!',
        message: `Processor ${user.fullName} accepted delivery of shipment ${shipment.shipmentId} (${shipment.cargoName}). Escrow funds of ₹ ${shipment.cargoValue?.toLocaleString('en-IN') || 0} have been credited to your wallet.`,
        notificationType: 'SHIPMENT',
        referenceType: 'SHIPMENT',
        referenceId: shipment._id.toString(),
        clickDestination: '/farmer/shipment',
      });
    } catch (e) {
      console.warn('Notification error:', e);
    }

    return this.mapShipmentToResponse(updatedShipment);
  }

  async rejectDelivery(processorIdentifier: string, idOrNumber: string, dto: RejectDeliveryDTO): Promise<ShipmentItemResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    if (!dto || !dto.rejectionReason || !dto.rejectionReason.trim()) {
      throw new Error('Mandatory rejection reason is required when rejecting a delivery.');
    }

    const shipment = await this.repository.findShipmentByIdOrNumber(idOrNumber);
    if (!shipment) {
      throw new Error('Shipment record not found');
    }

    if (shipment.inspectionResult === 'PASSED' || shipment.shipmentStatus === 'DELIVERED') {
      throw new Error('Cannot reject a shipment that has already been accepted.');
    }

    if (shipment.inspectionResult === 'FAILED' || shipment.shipmentStatus === 'REJECTED') {
      throw new Error('Shipment has already been rejected.');
    }

    const updatedShipment = await this.repository.updateShipment(shipment._id.toString(), {
      shipmentStatus: 'REJECTED',
      inspectionResult: 'FAILED',
      rejectionReason: dto.rejectionReason.trim(),
      rejectedAt: new Date(),
    });

    if (!updatedShipment) {
      throw new Error('Failed to update shipment status');
    }

    // Fetch order & refund escrow
    const order = await this.repository.findOrderById(shipment.orderId);
    if (order) {
      await this.repository.updateOrderStatus(order._id, 'REJECTED', 'REJECTED', 'REFUNDED');

      try {
        await sharedEscrowService.refundFunds(order.orderNumber);
      } catch (e) {
        console.warn('Escrow refund warning:', e);
      }

      // Restore Farmer Harvest Inventory
      await this.repository.restoreHarvestInventory(shipment.batchId, order.quantityKg);
    }

    // Append Traceability Event
    await this.repository.createTraceabilityEvent(
      shipment.batchId,
      TraceabilityEventType.SHIPMENT_DELIVERED,
      user._id,
      'PROCESSOR',
      { shipmentId: shipment.shipmentId, status: 'FAILED', reason: dto.rejectionReason }
    );

    // Send Notification to Farmer
    try {
      await sharedNotificationService.createNotification({
        userId: shipment.farmerId,
        role: 'FARMER',
        title: 'Delivery Rejected by Processor',
        message: `Processor ${user.fullName} rejected shipment ${shipment.shipmentId} (${shipment.cargoName}). Reason: ${dto.rejectionReason}. Cargo is being returned and inventory restored.`,
        notificationType: 'SHIPMENT',
        referenceType: 'SHIPMENT',
        referenceId: shipment._id.toString(),
        clickDestination: '/farmer/shipment',
      });
    } catch (e) {
      console.warn('Notification error:', e);
    }

    return this.mapShipmentToResponse(updatedShipment);
  }

  async getShipmentCounts(processorIdentifier: string) {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }
    return this.repository.countShipments(user._id.toString());
  }
}

export const shipmentService = new ShipmentService();
