import { ShipmentRepository, shipmentRepository } from './shipment.repository.js';
import { ShipmentQueryDTO, InspectionDTO, StartShipmentDTO } from './dto/shipment.dto.js';
import {
  ShipmentResponse,
  ShipmentListResponse,
  ShipmentTrackingResponse,
  ShipmentTrackingStep,
} from './interfaces/shipment.interface.js';
import { IShipment } from '../../../shared/models/Shipment.js';
import { TraceabilityEventType } from '../../../shared/enums/TraceabilityEventType.js';
import { generateInvoiceId, generateSequenceId } from '../../../shared/helpers/sequence.helper.js';

export class ShipmentService {
  constructor(private repository: ShipmentRepository = shipmentRepository) {}

  private async mapShipmentToResponse(shipment: IShipment): Promise<ShipmentResponse> {
    const order = await this.repository.findOrderById(shipment.orderId.toString());

    const cropName = shipment.cargoName || order?.cropName || 'Crop Harvest';
    const quantityStr = shipment.cargoQuantity || (order ? `${order.quantityKg} kg` : '0 kg');
    const numericVal = shipment.cargoValue || order?.totalAmount || 0;
    const valueStr = `₹ ${numericVal.toLocaleString('en-IN')}`;
    const dest = shipment.destination || (order ? `Processing Hub, ${order.buyerName}` : 'Central Storage');

    let currentStep = 2;
    if (shipment.shipmentStatus === 'DELIVERED' || shipment.shipmentStatus === 'ACCEPTED' || shipment.shipmentStatus === 'REJECTED') {
      currentStep = 3;
    }

    return {
      id: shipment._id.toString(),
      shipmentId: shipment.shipmentId,
      orderId: shipment.orderId.toString(),
      batchId: shipment.batchId,
      farmerId: shipment.farmerId.toString(),
      processorId: shipment.processorId ? shipment.processorId.toString() : undefined,
      cropName,
      quantity: quantityStr,
      value: valueStr,
      numericValue: numericVal,
      destination: dest,
      dispatchedDate: shipment.dispatchedAt ? shipment.dispatchedAt.toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB'),
      estimatedDelivery: shipment.estimatedDelivery ? shipment.estimatedDelivery.toLocaleDateString('en-GB') : 'Within 48 Hours',
      acceptedDate: shipment.acceptedAt ? shipment.acceptedAt.toLocaleString() : undefined,
      rejectedDate: shipment.rejectedAt ? shipment.rejectedAt.toLocaleString() : undefined,
      status: (shipment.shipmentStatus === 'PREPARING' || shipment.shipmentStatus === 'DISPATCHED') ? 'IN_TRANSIT' : (shipment.shipmentStatus as any),
      currentStep,
      inspectionResult: shipment.inspectionResult,
      rejectionReason: shipment.rejectionReason,
      trackingNumber: shipment.trackingNumber,
      carrierName: shipment.carrierName,
      createdAt: shipment.createdAt,
      updatedAt: shipment.updatedAt,
    };
  }

  async startShipment(userId: string, dto: StartShipmentDTO): Promise<ShipmentResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const order = await this.repository.findOrderById(dto.orderId);
    if (!order) {
      throw new Error(`Purchase order '${dto.orderId}' not found in MongoDB Atlas`);
    }

    if (order.farmerId.toString() !== user._id.toString() && order.farmerId.toString() !== user.farmerId) {
      throw new Error('Unauthorized to start shipment for this purchase order');
    }

    // Check if shipment already exists for this order to prevent duplicates
    const existingShipment = await this.repository.findShipmentByOrderId(order._id.toString());
    if (existingShipment) {
      throw new Error(`A shipment (${existingShipment.shipmentId}) has already been started for this purchase order.`);
    }

    const seqId = await generateSequenceId('FRM');
    const shipmentId = `SHP-${Date.now().toString().slice(-6)}`;
    const trackingNumber = dto.trackingNumber || `TRK-${Date.now().toString().slice(-8)}`;

    const shipmentData: Partial<IShipment> = {
      shipmentId,
      orderId: order._id,
      batchId: order.batchNumber,
      farmerId: order.farmerId,
      processorId: order.processorId,
      cargoName: order.cropName,
      cargoQuantity: `${order.quantityKg} kg`,
      cargoValue: order.totalAmount,
      destination: `Processing Hub, ${order.buyerName}`,
      shipmentStatus: 'IN_TRANSIT',
      inspectionResult: 'PENDING',
      dispatchedAt: new Date(),
      estimatedDelivery: dto.estimatedDelivery ? new Date(dto.estimatedDelivery) : new Date(Date.now() + 48 * 3600 * 1000),
      carrierName: dto.carrierName || 'Standard Agri Cold Express',
      trackingNumber,
    };

