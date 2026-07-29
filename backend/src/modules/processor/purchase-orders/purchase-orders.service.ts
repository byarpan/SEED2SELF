import { PurchaseOrdersRepository, purchaseOrdersRepository } from './purchase-orders.repository.js';
import { PurchaseOrderQueryDTO, RejectOrderDTO, StartDeliveryDTO } from './dto/purchase-orders.dto.js';
import { PurchaseOrderListResponse, PurchaseOrderItemResponse } from './interfaces/purchase-orders.interface.js';
import { IOrder } from '../../../shared/models/Order.js';
import { sharedEscrowService } from '../../../shared/services/escrow.service.js';
import { sharedNotificationService } from '../../../shared/services/notification.service.js';

export class PurchaseOrdersService {
  constructor(private repository: PurchaseOrdersRepository = purchaseOrdersRepository) {}

  private formatCurrency(amount: number): string {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }

  private formatDate(dateInput: Date | string): string {
    const date = new Date(dateInput);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private async mapOrderToResponse(order: IOrder): Promise<PurchaseOrderItemResponse> {
    const shipment = await this.repository.findShipmentByOrderId(order._id.toString());
    const processedProduct = await this.repository.findProcessedProductByBatchNumber(order.batchNumber);

    let escrowStatusLabel = 'Protected by Escrow Security Protocol';
    if (order.escrowStatus === 'LOCKED') {
      escrowStatusLabel = 'Protected by Escrow Security Protocol';
    } else if (order.escrowStatus === 'RELEASED') {
      escrowStatusLabel = 'Escrow Released & Funds Transferred';
    } else if (order.escrowStatus === 'REFUNDED') {
      escrowStatusLabel = 'Escrow Payment Refunded';
    }

    let orderStatusLabel = 'Awaiting Acceptance';
    if (order.orderStatus === 'ACCEPTED') {
      orderStatusLabel = 'Accepted & Escrowed';
    } else if (order.orderStatus === 'REJECTED') {
      orderStatusLabel = 'Rejected';
    } else if (['DISPATCHED', 'IN_TRANSIT'].includes(order.orderStatus)) {
      orderStatusLabel = 'In Transit / Dispatched';
    } else if (['DELIVERED', 'COMPLETED'].includes(order.orderStatus)) {
      orderStatusLabel = 'Delivered & Confirmed';
    }

    const unit = processedProduct?.unit || 'kg';
    const productCategory = processedProduct?.productCategory || order.variety || 'AGRI & FOOD PRODUCTS';
    const productImage = processedProduct?.productImage;

    return {
      id: order._id.toString(),
      orderNumber: order.orderNumber,
      batchNumber: order.batchNumber,
      productCategory: productCategory.toUpperCase(),
      productName: order.cropName,
      productImage,
      buyerName: order.buyerName,
      buyerCompany: order.buyerName,
      orderDate: order.createdAt,
      formattedOrderDate: this.formatDate(order.createdAt),
      quantityRequested: `${order.quantityKg} ${unit}`,
      quantityKg: order.quantityKg,
      unit,
      totalOfferAmount: this.formatCurrency(order.totalAmount),
      totalAmount: order.totalAmount,
      escrowStatus: order.escrowStatus,
      escrowStatusLabel,
      orderStatus: order.orderStatus,
      orderStatusLabel,
      deliveryStatus: order.deliveryStatus,
      shipmentId: shipment ? shipment.shipmentId : undefined,
      trackingNumber: shipment ? shipment.trackingNumber : undefined,
      carrierName: shipment ? shipment.carrierName : undefined,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    };
  }

  async getAllOrders(processorIdentifier: string, query?: PurchaseOrderQueryDTO): Promise<PurchaseOrderListResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    let statusFilter: string[] | undefined = undefined;
    if (query?.status && query.status !== 'ALL') {
      if (query.status === 'PENDING') {
        statusFilter = ['PENDING_PROCESSOR_ACCEPTANCE', 'PENDING_FARMER_ACCEPTANCE', 'PENDING'];
      } else {
        statusFilter = [query.status];
      }
    }

    const { orders, total } = await this.repository.findOrdersByProcessorId(user._id.toString(), statusFilter, query);
    const counts = await this.repository.countOrdersByStatus(user._id.toString());
    const mappedOrders = await Promise.all(orders.map((o) => this.mapOrderToResponse(o)));

    const limit = query?.limit || 50;
    const page = query?.page || 1;

    return {
      orders: mappedOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      counts,
    };
  }

  async getPendingOrders(processorIdentifier: string, query?: PurchaseOrderQueryDTO): Promise<PurchaseOrderListResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const statusFilter = ['PENDING_PROCESSOR_ACCEPTANCE', 'PENDING_FARMER_ACCEPTANCE', 'PENDING'];
    const { orders, total } = await this.repository.findOrdersByProcessorId(user._id.toString(), statusFilter, query);
    const counts = await this.repository.countOrdersByStatus(user._id.toString());
    const mappedOrders = await Promise.all(orders.map((o) => this.mapOrderToResponse(o)));

    const limit = query?.limit || 50;
    const page = query?.page || 1;

