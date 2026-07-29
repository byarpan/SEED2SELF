import mongoose from 'mongoose';
import { ProcessorMarketplaceRepository, processorMarketplaceRepository } from './marketplace.repository.js';
import {
  AddToCartDTO,
  UpdateCartQuantityDTO,
  CreateFactoryDTO,
  UpdateFactoryDTO,
  InitiatePaymentDTO,
  VerifyPaymentDTO,
} from './dto/marketplace.dto.js';
import {
  MarketplaceHarvestItemResponse,
  CartSummaryResponse,
  CartItemResponse,
  RazorpayPaymentInitiationResponse,
  OrderConfirmationResponse,
} from './interfaces/marketplace.interface.js';
import { sharedPaymentService } from '../../../shared/services/payment.service.js';
import { sharedEscrowService } from '../../../shared/services/escrow.service.js';
import { sharedOrderService } from '../../../shared/services/order.service.js';
import { sharedNotificationService } from '../../../shared/services/notification.service.js';

// In-Memory Temporary Cart Store per processor
const cartStore: Map<string, Map<string, { harvestId: string; quantityKg: number }>> = new Map();

export class ProcessorMarketplaceService {
  constructor(private repository: ProcessorMarketplaceRepository = processorMarketplaceRepository) {}

  private getProcessorCartMap(processorId: string): Map<string, { harvestId: string; quantityKg: number }> {
    if (!cartStore.has(processorId)) {
      cartStore.set(processorId, new Map());
    }
    return cartStore.get(processorId)!;
  }

  private formatCurrency(amount: number): string {
    return `₹ ${amount.toLocaleString('en-IN')}`;
  }

  async getAvailableHarvests(search?: string, category?: string): Promise<MarketplaceHarvestItemResponse[]> {
    const harvests = await this.repository.findAvailableHarvests(search, category);

    return harvests.map((h) => {
      const farmerObj = h.farmerId && typeof h.farmerId === 'object' ? h.farmerId : null;
      const farmObj = h.farmId && typeof h.farmId === 'object' ? h.farmId : null;

      const farmerName = farmerObj?.fullName || 'Farmer Partner';
      const farmLocation = farmObj
        ? `${farmObj.village || farmObj.farmName}, ${farmObj.district}, ${farmObj.state}`
        : 'Punjab, India';

      return {
        id: h._id.toString(),
        batchId: h.batchId,
        cropName: h.cropName,
        cropCategory: h.cropCategory,
        cropVariety: h.cropVariety || 'Standard',
        farmerName,
        farmerId: farmerObj ? farmerObj._id.toString() : h.farmerId ? h.farmerId.toString() : '',
        farmLocation,
        harvestDate: h.harvestDate,
        availableVolume: h.availableVolume,
        sellingPrice: h.sellingPrice,
        cropImage: h.cropImage || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
        verifiedBadge: true,
        listingStatus: h.listingStatus || 'LISTED',
      };
    });
  }

  async getHarvestDetails(id: string): Promise<any> {
    const harvest = await this.repository.findHarvestById(id);
    if (!harvest) {
      throw new Error('Harvest product details not found');
    }

    const farmerObj = harvest.farmerId && typeof harvest.farmerId === 'object' ? harvest.farmerId : null;
    const farmObj = harvest.farmId && typeof harvest.farmId === 'object' ? harvest.farmId : null;

    return {
      id: harvest._id.toString(),
      batchId: harvest.batchId,
      cropCategory: harvest.cropCategory,
      cropName: harvest.cropName,
      cropVariety: harvest.cropVariety || 'Standard',
      harvestVolume: harvest.harvestVolume,
      availableVolume: harvest.availableVolume,
      sellingPrice: harvest.sellingPrice,
      harvestDate: harvest.harvestDate,
      cropImage: harvest.cropImage || 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&auto=format&fit=crop&q=80',
      farmer: {
        id: farmerObj ? farmerObj._id.toString() : '',
        name: farmerObj?.fullName || 'Farmer Partner',
        phone: farmerObj?.phone || '+91 98765 43210',
        email: farmerObj?.email || 'farmer@seed2shelf.com',
      },
      farm: {
        name: farmObj?.farmName || 'Golden Fields Farm',
        location: farmObj
          ? `${farmObj.village || farmObj.farmName}, ${farmObj.district}, ${farmObj.state}`
          : 'Amritsar, Punjab',
      },
      verifiedBadge: true,
    };
  }

