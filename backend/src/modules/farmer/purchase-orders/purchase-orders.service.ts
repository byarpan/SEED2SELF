import { PurchaseOrdersRepository, purchaseOrdersRepository } from './purchase-orders.repository.js';
import { PurchaseOrderQueryDTO, RejectOrderDTO, StartDeliveryDTO } from './dto/purchase-orders.dto.js';
import { PurchaseOrderResponse, PurchaseOrderListResponse } from './interfaces/purchase-orders.interface.js';
import { IOrder } from '../../../shared/models/Order.js';
import { TraceabilityEventType } from '../../../shared/enums/TraceabilityEventType.js';
import { generateSequenceId } from '../../../shared/helpers/sequence.helper.js';

export class PurchaseOrdersService {
  constructor(private repository: PurchaseOrdersRepository = purchaseOrdersRepository) {}

  private async mapOrderToResponse(order: IOrder): Promise<PurchaseOrderResponse> {
    const shipment = await this.repository.findShipmentByOrderId(order._id.toString());
    const escrow = await this.repository.findEscrowByOrderId(order._id.toString());

    return {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      farmerId: order.farmerId.toString(),
      processorId: order.processorId.toString(),
      buyerName: order.buyerName,
      cropName: order.cropName,
      variety: order.variety || 'None',
      batchNumber: order.batchNumber,
      quantityKg: order.quantityKg,
      pricePerKg: order.pricePerKg,
      totalAmount: order.totalAmount,
      orderStatus: order.orderStatus,
      deliveryStatus: order.deliveryStatus,
      paymentStatus: order.paymentStatus,
      escrowStatus: (escrow?.status as any) || order.escrowStatus,
      shipmentId: shipment ? shipment.shipmentId : undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async getAllOrders(userId: string, query?: PurchaseOrderQueryDTO): Promise<PurchaseOrderListResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    let statusFilter: string[] | undefined = undefined;
    if (query?.status && query.status !== 'ALL') {
      if (query.status === 'PENDING') {
        statusFilter = ['PENDING_FARMER_ACCEPTANCE', 'PENDING'];
      } else {
        statusFilter = [query.status];
      }
    }

    const { orders, total } = await this.repository.findOrdersByFarmerId(user, statusFilter, query);
    const mappedOrders = await Promise.all(orders.map((o) => this.mapOrderToResponse(o)));

    return {
      orders: mappedOrders,
      total,
      page: query?.page || 1,
      limit: query?.limit || 50,
    };
  }

  async getPendingOrders(userId: string, query?: PurchaseOrderQueryDTO): Promise<PurchaseOrderListResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const statusFilter = ['PENDING_FARMER_ACCEPTANCE', 'PENDING'];
    const { orders, total } = await this.repository.findOrdersByFarmerId(user, statusFilter, query);
    const mappedOrders = await Promise.all(orders.map((o) => this.mapOrderToResponse(o)));

    return {
      orders: mappedOrders,
      total,
      page: query?.page || 1,
      limit: query?.limit || 50,
    };
  }

  async getAcceptedOrders(userId: string, query?: PurchaseOrderQueryDTO): Promise<PurchaseOrderListResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    const statusFilter = ['ACCEPTED'];
    const { orders, total } = await this.repository.findOrdersByFarmerId(user, statusFilter, query);
    const mappedOrders = await Promise.all(orders.map((o) => this.mapOrderToResponse(o)));