    const createdShipment = await this.repository.createShipment(shipmentData);

    // Update Order Status
    await this.repository.updateOrder(order._id.toString(), {
      orderStatus: 'DISPATCHED',
      deliveryStatus: 'IN_TRANSIT',
    });

    // Log Traceability Event
    await this.repository.createTraceabilityEvent({
      batchId: order.batchNumber,
      eventType: TraceabilityEventType.SHIPMENT_STARTED,
      performedBy: user._id,
      performedByRole: 'FARMER',
      metadata: {
        shipmentId: createdShipment.shipmentId,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        carrierName: createdShipment.carrierName,
        trackingNumber: createdShipment.trackingNumber,
      },
      timestamp: new Date(),
    });

    // Send Notification to Processor
    try {
      const { notificationService } = await import('../../notifications/notification.service.js');
      await notificationService.createNotification({
        userId: order.processorId.toString(),
        role: 'PROCESSOR',
        title: 'Shipment Dispatched',
        message: `Farmer has dispatched order ${order.orderNumber} via ${createdShipment.carrierName} (Tracking: ${createdShipment.trackingNumber})`,
        notificationType: 'SHIPMENT',
        referenceType: 'SHIPMENT',
        referenceId: createdShipment._id.toString(),
        clickDestination: '/processor/processorHub/shipments',
      });
    } catch (err) {
      console.warn('Failed to send shipment notification', err);
    }