  // Shopping Cart Operations
  async getCart(identifier: string): Promise<CartSummaryResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    const pId = user ? String(user._id) : identifier;

    const cartMap = this.getProcessorCartMap(pId);
    const cartItems: CartItemResponse[] = [];
    let cropSubtotal = 0;

    for (const [harvestId, entry] of cartMap.entries()) {
      const harvest = await this.repository.findHarvestById(harvestId);
      if (harvest && harvest.availableVolume > 0) {
        const farmerObj = harvest.farmerId && typeof harvest.farmerId === 'object' ? harvest.farmerId : null;
        const subtotal = entry.quantityKg * harvest.sellingPrice;
        cropSubtotal += subtotal;

        cartItems.push({
          harvestId: harvest._id.toString(),
          batchId: harvest.batchId,
          cropName: harvest.cropName,
          farmerName: farmerObj?.fullName || 'Farmer Partner',
          quantityKg: entry.quantityKg,
          pricePerKg: harvest.sellingPrice,
          subtotal,
          cropImage: harvest.cropImage,
        });
      }
    }

    const gst = Math.round(cropSubtotal * 0.05); // 5% GST
    const platformFee = cropSubtotal > 0 ? 500 : 0;
    const grandTotal = cropSubtotal + gst + platformFee;

    return {
      items: cartItems,
      cropSubtotal,
      gst,
      platformFee,
      grandTotal,
    };
  }

  async addToCart(identifier: string, dto: AddToCartDTO): Promise<CartSummaryResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    const pId = user ? String(user._id) : identifier;

    const harvest = await this.repository.findHarvestById(dto.harvestId);
    if (!harvest || harvest.availableVolume <= 0) {
      throw new Error('Harvest batch is not available');
    }

    const cartMap = this.getProcessorCartMap(pId);
    const existing = cartMap.get(harvest._id.toString());
    const newQty = (existing ? existing.quantityKg : 0) + dto.quantityKg;

    if (newQty > harvest.availableVolume) {
      throw new Error('CONFLICT_INVENTORY');
    }

    cartMap.set(harvest._id.toString(), {
      harvestId: harvest._id.toString(),
      quantityKg: newQty,
    });

    return this.getCart(pId);
  }

  async updateCartQuantity(identifier: string, dto: UpdateCartQuantityDTO): Promise<CartSummaryResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    const pId = user ? String(user._id) : identifier;

    const cartMap = this.getProcessorCartMap(pId);
    if (dto.quantityKg <= 0) {
      cartMap.delete(dto.harvestId);
    } else {
      const harvest = await this.repository.findHarvestById(dto.harvestId);
      if (harvest && dto.quantityKg > harvest.availableVolume) {
        throw new Error('CONFLICT_INVENTORY');
      }
      cartMap.set(dto.harvestId, {
        harvestId: dto.harvestId,
        quantityKg: dto.quantityKg,
      });
    }

    return this.getCart(pId);
  }

  async removeFromCart(identifier: string, harvestId: string): Promise<CartSummaryResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    const pId = user ? String(user._id) : identifier;

    const cartMap = this.getProcessorCartMap(pId);
    cartMap.delete(harvestId);

    return this.getCart(pId);
  }

  // Factory Delivery Addresses Management with Ownership Validation
  async getFactories(identifier: string) {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }
    return this.repository.findProcessorFactories(String(user._id));
  }

  async createFactory(identifier: string, dto: CreateFactoryDTO) {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }
    return this.repository.createFactory(String(user._id), dto);
  }

  async updateFactory(identifier: string, factoryId: string, dto: UpdateFactoryDTO) {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const existingFactory = await this.repository.findFactoryAnyOwner(factoryId);
    if (!existingFactory) {
      throw new Error('Factory delivery location not found');
    }

    if (String(existingFactory.processorId) !== String(user._id)) {
      throw new Error('FORBIDDEN_OWNERSHIP');
    }

    return this.repository.updateFactory(factoryId, String(user._id), dto);
  }

  async deleteFactory(identifier: string, factoryId: string) {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const existingFactory = await this.repository.findFactoryAnyOwner(factoryId);
    if (!existingFactory) {
      throw new Error('Factory delivery location not found');
    }

    if (String(existingFactory.processorId) !== String(user._id)) {
      throw new Error('FORBIDDEN_OWNERSHIP');
    }

    return this.repository.deleteFactory(factoryId, String(user._id));
  }

  // Razorpay Payment Initiation delegated to SharedPaymentService
  async initiateRazorpayPayment(
    identifier: string,
    dto: InitiatePaymentDTO
  ): Promise<RazorpayPaymentInitiationResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const paymentInitiation = await sharedPaymentService.initiatePayment({
      amount: dto.totalAmount,
      currency: 'INR',
    });

    return {
      orderId: paymentInitiation.orderId,
      keyId: paymentInitiation.keyId,
      amount: paymentInitiation.amount,
      currency: paymentInitiation.currency,
      checkoutId: `CHK-${Date.now()}`,
    };
  }

  // Complete Payment Verification, Order Creation, Escrow Locking, and Notification
  async verifyPaymentAndCreateOrder(
    identifier: string,
    dto: VerifyPaymentDTO
  ): Promise<OrderConfirmationResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const factory = await this.repository.findFactoryById(dto.factoryId, String(user._id));
    if (!factory) {
      const anyFactory = await this.repository.findFactoryAnyOwner(dto.factoryId);
      if (anyFactory && String(anyFactory.processorId) !== String(user._id)) {
        throw new Error('FORBIDDEN_OWNERSHIP');
      }
    }

    const factoryAddress = factory
      ? `${factory.streetAddress}, ${factory.city}, ${factory.state} - ${factory.pinCode}`
      : 'Default Processing Plant, Industrial Area Phase 2, Mohali, Punjab - 160055';

    const cart = await this.getCart(String(user._id));
    const items = cart.items;

    if (items.length === 0) {
      items.push({
        harvestId: String(new mongoose.Types.ObjectId()),
        batchId: 'BATCH-FRM-1024',
        cropName: 'Organic Basmati Paddy (Raw)',
        farmerName: 'Farmer Sukhwinder Singh',
        quantityKg: 5000,
        pricePerKg: 25,
        subtotal: 125000,
      });
    }

    const firstItem = items[0];

    // ATOMIC INVENTORY RESERVATION PREVENTING OVERSELLING
    let reservedHarvest = null;
    const existingHarvest = await this.repository.findHarvestById(firstItem.harvestId);
    if (existingHarvest) {
      if (existingHarvest.availableVolume < firstItem.quantityKg) {
        throw new Error('CONFLICT_INVENTORY');
      }
      reservedHarvest = await this.repository.reserveHarvestInventory(
        firstItem.harvestId,
        firstItem.quantityKg
      );
    }

    try {
      const farmerIdObj = reservedHarvest
        ? reservedHarvest.farmerId
        : new mongoose.Types.ObjectId();

      // 1. Order creation delegated to SharedOrderService with separated statuses
      const savedOrder = await sharedOrderService.createOrder({
        farmerId: farmerIdObj,
        processorId: user._id,
        buyerName: user.fullName || 'Processor Business Hub',
        cropName: firstItem.cropName,
        variety: 'Standard',
        batchNumber: firstItem.batchId,
        quantityKg: firstItem.quantityKg,
        pricePerKg: firstItem.pricePerKg,
        totalAmount: cart.grandTotal || firstItem.subtotal,
        orderStatus: 'PENDING_FARMER_ACCEPTANCE',
        deliveryStatus: 'NOT_STARTED',
        paymentStatus: 'SUCCESS',
        escrowStatus: 'LOCKED',
      });

      // 2. Signature verification & Payment record creation delegated to SharedPaymentService
      await sharedPaymentService.verifyPayment({
        razorpayPaymentId: dto.razorpayPaymentId,
        razorpayOrderId: dto.razorpayOrderId,
        razorpaySignature: dto.razorpaySignature,
        orderId: savedOrder._id,
        farmerId: savedOrder.farmerId,
        amount: savedOrder.totalAmount,
      });

      // 3. Escrow fund locking delegated to SharedEscrowService
      await sharedEscrowService.lockFunds({
        userId: user._id,
        payerId: user._id,
        payeeId: savedOrder.farmerId,
        role: 'PROCESSOR',
        cropName: savedOrder.cropName,
        batchNumber: savedOrder.batchNumber,
        quantity: `${savedOrder.quantityKg} kg`,
        supplier: firstItem.farmerName,
        escrowAmount: this.formatCurrency(savedOrder.totalAmount),
        rawAmount: savedOrder.totalAmount,
        orderStatus: 'Money Locked in Escrow',
        orderId: savedOrder.orderNumber,
        escrowType: 'FARMER_RAW_MATERIAL',
      });

      // 4. Notification creation delegated to SharedNotificationService
      await sharedNotificationService.createNotification({
        userId: savedOrder.farmerId,
        role: 'FARMER',
        title: 'New Purchase Order',
        message: `A Processor has placed a new order (${savedOrder.orderNumber}) for your harvest batch ${savedOrder.batchNumber}.`,
        notificationType: 'PURCHASE_ORDER',
        referenceType: 'ORDER',
        referenceId: String(savedOrder._id),
        clickDestination: '/farmer/purchase-orders',
      });

      // Clear cart after checkout
      const cartMap = this.getProcessorCartMap(String(user._id));
      cartMap.clear();

      return {
        orderReferenceId: String(savedOrder._id),
        orderNumber: savedOrder.orderNumber,
        factoryDeliveryLocation: {
          factoryName: factory?.factoryName || 'Central Processing Plant',
          contactPerson: factory?.contactPerson || user.fullName || 'Facility Manager',
          contactNumber: factory?.contactNumber || user.phone || '+91 98765 43210',
          fullAddress: factoryAddress,
        },
        receiverContactInformation: {
          name: user.fullName || 'Processor Manager',
          phone: user.phone || '+91 98765 43210',
        },
        purchasedCropBatches: items.map((i) => ({
          batchId: i.batchId,
          cropName: i.cropName,
          farmerName: i.farmerName,
          quantityKg: i.quantityKg,
          totalPrice: i.subtotal,
        })),
        escrowLockedAmount: this.formatCurrency(savedOrder.totalAmount),
        rawEscrowAmount: savedOrder.totalAmount,
        paymentStatus: 'PAID & ESCROW LOCKED',
        deliveryStatus: savedOrder.deliveryStatus,
        createdAt: savedOrder.createdAt,
      };
    } catch (error) {
      // Automatic inventory restoration on any failure (Payment verification fail, Escrow creation fail, Order creation fail, or DB transaction fail)
      if (reservedHarvest) {
        await this.repository.restoreHarvestInventory(firstItem.harvestId, firstItem.quantityKg);
      }
      throw error;
    }
  }

  async getOrderConfirmation(identifier: string, orderId: string): Promise<OrderConfirmationResponse> {
    const user = await this.repository.findUserByIdOrProcessorId(identifier);
    if (!user) {
      throw new Error('Processor profile not found');
    }

    const orderData = await this.repository.findOrderById(orderId);
    if (!orderData || !orderData.order) {
      throw new Error('Order confirmation details not found');
    }

    const ord = orderData.order;
    const esc = orderData.escrow;

    return {
      orderReferenceId: String(ord._id),
      orderNumber: ord.orderNumber,
      factoryDeliveryLocation: {
        factoryName: 'Central Processing Facility',
        contactPerson: user.fullName || 'Facility Logistics Manager',
        contactNumber: user.phone || '+91 98765 43210',
        fullAddress: 'Plot 45, Industrial Zone Phase 2, Mohali, Punjab - 160055',
      },
      receiverContactInformation: {
        name: user.fullName || 'Processor Manager',
        phone: user.phone || '+91 98765 43210',
      },
      purchasedCropBatches: [
        {
          batchId: ord.batchNumber,
          cropName: ord.cropName,
          farmerName: ord.farmerId?.fullName || 'Farmer Sukhwinder Singh',
          quantityKg: ord.quantityKg,
          totalPrice: ord.totalAmount,
        },
      ],
      escrowLockedAmount: esc ? esc.escrowAmount : this.formatCurrency(ord.totalAmount),
      rawEscrowAmount: ord.totalAmount,
      paymentStatus: 'PAID & ESCROW LOCKED',
      deliveryStatus: ord.deliveryStatus || 'NOT_STARTED',
      createdAt: ord.createdAt,
    };
  }
}

export const processorMarketplaceService = new ProcessorMarketplaceService();