    return {
      orders: mappedOrders,
      total,
      page: query?.page || 1,
      limit: query?.limit || 50,
    };
  }

  async getOrderDetails(orderIdOrNumber: string): Promise<PurchaseOrderResponse> {
    let order = await this.repository.findOrderByNumber(orderIdOrNumber);
    if (!order && orderIdOrNumber.match(/^[0-9a-fA-F]{24}$/)) {
      order = await this.repository.findOrderById(orderIdOrNumber);
    }

    if (!order) {
      throw new Error(`Purchase order '${orderIdOrNumber}' not found in MongoDB Atlas`);
    }

    return this.mapOrderToResponse(order);
  }

  async createOrder(orderData: Partial<IOrder>): Promise<PurchaseOrderResponse> {
    const harvest = await this.repository.findHarvestByBatchId(orderData.batchNumber || '');
    if (harvest) {
      if (harvest.availableVolume < (orderData.quantityKg || 0)) {
        throw new Error(`Insufficient available harvest volume (${harvest.availableVolume} kg available)`);
      }
      // Deduct available harvest volume
      await this.repository.updateHarvest(harvest._id.toString(), {
        availableVolume: harvest.availableVolume - (orderData.quantityKg || 0),
      });
    }

    const orderNumber = `S2S-PO-${Date.now()}`;

    const newOrderPayload: Partial<IOrder> & { orderId?: string } = {
      orderNumber: orderData.orderNumber || orderNumber,
      orderId: orderData.orderNumber || orderNumber,
      farmerId: orderData.farmerId,
      processorId: orderData.processorId,
      buyerName: orderData.buyerName || 'Processor Buyer',
      cropName: orderData.cropName || harvest?.cropName || 'Crop',
      variety: orderData.variety || harvest?.cropVariety || 'Grade-A',
      batchNumber: orderData.batchNumber || harvest?.batchId || 'BATCH-001',
      quantityKg: orderData.quantityKg || 100,
      pricePerKg: orderData.pricePerKg || 100,
      totalAmount: (orderData.quantityKg || 100) * (orderData.pricePerKg || 100),
      orderStatus: 'PENDING_FARMER_ACCEPTANCE',
      deliveryStatus: 'PENDING_FARMER_ACCEPTANCE',
      paymentStatus: 'SUCCESS',
      escrowStatus: 'LOCKED',
    };

    const createdOrder = await this.repository.createOrder(newOrderPayload);

    // Create Payment Record in payments collection
    await this.repository.createPayment({
      paymentId: `PAY-${Date.now()}`,
      orderId: createdOrder._id,
      farmerId: createdOrder.farmerId,
      amount: createdOrder.totalAmount,
      escrowStatus: 'LOCKED',
    });

    // Create Escrow Record in escrows collection
    await this.repository.createEscrow({
      escrowId: `ESC-${Date.now()}`,
      userId: createdOrder.processorId,
      payerId: createdOrder.processorId,
      payeeId: createdOrder.farmerId,
      role: 'PROCESSOR',
      cropName: createdOrder.cropName,
      batchNumber: createdOrder.batchNumber,
      quantity: `${createdOrder.quantityKg} kg`,
      supplier: createdOrder.buyerName,
      escrowAmount: `₹${createdOrder.totalAmount.toLocaleString('en-IN')}`,
      rawAmount: createdOrder.totalAmount,
      orderStatus: 'PENDING_FARMER_ACCEPTANCE',
      orderId: createdOrder._id.toString(),
      escrowType: 'FARMER_RAW_MATERIAL',
      status: 'LOCKED',
    });

    // Create Traceability Event
    await this.repository.createTraceabilityEvent({
      batchId: createdOrder.batchNumber,
      eventType: TraceabilityEventType.ORDER_CREATED,
      performedBy: createdOrder.processorId,
      performedByRole: 'PROCESSOR',
      metadata: {
        orderId: createdOrder._id.toString(),
        orderNumber: createdOrder.orderNumber,
        quantityKg: createdOrder.quantityKg,
        totalAmount: createdOrder.totalAmount,
      },
      timestamp: new Date(),
    });

    // Notification Trigger: Event 1 - New Purchase Order Received (Farmer)
    try {
      const { notificationService } = await import('../../notifications/notification.service.js');
      await notificationService.createNotification({
        userId: createdOrder.farmerId.toString(),
        role: 'FARMER',
        title: 'New Purchase Order Received',
        message: `New order ${createdOrder.orderNumber} for ${createdOrder.quantityKg}kg of ${createdOrder.cropName}`,
        notificationType: 'PURCHASE_ORDER',
        referenceType: 'ORDER',
        referenceId: createdOrder._id.toString(),
        clickDestination: '/farmer/farmerHub/orders',
      });
    } catch (err) {
      console.warn('Failed to send notification for new purchase order creation', err);
    }

    return this.mapOrderToResponse(createdOrder);
  }

  async acceptOrder(userId: string, orderId: string): Promise<PurchaseOrderResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    let order = await this.repository.findOrderById(orderId);
    if (!order) {
      order = await this.repository.findOrderByNumber(orderId);
    }

    if (!order) {
      throw new Error(`Purchase order '${orderId}' not found in MongoDB Atlas`);
    }

    if (order.farmerId.toString() !== user._id.toString() && order.farmerId.toString() !== user.farmerId) {
      throw new Error('Unauthorized to accept this purchase order');
    }

    if (order.deliveryStatus === 'ACCEPTED' || order.orderStatus === 'ACCEPTED') {
      throw new Error('This purchase order has already been accepted.');
    }

    if (order.deliveryStatus === 'REJECTED' || order.orderStatus === 'REJECTED') {
      throw new Error('Cannot accept an order that has already been rejected.');
    }

    const updatedOrder = await this.repository.updateOrder(order._id.toString(), {
      orderStatus: 'ACCEPTED',
      deliveryStatus: 'ACCEPTED',
      escrowStatus: 'LOCKED',
    });

    if (!updatedOrder) {
      throw new Error('Failed to update order status');
    }

    // Log Traceability Event
    await this.repository.createTraceabilityEvent({
      batchId: updatedOrder.batchNumber,
      eventType: TraceabilityEventType.ORDER_ACCEPTED,
      performedBy: user._id,
      performedByRole: 'FARMER',
      metadata: {
        orderId: updatedOrder._id.toString(),
        orderNumber: updatedOrder.orderNumber,
        buyerName: updatedOrder.buyerName,
        totalAmount: updatedOrder.totalAmount,
      },
      timestamp: new Date(),
    });

    // Notification Trigger: Event 2 - Purchase Order Accepted (Processor)
    try {
      const { notificationService } = await import('../../notifications/notification.service.js');
      await notificationService.createNotification({
        userId: updatedOrder.processorId.toString(),
        role: 'PROCESSOR',
        title: 'Purchase Order Accepted',
        message: `Farmer accepted purchase order ${updatedOrder.orderNumber}`,
        notificationType: 'PURCHASE_ORDER',
        referenceType: 'ORDER',
        referenceId: updatedOrder._id.toString(),
        clickDestination: '/processor/processorHub/orders',
      });
    } catch (err) {
      console.warn('Failed to send notification for purchase order acceptance', err);
    }

    return this.mapOrderToResponse(updatedOrder);
  }

  async rejectOrder(userId: string, orderId: string, dto?: RejectOrderDTO): Promise<PurchaseOrderResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    let order = await this.repository.findOrderById(orderId);
    if (!order) {
      order = await this.repository.findOrderByNumber(orderId);
    }

    if (!order) {
      throw new Error(`Purchase order '${orderId}' not found in MongoDB Atlas`);
    }

    if (order.farmerId.toString() !== user._id.toString() && order.farmerId.toString() !== user.farmerId) {
      throw new Error('Unauthorized to reject this purchase order');
    }

    if (order.deliveryStatus === 'REJECTED' || order.orderStatus === 'REJECTED') {
      throw new Error('This purchase order has already been rejected.');
    }

    // Update order status to REJECTED and escrow to REFUNDED
    const updatedOrder = await this.repository.updateOrder(order._id.toString(), {
      orderStatus: 'REJECTED',
      deliveryStatus: 'REJECTED',
      escrowStatus: 'REFUNDED',
      paymentStatus: 'FAILED',
    });

    if (!updatedOrder) {
      throw new Error('Failed to update order status');
    }

    // Refund associated payment record
    const payment = await this.repository.findPaymentByOrderId(order._id.toString());
    if (payment) {
      await this.repository.updatePayment(payment._id.toString(), {
        escrowStatus: 'REFUNDED',
      });
    }

    // Refund associated escrow record
    const escrow = await this.repository.findEscrowByOrderId(order._id.toString());
    if (escrow) {
      await this.repository.updateEscrow(escrow._id.toString(), {
        status: 'REFUNDED',
        orderStatus: 'REJECTED',
      });
    }

    // Restore volume on Harvest record
    const harvest = await this.repository.findHarvestByBatchId(order.batchNumber);
    if (harvest) {
      await this.repository.updateHarvest(harvest._id.toString(), {
        availableVolume: harvest.availableVolume + order.quantityKg,
      });
    }

    // Log Traceability Event
    await this.repository.createTraceabilityEvent({
      batchId: updatedOrder.batchNumber,
      eventType: TraceabilityEventType.ORDER_REJECTED,
      performedBy: user._id,
      performedByRole: 'FARMER',
      metadata: {
        orderId: updatedOrder._id.toString(),
        orderNumber: updatedOrder.orderNumber,
        reason: dto?.reason || 'Rejected by farmer',
        action: 'ORDER_REJECTED_ESCROW_REFUNDED',
      },
      timestamp: new Date(),
    });

    // Notification Trigger: Event 3 - Purchase Order Cancelled (Processor)
    try {
      const { notificationService } = await import('../../notifications/notification.service.js');
      await notificationService.createNotification({
        userId: updatedOrder.processorId.toString(),
        role: 'PROCESSOR',
        title: 'Purchase Order Cancelled / Rejected',
        message: `Farmer rejected purchase order ${updatedOrder.orderNumber}. Escrow refunded.`,
        notificationType: 'PURCHASE_ORDER',
        referenceType: 'ORDER',
        referenceId: updatedOrder._id.toString(),
        clickDestination: '/processor/processorHub/orders',
      });
    } catch (err) {
      console.warn('Failed to send notification for purchase order cancellation', err);
    }

    return this.mapOrderToResponse(updatedOrder);
  }

  async startDelivery(userId: string, orderId: string, dto?: StartDeliveryDTO): Promise<PurchaseOrderResponse> {
    const user = await this.repository.findUserById(userId);
    if (!user) {
      throw new Error(`Farmer profile '${userId}' not found in MongoDB Atlas`);
    }

    let order = await this.repository.findOrderById(orderId);
    if (!order) {
      order = await this.repository.findOrderByNumber(orderId);
    }

    if (!order) {
      throw new Error(`Purchase order '${orderId}' not found in MongoDB Atlas`);
    }

    if (order.farmerId.toString() !== user._id.toString() && order.farmerId.toString() !== user.farmerId) {
      throw new Error('Unauthorized to start delivery for this purchase order');
    }

    if (order.deliveryStatus !== 'ACCEPTED') {
      throw new Error('Delivery can only be started for accepted orders');
    }

    // Update order status to DISPATCHED
    const updatedOrder = await this.repository.updateOrder(order._id.toString(), {
      orderStatus: 'DISPATCHED',
      deliveryStatus: 'DISPATCHED',
    });

    if (!updatedOrder) {
      throw new Error('Failed to update order status');
    }

    // Create Shipment Record
    const shipmentSeq = await generateSequenceId('FRM');
    const shipmentId = `SHP-${shipmentSeq.replace('S2S-FRM-', '')}`;

    await this.repository.createShipment({
      shipmentId,
      orderId: updatedOrder._id,
      batchId: updatedOrder.batchNumber,
      farmerId: updatedOrder.farmerId,
      processorId: updatedOrder.processorId,
      shipmentStatus: 'IN_TRANSIT',
      dispatchedAt: new Date(),
      carrierName: dto?.carrierName || 'Standard Agri Logistics',
      trackingNumber: dto?.trackingNumber || `TRK-${Date.now()}`,
    });

    // Log Traceability Event
    await this.repository.createTraceabilityEvent({
      batchId: updatedOrder.batchNumber,
      eventType: TraceabilityEventType.SHIPMENT_STARTED,
      performedBy: user._id,
      performedByRole: 'FARMER',
      metadata: {
        orderId: updatedOrder._id.toString(),
        orderNumber: updatedOrder.orderNumber,
        shipmentId,
        carrierName: dto?.carrierName,
        trackingNumber: dto?.trackingNumber,
      },
      timestamp: new Date(),
    });

    return this.mapOrderToResponse(updatedOrder);
  }
}

export const purchaseOrdersService = new PurchaseOrdersService();