    return {
      orders: mappedOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      counts,
    };
  }

  async getAcceptedOrders(processorIdentifier: string, query?: PurchaseOrderQueryDTO): Promise<PurchaseOrderListResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const statusFilter = ['ACCEPTED'];
    const { orders, total } = await this.repository.findOrdersByProcessorId(user._id.toString(), statusFilter, query);
    const counts = await this.repository.countOrdersByStatus(user._id.toString());
    const mappedOrders = await Promise.all(orders.map((o) => this.mapOrderToResponse(o)));

    const limit = query?.limit || 50;
    const page = query?.page || 1;

    return {
      orders: mappedOrders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
      counts,
    };
  }

  async getOrderDetails(processorIdentifier: string, orderIdOrNumber: string): Promise<PurchaseOrderItemResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const order = await this.repository.findOrderByIdOrNumber(orderIdOrNumber);
    if (!order) {
      throw new Error('Purchase order not found');
    }

    return this.mapOrderToResponse(order);
  }

  async acceptOrder(processorIdentifier: string, orderIdOrNumber: string): Promise<PurchaseOrderItemResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const order = await this.repository.findOrderByIdOrNumber(orderIdOrNumber);
    if (!order) {
      throw new Error('Purchase order not found');
    }

    if (!['PENDING_PROCESSOR_ACCEPTANCE', 'PENDING_FARMER_ACCEPTANCE', 'PENDING'].includes(order.orderStatus)) {
      throw new Error(`Cannot accept order with status '${order.orderStatus}'. Only pending orders can be accepted.`);
    }

    const updatedOrder = await this.repository.updateOrderStatus(
      order._id.toString(),
      'ACCEPTED',
      'ACCEPTED',
      'LOCKED'
    );

    if (!updatedOrder) {
      throw new Error('Failed to update order status');
    }

    // Send notification to buyer
    try {
      await sharedNotificationService.createNotification({
        userId: order.farmerId,
        role: 'DISTRIBUTOR',
        title: 'Purchase Order Accepted',
        message: `Your purchase order ${order.orderNumber} for ${order.cropName} has been accepted by the Processor. Delivery preparation is starting.`,
        notificationType: 'PURCHASE_ORDER',
        referenceType: 'ORDER',
        referenceId: order._id.toString(),
        clickDestination: '/distributor/orders',
      });
    } catch (e) {
      console.warn('Failed to send buyer notification:', e);
    }

    return this.mapOrderToResponse(updatedOrder);
  }

  async rejectOrder(processorIdentifier: string, orderIdOrNumber: string, dto?: RejectOrderDTO): Promise<PurchaseOrderItemResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const order = await this.repository.findOrderByIdOrNumber(orderIdOrNumber);
    if (!order) {
      throw new Error('Purchase order not found');
    }

    if (!['PENDING_PROCESSOR_ACCEPTANCE', 'PENDING_FARMER_ACCEPTANCE', 'PENDING'].includes(order.orderStatus)) {
      throw new Error(`Cannot reject order with status '${order.orderStatus}'. Only pending orders can be rejected.`);
    }

    const updatedOrder = await this.repository.updateOrderStatus(
      order._id.toString(),
      'REJECTED',
      'REJECTED',
      'REFUNDED'
    );

    if (!updatedOrder) {
      throw new Error('Failed to update order status');
    }

    // Refund Escrow via shared Escrow Service
    try {
      await sharedEscrowService.refundFunds(order.orderNumber);
    } catch (e) {
      console.warn('Shared escrow refund warning:', e);
    }

    // Restore inventory
    await this.repository.restoreProcessedProductInventory(order.batchNumber, order.quantityKg);

    // Send notification to buyer
    try {
      await sharedNotificationService.createNotification({
        userId: order.farmerId,
        role: 'DISTRIBUTOR',
        title: 'Purchase Order Rejected',
        message: `Your purchase order ${order.orderNumber} for ${order.cropName} was rejected by the Processor. Escrow payment has been refunded to your account.`,
        notificationType: 'PURCHASE_ORDER',
        referenceType: 'ORDER',
        referenceId: order._id.toString(),
        clickDestination: '/distributor/orders',
      });
    } catch (e) {
      console.warn('Failed to send buyer notification:', e);
    }

    return this.mapOrderToResponse(updatedOrder);
  }

  async startDelivery(processorIdentifier: string, orderIdOrNumber: string, dto?: StartDeliveryDTO): Promise<PurchaseOrderItemResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(processorIdentifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const order = await this.repository.findOrderByIdOrNumber(orderIdOrNumber);
    if (!order) {
      throw new Error('Purchase order not found');
    }

    if (order.orderStatus !== 'ACCEPTED') {
      throw new Error(`Cannot start delivery for order with status '${order.orderStatus}'. Order must be in ACCEPTED status.`);
    }

    // Create Shipment Record & Transfer Ownership to Shipment Module
    await this.repository.createShipment({
      orderId: order._id,
      batchId: order.batchNumber,
      farmerId: order.farmerId,
      processorId: user._id,
      cargoName: `${order.cropName} (${order.quantityKg} kg)`,
      cargoQuantity: `${order.quantityKg} kg`,
      cargoValue: order.totalAmount,
      destination: dto?.destination || 'Distributor Facility Location',
      carrierName: dto?.carrierName || 'Seed2Shelf Express Logistics',
      trackingNumber: dto?.trackingNumber,
    });

    const updatedOrder = await this.repository.updateOrderStatus(
      order._id.toString(),
      'DISPATCHED',
      'IN_TRANSIT'
    );

    if (!updatedOrder) {
      throw new Error('Failed to update order status for dispatch');
    }

    // Send notification to buyer
    try {
      await sharedNotificationService.createNotification({
        userId: order.farmerId,
        role: 'DISTRIBUTOR',
        title: 'Order Dispatched & In Transit',
        message: `Your purchase order ${order.orderNumber} (${order.cropName}) has been dispatched by the Processor and is now in transit.`,
        notificationType: 'SHIPMENT',
        referenceType: 'SHIPMENT',
        referenceId: order._id.toString(),
        clickDestination: '/distributor/shipments',
      });
    } catch (e) {
      console.warn('Failed to send buyer notification:', e);
    }

    return this.mapOrderToResponse(updatedOrder);
  }
}

export const purchaseOrdersService = new PurchaseOrdersService();