    return this.mapShipmentToResponse(createdShipment);
  }

  async getActiveDispatches(userId: string, query?: ShipmentQueryDTO): Promise<ShipmentListResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const statusFilter = ['IN_TRANSIT', 'DISPATCHED', 'PREPARING'];
    const { shipments, total } = await this.repository.findShipmentsByFarmerId(user, statusFilter, query);
    const mapped = await Promise.all(shipments.map((s) => this.mapShipmentToResponse(s)));

    return {
      shipments: mapped,
      total,
      page: query?.page || 1,
      limit: query?.limit || 50,
    };
  }

  async getShipmentHistory(userId: string, query?: ShipmentQueryDTO): Promise<ShipmentListResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    let statusFilter = ['DELIVERED', 'ACCEPTED', 'REJECTED'];
    if (query?.status && query.status !== 'HISTORY' && query.status !== 'ALL') {
      statusFilter = [query.status];
    }

    const { shipments, total } = await this.repository.findShipmentsByFarmerId(user, statusFilter, query);
    const mapped = await Promise.all(shipments.map((s) => this.mapShipmentToResponse(s)));

    return {
      shipments: mapped,
      total,
      page: query?.page || 1,
      limit: query?.limit || 50,
    };
  }

  async getAcceptedShipments(userId: string, query?: ShipmentQueryDTO): Promise<ShipmentListResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const statusFilter = ['DELIVERED', 'ACCEPTED'];
    const { shipments, total } = await this.repository.findShipmentsByFarmerId(user, statusFilter, query);
    const mapped = await Promise.all(shipments.map((s) => this.mapShipmentToResponse(s)));

    return {
      shipments: mapped,
      total,
      page: query?.page || 1,
      limit: query?.limit || 50,
    };
  }

  async getRejectedShipments(userId: string, query?: ShipmentQueryDTO): Promise<ShipmentListResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const statusFilter = ['REJECTED'];
    const { shipments, total } = await this.repository.findShipmentsByFarmerId(user, statusFilter, query);
    const mapped = await Promise.all(shipments.map((s) => this.mapShipmentToResponse(s)));

    return {
      shipments: mapped,
      total,
      page: query?.page || 1,
      limit: query?.limit || 50,
    };
  }

  async getShipmentDetails(shipmentIdOrId: string): Promise<ShipmentResponse> {
    let shipment = await this.repository.findShipmentByShipmentId(shipmentIdOrId);
    if (!shipment && shipmentIdOrId.match(/^[0-9a-fA-F]{24}$/)) {
      shipment = await this.repository.findShipmentById(shipmentIdOrId);
    }

    if (!shipment) {
      throw new Error(`Shipment '${shipmentIdOrId}' not found in MongoDB Atlas`);
    }

    return this.mapShipmentToResponse(shipment);
  }

  async trackShipment(shipmentIdOrId: string): Promise<ShipmentTrackingResponse> {
    const details = await this.getShipmentDetails(shipmentIdOrId);

    const isRejected = details.status === 'REJECTED';
    const isDelivered = details.status === 'DELIVERED' || details.status === 'ACCEPTED';

    const steps: ShipmentTrackingStep[] = [
      {
        stepIndex: 1,
        title: 'Farmer Hub',
        subtitle: `Dispatched on ${details.dispatchedDate}`,
        isCompleted: true,
        isCurrent: false,
        statusText: 'Dispatched',
      },
      {
        stepIndex: 2,
        title: isRejected ? 'Return Transit' : 'In Transit',
        subtitle: isRejected ? 'En-route to Seller' : 'GPS En-route',
        isCompleted: isDelivered || isRejected,
        isCurrent: details.status === 'IN_TRANSIT',
        statusText: isRejected ? 'Return Transit' : 'In Transit',
      },
      {
        stepIndex: 3,
        title: isDelivered ? 'Delivery Accepted' : isRejected ? 'Delivery Rejected' : 'Awaiting Inspection',
        subtitle: isDelivered ? 'Verified & Accepted' : isRejected ? 'Inspection Failed' : 'Inspection Pending',
        isCompleted: isDelivered || isRejected,
        isCurrent: isDelivered || isRejected,
        statusText: isDelivered ? 'ACCEPTED' : isRejected ? 'REJECTED' : 'PENDING',
      },
    ];

    return {
      shipmentId: details.shipmentId,
      batchId: details.batchId,
      status: details.status,
      currentStep: details.currentStep,
      steps,
      carrierName: details.carrierName,
      trackingNumber: details.trackingNumber,
      destination: details.destination,
      estimatedDelivery: details.estimatedDelivery,
    };
  }

  async processInspection(shipmentIdOrId: string, dto: InspectionDTO): Promise<ShipmentResponse> {
    let shipment = await this.repository.findShipmentByShipmentId(shipmentIdOrId);
    if (!shipment && shipmentIdOrId.match(/^[0-9a-fA-F]{24}$/)) {
      shipment = await this.repository.findShipmentById(shipmentIdOrId);
    }

    if (!shipment) {
      throw new Error(`Shipment '${shipmentIdOrId}' not found in MongoDB Atlas`);
    }

    if (shipment.shipmentStatus === 'DELIVERED' || shipment.shipmentStatus === 'ACCEPTED') {
      throw new Error('Delivery has already been confirmed and accepted.');
    }

    if (shipment.shipmentStatus === 'REJECTED') {
      throw new Error('Shipment has already been rejected.');
    }

    const order = await this.repository.findOrderById(shipment.orderId.toString());
    if (!order) {
      throw new Error('Associated purchase order not found in MongoDB Atlas');
    }

    if (dto.decision === 'ACCEPTED') {
      // 1. Update Shipment in MongoDB Atlas
      const updatedShipment = await this.repository.updateShipment(shipment._id.toString(), {
        shipmentStatus: 'DELIVERED',
        inspectionResult: 'PASSED',
        acceptedAt: new Date(),
        deliveredAt: new Date(),
      });

      // 2. Update Order
      await this.repository.updateOrder(order._id.toString(), {
        orderStatus: 'COMPLETED',
        deliveryStatus: 'DELIVERED',
        escrowStatus: 'RELEASED',
      });

      // 3. Update Payment Escrow in payments collection
      const payment = await this.repository.findPaymentByOrderId(order._id.toString());
      if (payment) {
        await this.repository.updatePayment(payment._id.toString(), {
          escrowStatus: 'RELEASED',
          releasedAt: new Date(),
        });
      }

      // 4. Update Escrow in escrows collection
      const escrow = await this.repository.findEscrowByOrderId(order._id.toString());
      if (escrow) {
        await this.repository.updateEscrow(escrow._id.toString(), {
          status: 'RELEASED',
          orderStatus: 'COMPLETED',
          releasedAt: new Date(),
        });
      }

      // 5. Update Farmer Wallet Balance
      try {
        const wallet = await this.repository.findOrCreateWallet(shipment.farmerId.toString());
        await this.repository.updateWallet(wallet._id.toString(), {
          balance: wallet.balance + order.totalAmount,
          totalRevenue: wallet.totalRevenue + order.totalAmount,
        });
      } catch (wErr) {
        console.warn('Wallet balance update skipped or failed:', wErr);
      }

      // 6. Generate Sales Invoice automatically
      try {
        const invoiceId = await generateInvoiceId('SALES');
        await this.repository.createInvoice({
          invoiceId,
          orderId: order._id,
          paymentId: payment ? payment._id : undefined,
          sellerId: shipment.farmerId,
          buyerId: order.processorId,
          batchReference: shipment.batchId,
          buyerName: order.buyerName,
          sellerName: 'Farmer',
          items: [
            {
              cropName: order.cropName,
              variety: order.variety,
              quantityKg: order.quantityKg,
              pricePerKg: order.pricePerKg,
              totalAmount: order.totalAmount,
            },
          ],
          totalAmount: order.totalAmount,
          paymentStatus: 'PAID',
          invoiceType: 'SALES',
          generatedAt: new Date(),
        });
      } catch (invErr) {
        console.warn('Invoice generation skipped or failed:', invErr);
      }

      // 7. Log Traceability Event
      await this.repository.createTraceabilityEvent({
        batchId: shipment.batchId,
        eventType: TraceabilityEventType.DELIVERY_ACCEPTED,
        performedBy: order.processorId,
        performedByRole: 'PROCESSOR',
        metadata: {
          shipmentId: shipment.shipmentId,
          orderId: order._id.toString(),
          inspectionResult: 'PASSED',
          totalAmount: order.totalAmount,
        },
        timestamp: new Date(),
      });

      // Send Notification to Farmer
      try {
        const { notificationService } = await import('../../notifications/notification.service.js');
        await notificationService.createNotification({
          userId: shipment.farmerId.toString(),
          role: 'FARMER',
          title: 'Delivery Accepted & Escrow Released',
          message: `Processor accepted delivery for shipment ${shipment.shipmentId}. ₹${order.totalAmount.toLocaleString('en-IN')} released to your wallet!`,
          notificationType: 'PAYMENT',
          referenceType: 'SHIPMENT',
          referenceId: shipment._id.toString(),
          clickDestination: '/farmer/farmerHub/wallet',
        });
      } catch (err) {
        console.warn('Failed to send notification for delivery acceptance', err);
      }

      return this.mapShipmentToResponse(updatedShipment!);
    } else {
      // REJECTED Outcome
      const updatedShipment = await this.repository.updateShipment(shipment._id.toString(), {
        shipmentStatus: 'REJECTED',
        inspectionResult: 'FAILED',
        rejectionReason: dto.rejectionReason || 'Quality Inspection Failed',
        rejectedAt: new Date(),
      });

      // Update Order & Escrow Refund in MongoDB Atlas
      await this.repository.updateOrder(order._id.toString(), {
        orderStatus: 'REJECTED',
        deliveryStatus: 'REJECTED',
        escrowStatus: 'REFUNDED',
      });

      const payment = await this.repository.findPaymentByOrderId(order._id.toString());
      if (payment) {
        await this.repository.updatePayment(payment._id.toString(), {
          escrowStatus: 'REFUNDED',
        });
      }

      const escrow = await this.repository.findEscrowByOrderId(order._id.toString());
      if (escrow) {
        await this.repository.updateEscrow(escrow._id.toString(), {
          status: 'REFUNDED',
          orderStatus: 'REJECTED',
        });
      }

      // Restore Harvest Available Volume
      const harvest = await this.repository.findHarvestByBatchId(shipment.batchId);
      if (harvest) {
        await this.repository.updateHarvest(harvest._id.toString(), {
          availableVolume: harvest.availableVolume + order.quantityKg,
        });
      }

      // Log Traceability Event
      await this.repository.createTraceabilityEvent({
        batchId: shipment.batchId,
        eventType: TraceabilityEventType.DELIVERY_REJECTED,
        performedBy: order.processorId,
        performedByRole: 'PROCESSOR',
        metadata: {
          shipmentId: shipment.shipmentId,
          orderId: order._id.toString(),
          inspectionResult: 'FAILED',
          rejectionReason: dto.rejectionReason,
        },
        timestamp: new Date(),
      });

      // Send Notification to Farmer
      try {
        const { notificationService } = await import('../../notifications/notification.service.js');
        await notificationService.createNotification({
          userId: shipment.farmerId.toString(),
          role: 'FARMER',
          title: 'Delivery Rejected',
          message: `Processor rejected shipment ${shipment.shipmentId}. Reason: ${dto.rejectionReason || 'Quality Inspection Failed'}`,
          notificationType: 'SHIPMENT',
          referenceType: 'SHIPMENT',
          referenceId: shipment._id.toString(),
          clickDestination: '/farmer/farmerHub/shipments',
        });
      } catch (err) {
        console.warn('Failed to send notification for delivery rejection', err);
      }

      return this.mapShipmentToResponse(updatedShipment!);
    }
  }
}

export const shipmentService = new ShipmentService();
